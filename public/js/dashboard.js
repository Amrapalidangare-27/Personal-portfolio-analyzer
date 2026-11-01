// =====================================================
// DASHBOARD.JS  (public/js/dashboard.js)
// Skill Progress Tracker ab skillTracker.js mein hai.
// =====================================================

// =====================================================
// SESSION + PER-USER DATA  (sabse upar rehna chahiye)
// - login nahi hai to login page par bhejta hai
// - har request ke saath x-user-id header bhejta hai
// - browser mein saved data user ke hisaab se alag key mein rakhta hai
// =====================================================
var CURRENT_USER = null;
try { CURRENT_USER = JSON.parse(localStorage.getItem("user") || "null"); } catch (e) { CURRENT_USER = null; }

if (!CURRENT_USER || !CURRENT_USER.id) {
    window.location.replace("/index.html");
} else {
    localStorage.setItem("userId", String(CURRENT_USER.id));
    localStorage.setItem("userName", CURRENT_USER.name || "User");
    localStorage.setItem("userEmail", CURRENT_USER.email || "");
}

// "analysisData" jaisi keys ko user ke naam se alag karta hai: analysisData:5
function uKey(name) {
    return name + ":" + (CURRENT_USER ? CURRENT_USER.id : "guest");
}

// /auth/* aur /feature/* ki har request mein user ki id jodta hai
(function () {
    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
        try {
            const url = typeof input === "string" ? input : (input && input.url) || "";
            if (CURRENT_USER && /(^|\/\/[^/]+)\/(auth|feature)\//.test(url)) {
                init = Object.assign({}, init);
                const headers = new Headers(init.headers || {});
                if (!headers.has("x-user-id")) headers.set("x-user-id", String(CURRENT_USER.id));
                init.headers = headers;
            }
        } catch (e) { /* ignore */ }
        return originalFetch.call(this, input, init);
    };
})();

function logoutUser() {
    ["user", "userId", "userName", "userEmail"].forEach(k => localStorage.removeItem(k));
    window.location.replace("/index.html");
}

let realATSScore = 0;
let skillGapData = {};

const ATS_MAX = {
    contact: 10, summary: 10, skills: 15, education: 10,
    experience: 20, projects: 10, certifications: 5, keywords: 10
};

const ATS_LABEL = {
    contact: "Contact Information", summary: "Professional Summary", skills: "Skills",
    education: "Education", experience: "Experience", projects: "Projects",
    certifications: "Certifications", keywords: "Keywords"
};

const ATS_TIP = {
    contact: "Add a professional email and phone number.",
    summary: "Add a short professional summary or career objective.",
    skills: "Add a Skills section with relevant technical skills.",
    education: "List your degree, college and year clearly.",
    experience: "Add work experience or internship with responsibilities.",
    projects: "Add 2-3 projects with what you built and the technologies used.",
    certifications: "Add certificates or training courses.",
    keywords: "Use role-specific keywords and action words (developed, managed, built)."
};


// =====================================================
// HELPERS
// =====================================================

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value == null ? "" : value;
    return div.innerHTML;
}

function getSavedAnalysis() {
    try {
        return JSON.parse(localStorage.getItem(uKey("analysisData")) || "{}");
    } catch (e) {
        return {};
    }
}


// =====================================================
// UPLOAD RESUME
// =====================================================

async function uploadResume() {

    const fileInput = document.getElementById("resumeFile");
    const status = document.getElementById("uploadStatus");

    if (!fileInput || !fileInput.files.length) {
        if (status) status.innerHTML = "⚠️ Please select a resume first.";
        return;
    }

    const file = fileInput.files[0];

    if (file.size > 5 * 1024 * 1024) {
        if (status) status.innerHTML = "⚠️ File size must be less than 5MB.";
        return;
    }

    if (status) status.innerHTML = "⏳ Analyzing your resume...";

    const formData = new FormData();
    formData.append("resume", file);

    try {
        const response = await fetch("/auth/upload", { method: "POST", body: formData });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Upload failed.");
        }

        // Page refresh ke baad bhi data dikhe, aur portfolio/interview/chatbot use kar sakein
        data.uploadedAt = new Date().toLocaleString();
        if (data.skillGap) delete data.skillGap.allCareerRoles;
        localStorage.setItem(uKey("analysisData"), JSON.stringify(data));

        showAnalysis(data);

        if (status) status.innerHTML = "✅ Resume analyzed successfully!";

    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        if (status) status.innerHTML = "❌ " + error.message;
    }
}


function showAnalysis(data) {
    realATSScore = Number(data.atsScore) || 0;
    skillGapData = data.skillGap || {};

    updateATS(realATSScore, data.atsDetails);
    updateSkillGap();
    updateCareerSuggestions(data.careerSuggestions || skillGapData.careerSuggestions || []);
    updateResumeSuggestions(data.resumeSuggestions || []);
    updateResumeInfo(data);
    updateOverview();
}


