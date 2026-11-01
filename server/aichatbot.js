// =====================================================
// AI CAREER ASSISTANT
// 1) Agar OPENAI_API_KEY hai aur credits chal rahe hain -> AI jawab deta hai
// 2) Nahi to rule-based jawab (resume analysis se) -> project kabhi nahi tootta
// =====================================================

const { calculateATSScore } = require("./atsAnalyzer");
const { generateSkillGap } = require("./skillGapAnalyzer");
const { generateResumeSuggestions } = require("./resumeImprovement");

let client = null;

try {
    if (process.env.OPENAI_API_KEY) {
        const OpenAI = require("openai");
        client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
} catch (error) {
    console.log("OpenAI not available, using rule-based assistant.");
    client = null;
}


async function askAI(question, resumeText = "") {

    if (client) {
        try {
            const response = await client.responses.create({
                model: "gpt-5.6",
                instructions:
                    "You are an AI Career Assistant for a Personal Portfolio Analyzer. " +
                    "Help with resume improvement, ATS score, career guidance, skill gap and interviews. " +
                    "Give clear, simple answers. Use the resume when available. Do not invent information.",
                input: `Resume:\n${resumeText}\n\nUser Question:\n${question}`
            });

            if (response && response.output_text) {
                return response.output_text;
            }
        } catch (error) {
            console.log("AI unavailable, using fallback:", error.message);
        }
    }

    return ruleBasedAnswer(question, resumeText);
}


function ruleBasedAnswer(question, resumeText) {

    const q = String(question || "").toLowerCase();
    const hasResume = String(resumeText || "").trim().length > 50;

    if (/^(hi|hello|hey)\b/.test(q)) {
        return "Hello! I can help with your resume, ATS score, skills to learn, career roles and interview preparation. What would you like to know?";
    }

    if (!hasResume) {
        return "Please upload and analyze your resume first. After that I can give answers based on your ATS score, skills and target career.";
    }

    const ats = calculateATSScore(resumeText);
    const gap = generateSkillGap(resumeText);
    const tips = generateResumeSuggestions(resumeText, ats.score, gap);

    const role = gap.recommendedRole;
    const missing = (gap.missingSkills || []).slice(0, 5);
    const have = (gap.detectedSkills || []).slice(0, 8);

    if (/(improve|better|suggest|fix|weak)/.test(q) && /resume|cv/.test(q)) {
        return `Your ATS score is ${ats.score}%. Focus on:\n` +
            tips.slice(0, 4).map((t, i) => `${i + 1}. ${t}`).join("\n");
    }

    if (/ats|score/.test(q)) {
        const d = ats.details;
        const weak = Object.entries({
            Contact: d.contact / 10, Summary: d.summary / 10, Skills: d.skills / 15,
            Education: d.education / 10, Experience: d.experience / 20,
            Projects: d.projects / 10, Certifications: d.certifications / 5, Keywords: d.keywords / 10
        }).filter(([, r]) => r < 0.5).map(([n]) => n);

        return `Your ATS score is ${ats.score}%.` +
            (weak.length ? ` Weak sections: ${weak.join(", ")}. Improve these first.` : " All sections look reasonably strong.");
    }

    if (/skill|learn|study|gap/.test(q)) {
        return missing.length
            ? `For ${role}, you already have: ${have.join(", ") || "few skills detected"}. Next, focus on: ${missing.join(", ")}.`
            : `Great! You already match the main skills for ${role}. Now build projects to prove them.`;
    }

    if (/career|role|job/.test(q)) {
        const others = (gap.careerSuggestions || []).slice(1, 4).map(c => `${c.role} (${c.matchPercentage}%)`);
        return `Your best match is ${role} (${gap.roleMatchPercentage}%).` +
            (others.length ? ` Other options: ${others.join(", ")}.` : "");
    }

    if (/interview/.test(q)) {
        return `Use the Interview Preparation section and choose ${role}. Revise: ${have.slice(0, 4).join(", ") || "your core skills"}, and prepare to explain your projects in simple words.`;
    }

    if (/project/.test(q)) {
        return `Build 2-3 projects related to ${role} using ${have.slice(0, 4).join(", ") || "your skills"}. Add them to your resume with what you built and the result.`;
    }

    return `Based on your resume: ATS score ${ats.score}%, best role ${role}. ` +
        `Ask me about "resume improvement", "skills to learn", "career", "interview" or "projects".`;
}

module.exports = { askAI };