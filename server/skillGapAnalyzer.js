// =====================================================
// UNIVERSAL SKILL + CAREER ANALYZER
// =====================================================


// =====================================================
// SKILL DATABASE
// =====================================================

const skillAliases = {

    // -----------------------------
    // IT
    // -----------------------------

    "HTML": [
        "html",
        "html5"
    ],

    "CSS": [
        "css",
        "css3"
    ],

    "JavaScript": [
        "javascript",
        "java script"
    ],

    "Python": [
        "python"
    ],

    "Java": [
        "java"
    ],

    "C++": [
        "c++",
        "cpp"
    ],

    "React": [
        "react",
        "react.js",
        "reactjs"
    ],

    "Node.js": [
        "node.js",
        "nodejs",
        "node js"
    ],

    "Express.js": [
        "express",
        "express.js",
        "expressjs"
    ],

    "MySQL": [
        "mysql"
    ],

    "SQL": [
        "sql",
        "structured query language"
    ],

    "MongoDB": [
        "mongodb",
        "mongo db"
    ],

    "Git": [
        "git",
        "github",
        "gitlab"
    ],

    "API": [
        "api",
        "rest api",
        "restful api"
    ],


    // -----------------------------
    // BUSINESS
    // -----------------------------

    "Excel": [
        "excel",
        "ms excel",
        "microsoft excel"
    ],

    "Tally": [
        "tally",
        "tally erp",
        "tally prime"
    ],

    "GST": [
        "gst",
        "goods and services tax"
    ],

    "Accounting": [
        "accounting",
        "accounts",
        "book keeping",
        "bookkeeping"
    ],

    "Finance": [
        "finance",
        "financial analysis"
    ],


    // -----------------------------
    // MARKETING
    // -----------------------------

    "SEO": [
        "seo",
        "search engine optimization"
    ],

    "Digital Marketing": [
        "digital marketing"
    ],

    "Social Media Marketing": [
        "social media marketing",
        "social media"
    ],

    "Content Creation": [
        "content creation",
        "content writing",
        "content writer"
    ],


    // -----------------------------
    // DESIGN
    // -----------------------------

    "Canva": [
        "canva"
    ],

    "Figma": [
        "figma"
    ],

    "Photoshop": [
        "photoshop",
        "adobe photoshop"
    ],

    "Graphic Design": [
        "graphic design",
        "graphic designing"
    ],

    "UI/UX": [
        "ui/ux",
        "ui ux",
        "user interface",
        "user experience"
    ],


    // -----------------------------
    // EDUCATION
    // -----------------------------

    "Teaching": [
        "teaching",
        "teacher",
        "taught",
        "classroom"
    ],

    "Lesson Planning": [
        "lesson planning",
        "lesson plan"
    ],

    "Training": [
        "training",
        "trainer"
    ],


    // -----------------------------
    // QUALITY / JEWELLERY
    // -----------------------------

    "Quality Control": [
        "quality control",
        "quality checking",
        "quality checker",
        "quality inspection",
        "quality inspector"
    ],

    "Quality Assurance": [
        "quality assurance",
        "quality assurance"
    ],

    "Diamond Quality": [
        "diamond quality",
        "diamond quality checker",
        "diamond checking",
        "diamond grading"
    ],

    "Diamond Grading": [
        "diamond grading",
        "diamond grader",
        "diamond grading knowledge"
    ],

    "Jewellery": [
        "jewellery",
        "jewelry",
        "jewellery industry",
        "jewelry industry"
    ],

    "Metal Quality": [
        "metal quality",
        "metal checking",
        "metal quality checker",
        "metal inspection"
    ],

    "Inspection": [
        "inspection",
        "inspecting",
        "inspected"
    ],

    "Accuracy": [
        "accuracy",
        "accurate"
    ],

    "Attention to Detail": [
        "attention to detail",
        "detail oriented",
        "detail-oriented"
    ],


    // -----------------------------
    // SALES
    // -----------------------------

    "Sales": [
        "sales",
        "sales executive",
        "sales representative"
    ],

    "Customer Service": [
        "customer service",
        "customer support",
        "client service"
    ],

    "Communication": [
        "communication",
        "communication skills"
    ],


    // -----------------------------
    // HR
    // -----------------------------

    "Recruitment": [
        "recruitment",
        "recruiting",
        "recruiter"
    ],

    "Human Resources": [
        "human resources",
        "human resource",
        "hr"
    ],


    // -----------------------------
    // SOFT SKILLS
    // -----------------------------

    "Problem Solving": [
        "problem solving",
        "problem-solving"
    ],

    "Decision Making": [
        "decision making",
        "decision-making"
    ],

    "Leadership": [
        "leadership",
        "leader"
    ],

    "Teamwork": [
        "teamwork",
        "team work",
        "team player"
    ],

    "Time Management": [
        "time management"
    ],

    "Positive Attitude": [
        "positive attitude"
    ]
};