// =====================================================
// ATS UPDATE + BREAKDOWN
// =====================================================

const ATS_COLOR = {
    contact: "#7c5cff", summary: "#b13bd9", skills: "#3fa9ff", education: "#a99cff",
    experience: "#3ddc97", projects: "#ffb84d", certifications: "#5aa0ff", keywords: "#f08ad8"
};

const ATS_SHORT = {
    contact: "Contact", summary: "Summary", skills: "Skills", education: "Education",
    experience: "Experience", projects: "Projects", certifications: "Certificates", keywords: "Keywords"
};


function updateATS(score, details) {

    const percentage = document.getElementById("atsPercentage");
    const scoreElement = document.getElementById("atsScore");

    if (percentage) percentage.innerText = score + "%";
    if (scoreElement) scoreElement.innerText = score;

    const status = document.querySelector(".ats-status");
    if (status) {
        status.innerText =
            score >= 80 ? "Excellent! Your resume is ATS friendly." :
            score >= 60 ? "Good score. A few improvements can make it better." :
            "Needs improvement. Check the tips below.";
    }

    const chart = document.getElementById("atsChart");
    if (!chart || typeof Chart === "undefined") return;

    if (window.atsChartInstance) window.atsChartInstance.destroy();

    const keys = Object.keys(ATS_MAX);
    const hasDetails = details && typeof details === "object";

    // Har section ek alag colour ka hissa; baaki khali hissa halka grey
    const labels = hasDetails ? keys.map(k => ATS_SHORT[k]).concat("Remaining") : ["ATS Score", "Remaining"];
    const values = hasDetails ? keys.map(k => Number(details[k]) || 0).concat(Math.max(0, 100 - score)) : [score, 100 - score];
    const colors = hasDetails ? keys.map(k => ATS_COLOR[k]).concat("rgba(255,255,255,0.12)") : ["#8b5cf6", "rgba(255,255,255,0.12)"];

    window.atsChartInstance = new Chart(chart, {
        type: "doughnut",
        data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, spacing: 2, borderRadius: 5 }] },
        options: {
            responsive: true,
            cutout: "68%",
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const key = keys[ctx.dataIndex];
                            return key
                                ? ` ${ATS_LABEL[key]}: ${ctx.raw}/${ATS_MAX[key]}`
                                : ` Remaining: ${ctx.raw}`;
                        }
                    }
                }
            }
        }
    });

    if (hasDetails) renderATSBreakdown(details);
}


function renderATSBreakdown(details) {

    let box = document.getElementById("atsBreakdown");

    if (!box) {
        const card = document.querySelector(".ats-card");
        if (!card) return;
        box = document.createElement("div");
        box.id = "atsBreakdown";
        card.appendChild(box);
    }

    const good = [];
    const improve = [];

    const legend = Object.keys(ATS_MAX).map(key => {
        const value = Number(details[key]) || 0;
        const ratio = value / ATS_MAX[key];

        if (ratio >= 0.99) good.push(ATS_SHORT[key]);
        else if (ratio < 0.6) improve.push(key);

        return `
            <div class="ats-legend-item ${value === 0 ? "zero" : ""}">
                <span class="ats-dot" style="background:${ATS_COLOR[key]}"></span>
                <span class="ats-legend-name">${ATS_SHORT[key]}</span>
                <strong>${value}/${ATS_MAX[key]}</strong>
            </div>`;
    }).join("");

    box.innerHTML = `
        <div class="ats-legend">${legend}</div>

        <p class="ats-good-line">
            ✅ <b>Strong:</b> ${good.length ? good.join(", ") : "none yet"}
        </p>

        <details class="ats-tips">
            <summary>💡 How to improve (${improve.length})</summary>
            ${improve.length
                ? "<ul>" + improve.map(k => `<li>${escapeHTML(ATS_TIP[k])}</li>`).join("") + "</ul>"
                : "<p>All sections look strong. Keep adding measurable achievements.</p>"}
        </details>`;

    const hidden = document.getElementById("atsDetails");
    if (hidden) {
        hidden.innerHTML = Object.keys(ATS_MAX)
            .map(k => `<div>${ATS_LABEL[k]}: ${details[k]}/${ATS_MAX[k]}</div>`).join("");
    }
}


// =====================================================
// SKILL GAP
// =====================================================

