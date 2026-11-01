// ======================================================
// CAREER SUGGESTION ANALYZER
// Personal Portfolio Analyzer
// ======================================================

function generateCareerSuggestions(resumeText) {

    const text = String(resumeText || "").toLowerCase();

    const roles = [
        {
            role: "Frontend Developer",
            keywords: [
                "html",
                "css",
                "javascript",
                "react",
                "angular",
                "frontend",
                "ui",
                "web design"
            ],
            description:
                "Builds user interfaces and responsive web applications.",
            skills: [
                "HTML",
                "CSS",
                "JavaScript",
                "Responsive Design",
                "React or Angular"
            ]
        },

        {
            role: "Backend Developer",
            keywords: [
                "node.js",
                "nodejs",
                "express",
                "java",
                "python",
                "api",
                "backend",
                "server",
                "rest api"
            ],
            description:
                "Develops server-side applications, APIs and backend systems.",
            skills: [
                "Node.js / Java / Python",
                "Express",
                "REST API",
                "Database",
                "Authentication"
            ]
        },

        {
            role: "Full Stack Developer",
            keywords: [
                "html",
                "css",
                "javascript",
                "node.js",
                "nodejs",
                "express",
                "mysql",
                "mongodb",
                "full stack",
                "react",
                "angular"
            ],
            description:
                "Works on both frontend and backend parts of web applications.",
            skills: [
                "HTML",
                "CSS",
                "JavaScript",
                "Frontend Framework",
                "Node.js / Backend",
                "Database",
                "REST API"
            ]
        },

        {
            role: "Data Analyst",
            keywords: [
                "python",
                "sql",
                "excel",
                "power bi",
                "tableau",
                "pandas",
                "numpy",
                "data analysis",
                "statistics"
            ],
            description:
                "Analyzes data and creates useful insights and reports.",
            skills: [
                "Python",
                "SQL",
                "Excel",
                "Statistics",
                "Power BI / Tableau",
                "Data Visualization"
            ]
        },

        {
            role: "Data Scientist",
            keywords: [
                "python",
                "machine learning",
                "machine-learning",
                "pandas",
                "numpy",
                "scikit-learn",
                "statistics",
                "data science",
                "deep learning"
            ],
            description:
                "Uses data, statistics and machine learning to solve problems.",
            skills: [
                "Python",
                "Statistics",
                "Machine Learning",
                "Pandas",
                "NumPy",
                "Scikit-learn"
            ]
        },

        {
            role: "AI / Machine Learning Engineer",
            keywords: [
                "machine learning",
                "artificial intelligence",
                "ai",
                "deep learning",
                "tensorflow",
                "pytorch",
                "neural network",
                "nlp",
                "computer vision"
            ],
            description:
                "Builds AI and machine learning based applications.",
            skills: [
                "Python",
                "Machine Learning",
                "Deep Learning",
                "Neural Networks",
                "TensorFlow / PyTorch",
                "NLP / Computer Vision"
            ]
        },

        {
            role: "Database / SQL Developer",
            keywords: [
                "sql",
                "mysql",
                "postgresql",
                "oracle",
                "database",
                "dbms",
                "mongodb",
                "database management"
            ],
            description:
                "Designs, manages and works with databases and data systems.",
            skills: [
                "SQL",
                "MySQL / PostgreSQL",
                "Database Design",
                "DBMS",
                "Queries",
                "Database Optimization"
            ]
        },

        {
            role: "Software Developer",
            keywords: [
                "java",
                "python",
                "c++",
                "javascript",
                "software development",
                "programming",
                "oop",
                "data structures",
                "algorithms"
            ],
            description:
                "Develops software applications using programming and problem-solving skills.",
            skills: [
                "Programming",
                "OOP",
                "Data Structures",
                "Algorithms",
                "Git",
                "Problem Solving"
            ]
        },

        {
            role: "Cybersecurity Analyst",
            keywords: [
                "cybersecurity",
                "cyber security",
                "network security",
                "ethical hacking",
                "cryptography",
                "linux",
                "security",
                "penetration testing",
                "firewall"
            ],
            description:
                "Helps protect systems, networks and applications from security threats.",
            skills: [
                "Networking",
                "Linux",
                "Cybersecurity",
                "Cryptography",
                "Ethical Hacking",
                "Security Tools"
            ]
        },

        {
            role: "UI/UX Designer",
            keywords: [
                "ui",
                "ux",
                "figma",
                "canva",
                "wireframe",
                "prototype",
                "user experience",
                "user interface",
                "design"
            ],
            description:
                "Designs user-friendly interfaces and digital experiences.",
            skills: [
                "Figma",
                "UI Design",
                "UX Design",
                "Wireframing",
                "Prototyping",
                "User Research"
            ]
        }
    ];


    // ==================================================
    // CALCULATE ROLE MATCH
    // ==================================================

    const suggestions = roles.map(function (role) {

        let matchedKeywords = [];

        role.keywords.forEach(function (keyword) {

            if (text.includes(keyword)) {
                matchedKeywords.push(keyword);
            }

        });

        const matchPercentage =
            Math.round(
                (matchedKeywords.length / role.keywords.length) * 100
            );

        return {

            role: role.role,

            matchPercentage: Math.min(
                matchPercentage,
                100
            ),

            matchedKeywords: matchedKeywords,

            description: role.description,

            recommendedSkills: role.skills
        };

    });


    // ==================================================
    // SORT BEST MATCH FIRST
    // ==================================================

    suggestions.sort(function (a, b) {

        return b.matchPercentage - a.matchPercentage;

    });


    // ==================================================
    // RETURN TOP 5 CAREER OPTIONS
    // ==================================================

    return suggestions
        .filter(function (item) {

            return item.matchPercentage > 0;

        })
        .slice(0, 5);
}


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    generateCareerSuggestions
};