// =====================================================
// CAREER PROFILES
// =====================================================

const careerProfiles = {

    "Frontend Developer": {
        skills: [
            "HTML",
            "CSS",
            "JavaScript",
            "React",
            "Git"
        ],

        keywords: [
            "frontend developer",
            "front end developer",
            "web developer",
            "website developer"
        ]
    },


    "Backend Developer": {
        skills: [
            "Node.js",
            "Express.js",
            "MySQL",
            "SQL",
            "API",
            "Git"
        ],

        keywords: [
            "backend developer",
            "back end developer",
            "server developer"
        ]
    },


    "Full Stack Developer": {
        skills: [
            "HTML",
            "CSS",
            "JavaScript",
            "React",
            "Node.js",
            "MySQL",
            "Git"
        ],

        keywords: [
            "full stack",
            "fullstack developer"
        ]
    },


    "Python Developer": {
        skills: [
            "Python",
            "SQL",
            "API",
            "Git"
        ],

        keywords: [
            "python developer"
        ]
    },


    "Data Analyst": {
        skills: [
            "Python",
            "SQL",
            "Excel"
        ],

        keywords: [
            "data analyst",
            "data analysis"
        ]
    },


    "Accountant": {
        skills: [
            "Accounting",
            "Excel",
            "Tally",
            "GST"
        ],

        keywords: [
            "accountant",
            "accounts executive",
            "account assistant",
            "accounting"
        ]
    },


    "Teacher / Educator": {
        skills: [
            "Teaching",
            "Communication",
            "Training"
        ],

        keywords: [
            "teacher",
            "teaching",
            "educator",
            "school teacher",
            "faculty"
        ]
    },


    "Diamond Quality Checker": {
        skills: [
            "Diamond Quality",
            "Diamond Grading",
            "Quality Control",
            "Inspection",
            "Accuracy",
            "Attention to Detail"
        ],

        keywords: [
            "diamond quality checker",
            "diamond quality",
            "diamond checker",
            "diamond grading",
            "diamond quality and metal"
        ]
    },


    "Quality Control Executive": {
        skills: [
            "Quality Control",
            "Quality Assurance",
            "Inspection",
            "Accuracy",
            "Attention to Detail",
            "Decision Making"
        ],

        keywords: [
            "quality checker",
            "quality control",
            "quality inspector",
            "quality executive",
            "quality inspection"
        ]
    },


    "Jewellery Quality Executive": {
        skills: [
            "Jewellery",
            "Diamond Quality",
            "Metal Quality",
            "Quality Control",
            "Inspection",
            "Accuracy"
        ],

        keywords: [
            "jewellery",
            "jewelry",
            "diamond",
            "metal quality",
            "jewellery quality"
        ]
    },


    "Sales Executive": {
        skills: [
            "Sales",
            "Communication",
            "Customer Service",
            "Teamwork"
        ],

        keywords: [
            "sales executive",
            "sales representative",
            "sales associate"
        ]
    },


    "Customer Service Executive": {
        skills: [
            "Customer Service",
            "Communication",
            "Problem Solving",
            "Teamwork"
        ],

        keywords: [
            "customer service",
            "customer support",
            "customer care"
        ]
    },


    "HR Executive": {
        skills: [
            "Human Resources",
            "Recruitment",
            "Communication",
            "Teamwork"
        ],

        keywords: [
            "hr executive",
            "human resource",
            "recruitment",
            "hr"
        ]
    },


    "Digital Marketing Executive": {
        skills: [
            "Digital Marketing",
            "SEO",
            "Social Media Marketing",
            "Content Creation",
            "Canva"
        ],

        keywords: [
            "digital marketing",
            "marketing executive",
            "digital marketer"
        ]
    },


    "Graphic Designer": {
        skills: [
            "Canva",
            "Figma",
            "Photoshop",
            "Graphic Design"
        ],

        keywords: [
            "graphic designer",
            "graphic design"
        ]
    }
};