function updateSkillGap() {

    const role = document.getElementById("recommendedRole");
    const match = document.getElementById("roleMatchPercentage");
    const bar = document.getElementById("roleMatchBar");
    const matched = document.getElementById("matchedSkills");
    const missing = document.getElementById("missingSkills");
    const gap = document.getElementById("skillGapPercentage");

    const pct = Number(skillGapData.roleMatchPercentage) || 0;

    if (role) role.innerText = skillGapData.recommendedRole || "Not detected";
    if (match) match.innerText = pct + "%";
    if (bar) bar.style.width = pct + "%";
    if (matched) matched.innerHTML = createSkillList(skillGapData.matchedSkills);
    if (missing) missing.innerHTML = createSkillList(skillGapData.missingSkills);
    if (gap) gap.innerText = (Number(skillGapData.skillGapPercentage) || 0) + "%";
}


function createSkillList(skills) {
    if (!Array.isArray(skills) || skills.length === 0) {
        return `<span>None detected</span>`;
    }
    return skills.map(s => `<span class="skill-tag">${escapeHTML(s)}</span>`).join("");
}


// =====================================================
// CAREER SUGGESTIONS (match %, matched, missing, next skills)
// =====================================================

function updateCareerSuggestions(list) {

    const container = document.getElementById("careerSuggestions");
    if (!container) return;

    if (!Array.isArray(list) || list.length === 0) {
        container.innerHTML = "<p>No career suggestions yet. Add more skills to your resume.</p>";
        return;
    }

    container.innerHTML = list.map((c, i) => {
        const missing = Array.isArray(c.missingSkills) ? c.missingSkills : [];
        const matched = Array.isArray(c.matchedSkills) ? c.matchedSkills : [];
        const pct = Number(c.matchPercentage) || 0;

        return `
        <div class="career-option ${i === 0 ? "best" : ""}">
            <div class="career-option-top">
                <strong>${i === 0 ? "⭐ " : ""}${escapeHTML(c.role)}</strong>
                <span>${pct}%</span>
            </div>
            <div class="match-progress"><div class="match-progress-fill" style="width:${pct}%"></div></div>
            <p class="career-line"><b>Matched:</b> ${matched.length ? matched.map(escapeHTML).join(", ") : "None"}</p>
            <p class="career-line"><b>Missing:</b> ${missing.length ? missing.map(escapeHTML).join(", ") : "None"}</p>
            <p class="career-line"><b>Learn next:</b> ${missing.length ? missing.slice(0, 3).map(escapeHTML).join(", ") : "You are a strong match!"}</p>
        </div>`;
    }).join("");
}


// =====================================================
// RESUME IMPROVEMENT
// =====================================================

function updateResumeSuggestions(suggestions) {

    const container = document.getElementById("atsSuggestions");
    if (!container) return;

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
        container.innerHTML = `<div class="improvement-item">Your resume looks good. Keep improving it with role-specific keywords and achievements.</div>`;
        return;
    }

    container.innerHTML = suggestions.map((s, i) => `
        <div class="improvement-item">
            <div class="improvement-number">${i + 1}</div>
            <div class="improvement-text">${escapeHTML(s)}</div>
        </div>`).join("");
}


// =====================================================
// RESUME INFORMATION
// =====================================================

function updateResumeInfo(data) {

    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    };

    set("fileName", data.originalFilename || "-");
    set("fileType", data.fileType || "-");
    set("fileSize", data.fileSize ? (data.fileSize / 1024).toFixed(1) + " KB" : "-");
    set("uploadTime", data.uploadedAt || new Date().toLocaleString());
}


// =====================================================
// OVERVIEW CARDS
// =====================================================

function updateOverview() {

    const roleMatch = Number(skillGapData.roleMatchPercentage || 0);

    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    };

    set("overviewATS", realATSScore + "%");
    set("overviewSkillMatch", roleMatch + "%");
    set("overviewResumeStrength",
        realATSScore >= 80 ? "Strong" : realATSScore >= 60 ? "Good" : "Needs Work");
    set("overviewCareerReadiness", Math.round((realATSScore + roleMatch) / 2) + "%");
}


// =====================================================
// AI CHATBOT (backend fallback ke saath)
// =====================================================

async function chatbot() {

    const question = document.getElementById("question");
    const answer = document.getElementById("answer");

    if (!question || !answer) return;

    const userQuestion = question.value.trim();

    if (!userQuestion) {
        answer.innerText = "Please enter your question.";
        return;
    }

    answer.innerText = "🤖 Assistant is thinking...";

    try {
        const response = await fetch("/auth/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                question: userQuestion,
                resumeText: getSavedAnalysis().resumeText || ""
            })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Assistant failed.");

        answer.style.whiteSpace = "pre-line";
        answer.innerText = data.answer;

    } catch (error) {
        console.error(error);
        answer.innerText =
            "The assistant is not available right now. Please check your Resume Improvement and Skill Gap sections for guidance, or try again later.";
    }
}


// =====================================================
// PORTFOLIO SHARING
// =====================================================

