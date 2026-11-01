// ======================================================
// CAREER ANALYZER
// PERSONAL PORTFOLIO ANALYZER
// ======================================================

function normalizeText(text) {
    return String(text || "").toLowerCase();
}


// ======================================================
// CAREER PROFILES
// ======================================================

const careerProfiles = [

    {
        role: "Frontend Developer",

        skills: [
            "html",
            "css",
            "javascript",
            "react",
            "angular",
            "bootstrap",
            "responsive design"
        ]
    },

    {
        role: "Backend Developer",

        skills: [
            "node.js",
            "node",
            "express",
            "mysql",
            "mongodb",
            "api",
            "rest api",
            "database"
        ]
    },

    {
        role: "Full Stack Developer",

        skills: [
            "html",
            "css",
            "javascript",
            "node.js",
            "express",
            "react",
            "mysql",
            "mongodb",
            "api"
        ]
    },

    {
        role: "Python Developer",

        skills: [
            "python",
            "django",
            "flask",
            "fastapi",
            "numpy",
            "pandas"
        ]
    },

    {
        role: "Data Analyst",

        skills: [
            "python",
            "pandas",
            "numpy",
            "sql",
            "excel",
            "power bi",
            "tableau",
            "statistics"
        ]
    },

    {
        role: "Machine Learning Engineer",

        skills: [
            "python",
            "numpy",
            "pandas",
            "scikit-learn",
            "machine learning",
            "tensorflow",
            "pytorch",
            "statistics"
        ]
    },

    {
        role: "QA / Automation Tester",

        skills: [
            "testing",
            "manual testing",
            "selenium",
            "java",
            "automation",
            "test cases",
            "junit",
            "api testing"
        ]
    },

    {
        role: "UI/UX Designer",

        skills: [
            "figma",
            "adobe xd",
            "ui design",
            "ux design",
            "wireframe",
            "prototype",
            "canva"
        ]
    }

];


// ======================================================
// GENERATE CAREER SUGGESTIONS
// ======================================================

function generateCareerSuggestions(resumeText) {

    const text = normalizeText(resumeText);

    const results = [];

    careerProfiles.forEach(function (career) {

        const matchedSkills = [];
        const missingSkills = [];

        career.skills.forEach(function (skill) {

            if (text.includes(skill.toLowerCase())) {

                matchedSkills.push(skill);

            } else {

                missingSkills.push(skill);

            }

        });

        const totalSkills = career.skills.length;

        const matchPercentage =
            totalSkills === 0
                ? 0
                : Math.round(
                    (matchedSkills.length / totalSkills) * 100
                );

        results.push({

            role: career.role,

            matchPercentage: matchPercentage,

            matchedSkills: matchedSkills,

            missingSkills: missingSkills

        });

    });


    // ==================================================
    // SORT BEST CAREER FIRST
    // ==================================================

    results.sort(function (a, b) {

        return b.matchPercentage - a.matchPercentage;

    });


    // ==================================================
    // TOP CAREER
    // ==================================================

    const recommendedCareer =
        results.length > 0
            ? results[0]
            : null;


    // ==================================================
    // RETURN RESULT
    // ==================================================

    return {

        recommendedRole:
            recommendedCareer
                ? recommendedCareer.role
                : "Career Not Detected",

        roleMatchPercentage:
            recommendedCareer
                ? recommendedCareer.matchPercentage
                : 0,

        matchedSkills:
            recommendedCareer
                ? recommendedCareer.matchedSkills
                : [],

        missingSkills:
            recommendedCareer
                ? recommendedCareer.missingSkills
                : [],

        allCareerSuggestions:
            results

    };

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    generateCareerSuggestions
};