// =====================================================
// NORMALIZE
// =====================================================

function normalizeText(text) {

    return String(text || "")
        .toLowerCase()
        .replace(/\r/g, " ")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


// =====================================================
// SKILL DETECTION
// =====================================================

function detectSkills(resumeText) {

    const text =
        normalizeText(resumeText);

    const detected = [];


    for (
        const [skill, aliases]
        of Object.entries(skillAliases)
    ) {

        for (
            const alias of aliases
        ) {

            if (
                text.includes(
                    alias.toLowerCase()
                )
            ) {

                detected.push(skill);

                break;
            }
        }
    }


    return [
        ...new Set(detected)
    ];
}


// =====================================================
// CAREER DETECTION
// =====================================================

function detectCareerRoles(resumeText) {

    const text =
        normalizeText(resumeText);

    const detectedSkills =
        detectSkills(resumeText);


    const results = [];


    for (
        const [role, profile]
        of Object.entries(careerProfiles)
    ) {

        const matchedSkills =
            profile.skills.filter(
                skill =>
                    detectedSkills.includes(skill)
            );


        const missingSkills =
            profile.skills.filter(
                skill =>
                    !detectedSkills.includes(skill)
            );


        const keywordMatches =
            profile.keywords.filter(
                keyword =>
                    text.includes(
                        keyword.toLowerCase()
                    )
            );


        // Skill score
        const skillScore =
            profile.skills.length > 0
                ? (
                    matchedSkills.length /
                    profile.skills.length
                ) * 70
                : 0;


        // Resume role/title score
        const keywordScore =
            keywordMatches.length > 0
                ? 30
                : 0;


        const matchPercentage =
            Math.min(
                100,
                Math.round(
                    skillScore +
                    keywordScore
                )
            );


        results.push({

            role,

            matchPercentage,

            matchedSkills,

            missingSkills,

            keywordMatches
        });
    }


    results.sort(
        (a, b) =>
            b.matchPercentage -
            a.matchPercentage
    );


    return results;
}


// =====================================================
// MAIN ANALYZER
// =====================================================

function generateSkillGap(resumeText) {

    const detectedSkills =
        detectSkills(resumeText);


    const careerRoles =
        detectCareerRoles(resumeText);


    const bestRole =
        careerRoles.length > 0
            ? careerRoles[0]
            : null;


    if (!bestRole) {

        return {

            detectedSkills,

            recommendedRole:
                "Career not detected yet",

            roleMatchPercentage: 0,

            matchedSkills: [],

            missingSkills: [],

            skillGapPercentage: 0,

            careerSuggestions: []
        };
    }


    const careerSuggestions =
        careerRoles
            .filter(
                role =>
                    role.matchPercentage > 0
            )
            .slice(0, 5)
            .map(
                role => ({

                    role:
                        role.role,

                    matchPercentage:
                        role.matchPercentage,

                    matchedSkills:
                        role.matchedSkills,

                    missingSkills:
                        role.missingSkills
                })
            );


    return {

        detectedSkills,

        recommendedRole:
            bestRole.role,

        roleMatchPercentage:
            bestRole.matchPercentage,

        matchedSkills:
            bestRole.matchedSkills,

        missingSkills:
            bestRole.missingSkills,

        skillGapPercentage:
            100 -
            bestRole.matchPercentage,

        careerSuggestions,

        allCareerRoles:
            careerRoles
    };
}


module.exports = {

    detectSkills,

    detectCareerRoles,

    generateSkillGap
};