async function sharePortfolio() {

    try {
        const analysis = getSavedAnalysis();

        if (!analysis.skillGap) {
            alert("Please upload and analyze your resume first.");
            return;
        }

        const response = await fetch("/auth/portfolio/share", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: localStorage.getItem("userName") || "User",
                email: localStorage.getItem("userEmail") || "",
                skills: analysis.skillGap.detectedSkills || [],
                careerRole: analysis.skillGap.recommendedRole || "Career Professional",
                atsScore: analysis.atsScore || 0,
                badges: window.getEarnedBadges ? await window.getEarnedBadges({ assumeShared: true }) : []
            })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Portfolio sharing failed.");

        const linkBox = document.getElementById("portfolioLinkBox");
        const linkInput = document.getElementById("portfolioShareLink");
        const openLink = document.getElementById("portfolioOpenLink");

        if (linkBox) linkBox.style.display = "block";
        if (linkInput) linkInput.value = data.shareUrl;
        if (openLink) openLink.href = data.shareUrl;

        localStorage.setItem(uKey("portfolioShared"), "1");
        if (window.refreshBadges) window.refreshBadges();

    } catch (error) {
        console.error("Portfolio sharing error:", error);
        alert("❌ " + error.message);
    }
}


function copyPortfolioLink() {

    const input = document.getElementById("portfolioShareLink");
    if (!input) return;

    navigator.clipboard.writeText(input.value)
        .then(() => alert("✅ Portfolio link copied!"))
        .catch(() => {
            input.select();
            document.execCommand("copy");
            alert("✅ Portfolio link copied!");
        });
}


// =====================================================
// INTERVIEW PREPARATION
// =====================================================

function openInterviewModal() {
    const modal = document.getElementById("interviewModal");
    if (modal) modal.classList.add("show");
}

function closeInterviewModal() {
    const modal = document.getElementById("interviewModal");
    if (modal) modal.classList.remove("show");
}

async function generateInterviewQuestions() {

    const roleSelect = document.getElementById("targetRole");
    const selectedRole = roleSelect ? roleSelect.value : "";
    const message = document.getElementById("interviewMessage");
    const questionsList = document.getElementById("questionsList");
    const selectedRoleText = document.getElementById("selectedRoleText");

    if (!selectedRole) {
        alert("Please select a target role.");
        return;
    }

    if (message) message.innerText = "🤖 Generating interview questions...";
    if (questionsList) questionsList.innerHTML = "";

    closeInterviewModal();

    try {
        const analysis = getSavedAnalysis();

        const response = await fetch("/auth/interview/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                targetRole: selectedRole,
                skills: (analysis.skillGap && analysis.skillGap.detectedSkills) || [],
                resumeText: analysis.resumeText || ""
            })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Failed to generate questions.");

        if (selectedRoleText) selectedRoleText.innerText = `Preparing for ${selectedRole} interview`;

        if (Array.isArray(data.questions) && data.questions.length > 0) {

            if (message) {
                message.innerText = data.source === "AI"
                    ? "✨ AI-generated questions based on your role and skills:"
                    : "📚 Interview questions from the question bank:";
            }

            questionsList.innerHTML = data.questions.map((q, i) => `
                <div class="interview-question-card">
                    <span class="question-number">${i + 1}</span>
                    <span class="question-text">${escapeHTML(q)}</span>
                </div>`).join("");

        } else if (message) {
            message.innerText = "No questions were generated.";
        }

    } catch (error) {
        console.error("Interview generation error:", error);
        if (message) message.innerText = "❌ " + (error.message || "Unable to generate interview questions.");
    }
}


// =====================================================
// PAGE LOAD: naam dikhao + purana analysis wapas dikhao (refresh safe)
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    const name = localStorage.getItem("userName") || "User";
    const initial = name.charAt(0).toUpperCase();

    const welcome = document.querySelector(".topbar h1");
    if (welcome) welcome.textContent = `Welcome back, ${name} 👋`;

    document.querySelectorAll(".profile-avatar, .top-avatar").forEach(el => el.textContent = initial);
    document.querySelectorAll(".profile-info strong, .top-profile span").forEach(el => el.textContent = name);

    const saved = getSavedAnalysis();
    if (saved && saved.skillGap) showAnalysis(saved);
});


// =====================================================
// GLOBAL FUNCTIONS
// =====================================================

window.uploadResume = uploadResume;
window.chatbot = chatbot;
window.sharePortfolio = sharePortfolio;
window.copyPortfolioLink = copyPortfolioLink;
window.openInterviewModal = openInterviewModal;
window.closeInterviewModal = closeInterviewModal;
window.generateInterviewQuestions = generateInterviewQuestions;

// Logout button (sidebar)
document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("logoutBtn");
    if (btn) btn.addEventListener("click", function (e) { e.preventDefault(); logoutUser(); });
});
