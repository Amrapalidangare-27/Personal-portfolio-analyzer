const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const db = require("../config/db");

const { extractResumeText } = require("../resumeParser");
const { calculateATSScore } = require("../atsAnalyzer");
const { generateSkillGap } = require("../skillGapAnalyzer");
const { generateResumeSuggestions } = require("../resumeImprovement");
const { askAI } = require("../aichatbot");

const router = express.Router();

// Logged-in user ki id (browser har request mein "x-user-id" header bhejta hai).
// id nahi mile to null -> aise records sirf "bina login" wale ko dikhte hain.
function getUserId(req) {
    const id = parseInt(req.headers["x-user-id"], 10);
    return Number.isInteger(id) && id > 0 ? id : null;
}


// =====================================
// UPLOAD DIRECTORY
// =====================================

const uploadDir = path.join(
    __dirname,
    "../../public/uploads"
);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}


// =====================================
// MULTER STORAGE
// =====================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            file.originalname.replace(
                /[^a-zA-Z0-9.-]/g,
                "_"
            );

        cb(null, uniqueName);
    }
});


// =====================================
// MULTER CONFIGURATION
// =====================================

const upload = multer({

    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        const allowedExtensions = [
            ".pdf",
            ".docx"
        ];

        const extension =
            path.extname(
                file.originalname
            ).toLowerCase();

        if (
            allowedExtensions.includes(
                extension
            )
        ) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only PDF and DOCX files are allowed."
                )
            );
        }
    }
});


// =====================================
// REGISTER
// =====================================

router.post(
    "/register",
    async (req, res) => {

        try {

            const {
                name,
                email,
                password
            } = req.body;

            if (
                !name ||
                !email ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please fill all fields."
                });
            }


            const [existingUsers] =
                await db.execute(
                    "SELECT * FROM users WHERE email = ?",
                    [email]
                );


            if (
                existingUsers.length > 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email already registered."
                });
            }


            await db.execute(
                `INSERT INTO users
                (name, email, password)
                VALUES (?, ?, ?)`,
                [
                    name,
                    email,
                    password
                ]
            );


            res.json({

                success: true,

                message:
                    "Registration Successful!"
            });


        } catch (error) {

            console.error(
                "REGISTER ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Registration failed."
            });
        }
    }
);


// =====================================
// LOGIN
// =====================================

router.post(
    "/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            console.log(
                "LOGIN REQUEST:",
                email
            );


            if (
                !email ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter email and password."
                });
            }


            const [users] =
                await db.execute(
                    `SELECT *
                     FROM users
                     WHERE email = ?`,
                    [email]
                );


            console.log(
                "USER FOUND:",
                users.length
            );


            if (
                users.length === 0
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password."
                });
            }


            const user = users[0];


            if (
                String(user.password) !==
                String(password)
            ) {

                console.log(
                    "PASSWORD DOES NOT MATCH"
                );

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password."
                });
            }


            console.log(
                "LOGIN SUCCESS:",
                user.email
            );


            res.json({

                success: true,

                message:
                    "Login successful!",

                user: {

                    id: user.id,

                    name: user.name,

                    email: user.email
                }
            });


        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Login failed."
            });
        }
    }
);


// =====================================
// RESUME UPLOAD + ANALYSIS
// =====================================

router.post(
    "/upload",
    (req, res, next) => {
        // File type / size errors ko JSON message ke roop mein bhejo
        upload.single("resume")(req, res, (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message || "Invalid file."
                });
            }
            next();
        });
    },
    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please select a resume."
                });
            }


            console.log(
                "Resume uploaded:",
                req.file.originalname
            );


            // -----------------------------
            // EXTRACT RESUME TEXT
            // -----------------------------

            const resumeText =
                await extractResumeText(
                    req.file.path
                );


            console.log(
                "Resume text length:",
                resumeText.length
            );


            // -----------------------------
            // ATS SCORE
            // -----------------------------

            const atsResult =
                calculateATSScore(
                    resumeText
                );


            // -----------------------------
            // SKILL GAP
            // -----------------------------

            const skillGap =
                generateSkillGap(
                    resumeText
                );


            // =================================================
            // SAVE DETECTED SKILLS TO SKILL PROGRESS TRACKER
            // =================================================

            if (
                skillGap &&
                Array.isArray(
                    skillGap.detectedSkills
                )
            ) {

                for (
                    const skill
                    of skillGap.detectedSkills
                ) {

                    if (!skill) {
                        continue;
                    }


                    // Check whether skill already exists
                    const [existingSkill] =
                        await db.execute(
                            `SELECT id
                             FROM skill_progress WHERE skill_name = ? AND user_id <=> ?`, [skill, getUserId(req)]
                        );


                    if (
                        existingSkill.length > 0
                    ) {

                        // Skill already exists
                        // Keep current progress
                        console.log(
                            "Skill already exists:",
                            skill
                        );

                    } else {

                        // New skill
                        // Start progress at 50%
                        await db.execute(
                            `INSERT INTO skill_progress (user_id, skill_name, progress, target_level) VALUES (?, ?, ?, ?)`, [ getUserId(req), skill, 50, 100 ]
                        );


                        console.log(
                            "Skill added to tracker:",
                            skill
                        );
                    }
                }
            }


            // -----------------------------
            // RESUME IMPROVEMENT
            // -----------------------------

            const resumeSuggestions =
                generateResumeSuggestions(
                    resumeText,
                    atsResult.score,
                    skillGap
                );


            console.log(
                "ATS Score:",
                atsResult.score
            );

            console.log(
                "Detected Skills:",
                skillGap.detectedSkills
            );

            console.log(
                "Recommended Career:",
                skillGap.recommendedRole
            );

            console.log(
                "Role Match:",
                skillGap.roleMatchPercentage
            );


            // -----------------------------
            // SEND ANALYSIS
            // -----------------------------

            res.json({

                success: true,

                message:
                    "Resume analyzed successfully!",

                filename:
                    req.file.filename,

                originalFilename:
                    req.file.originalname,

                fileType:
                    path.extname(
                        req.file.originalname
                    ).toUpperCase(),

                fileSize:
                    req.file.size,

                resumeText:
                    resumeText,

                atsScore:
                    atsResult.score,

                atsDetails:
                    atsResult.details,

                skillGap:
                    skillGap,

                careerSuggestions:
                    skillGap.careerSuggestions,

                resumeSuggestions:
                    resumeSuggestions
            });


        } catch (error) {

            console.error(
                "UPLOAD ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Resume analysis failed."
            });
        }
    }
);


// =====================================
// AI CHATBOT
// =====================================

router.post(
    "/chat",
    async (req, res) => {

        try {

            const {
                question,
                resumeText
            } = req.body;


            if (
                !question ||
                !question.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter a question."
                });
            }


            console.log(
                "AI Question:",
                question
            );


            const answer =
                await askAI(
                    question.trim(),
                    resumeText || ""
                );


            res.json({

                success: true,

                answer: answer
            });


        } catch (error) {

            console.error(
                "AI CHAT ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "AI chatbot failed."
            });
        }
    }
);


// =====================================
// PORTFOLIO SHARING
// =====================================

router.post(
    "/portfolio/share",
    async (req, res) => {

        try {

            const {
                name,
                email,
                skills,
                careerRole,
                atsScore,
            badges
            } = req.body;


            const slug =
                name
                    ? name
                        .toLowerCase()
                        .replace(
                            /[^a-z0-9]+/g,
                            "-"
                        )
                    : "portfolio";


            const uniqueSlug =
                slug +
                "-" +
                Date.now()
                    .toString()
                    .slice(-6);


            const safeBadges = Array.isArray(badges)
                ? badges.slice(0, 20).map(b => ({
                    icon: String((b && b.icon) || "").slice(0, 8),
                    name: String((b && b.name) || "").slice(0, 40)
                })).filter(b => b.name)
                : [];

            const portfolioData = {

                name:
                    name ||
                    "Portfolio User",

                email:
                    email || "",

                skills:
                    Array.isArray(skills)
                        ? skills
                        : [],

                careerRole:
                    careerRole ||
                    "Career Professional",

                atsScore: atsScore || 0,
                badges: safeBadges
            };


            await db.execute(

                `INSERT INTO portfolios (user_id, share_slug, portfolio_data, is_public) VALUES (?, ?, ?, ?)`, [ getUserId(req), uniqueSlug,

                    JSON.stringify(
                        portfolioData
                    ),

                    true
                ]
            );


            res.json({

                success: true,

                message:
                    "Portfolio shared successfully.",

                shareSlug:
                    uniqueSlug,

                shareUrl:
                    `http://localhost:3000/auth/portfolio/${uniqueSlug}`
            });


        } catch (error) {

            console.error(
                "PORTFOLIO SHARE ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to share portfolio."
            });
        }
    }
);


// =====================================
// VIEW SHARED PORTFOLIO
// =====================================

router.get(
    "/portfolio/:slug",
    async (req, res) => {

        try {

            const {
                slug
            } = req.params;


            const [rows] =
                await db.execute(

                    `SELECT *
                     FROM portfolios
                     WHERE share_slug = ?
                     AND is_public = TRUE`,

                    [slug]
                );


            if (
                rows.length === 0
            ) {

                return res.status(404).send(`

                    <html>

                    <head>

                        <title>
                            Portfolio Not Found
                        </title>

                    </head>

                    <body
                        style="
                            font-family: Arial;
                            text-align:center;
                            margin-top:80px;
                        "
                    >

                        <h2>
                            Portfolio not found
                        </h2>

                        <p>
                            This portfolio link is invalid
                            or no longer available.
                        </p>

                    </body>

                    </html>

                `);
            }


            const portfolio =

                typeof rows[0].portfolio_data ===
                "string"

                    ? JSON.parse(
                        rows[0].portfolio_data
                    )

                    : rows[0].portfolio_data;


            const skills =
                Array.isArray(
                    portfolio.skills
                )
                    ? portfolio.skills
                    : [];


            const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({
                "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
            }[c]));

            const ats = Math.max(0, Math.min(100, Number(portfolio.atsScore) || 0));
            const badges = Array.isArray(portfolio.badges) ? portfolio.badges : [];

            res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(portfolio.name)}'s Portfolio</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
<style>
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; font-family: "Inter", "Segoe UI", Arial, sans-serif; color: #f1f3fa;
  background: radial-gradient(900px 520px at 100% 0%, rgba(124,92,255,.22), transparent 62%), #141a2a; }
.wrap { max-width: 880px; margin: 0 auto; padding: 48px 20px; }
.card { background: #1b2234; border: 1px solid rgba(255,255,255,.07); border-radius: 22px; padding: 34px; margin-bottom: 20px; box-shadow: 0 18px 40px rgba(5,8,20,.35); }
.hero { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
h1 { margin: 0 0 6px; font-size: 34px; font-weight: 800; }
.role { color: #a99cff; font-size: 18px; font-weight: 600; }
.email { color: #9aa3b8; margin-top: 6px; }
.ring { --p: ${ats}; width: 112px; height: 112px; border-radius: 50%; display: grid; place-items: center;
  background: conic-gradient(from -90deg, #3fa9ff 0%, #8b5cf6 calc(var(--p) * .55%), #d946ef calc(var(--p) * 1%), rgba(255,255,255,.09) calc(var(--p) * 1%)); }
.ring div { width: 92px; height: 92px; border-radius: 50%; background: #1b2234; display: grid; place-items: center; text-align: center; }
.ring strong { display: block; font-size: 26px; line-height: 1; }
.ring span { font-size: 11px; color: #9aa3b8; }
h2 { margin: 0 0 16px; font-size: 18px; }
.chips { display: flex; flex-wrap: wrap; gap: 10px; }
.chip { padding: 8px 16px; border-radius: 24px; font-size: 14px; font-weight: 500; background: rgba(124,92,255,.16); border: 1px solid rgba(124,92,255,.35); color: #ddd8ff; }
.badges { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; }
.badge { text-align: center; padding: 18px 10px; border-radius: 16px; background: linear-gradient(180deg, rgba(124,92,255,.14), rgba(255,255,255,.035)); border: 1px solid rgba(124,92,255,.5); }
.badge i { display: block; font-style: normal; font-size: 32px; margin-bottom: 6px; }
.badge b { font-size: 13.5px; }
.empty { color: #9aa3b8; margin: 0; }
.footer { text-align: center; color: #9aa3b8; font-size: 13px; margin-top: 8px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="card hero">
    <div>
      <h1>${esc(portfolio.name)}</h1>
      <div class="role">${esc(portfolio.careerRole)}</div>
      <div class="email">${esc(portfolio.email)}</div>
    </div>
    <div class="ring"><div><p style="margin:0"><strong>${ats}</strong><span>ATS score</span></p></div></div>
  </div>

  <div class="card">
    <h2>Skills</h2>
    ${skills.length > 0
      ? `<div class="chips">${skills.map(skill => `<span class="chip">${esc(skill)}</span>`).join("")}</div>`
      : '<p class="empty">No skills available.</p>'}
  </div>

  <div class="card">
    <h2>Badges</h2>
    ${badges.length > 0
      ? `<div class="badges">${badges.map(b => `<div class="badge"><i>${esc(b.icon)}</i><b>${esc(b.name)}</b></div>`).join("")}</div>`
      : '<p class="empty">No badges earned yet.</p>'}
  </div>

  <div class="footer">Created using Personal Portfolio Analyzer</div>
</div>
</body>
</html>`);


        } catch (error) {

            console.error(
                "SHARED PORTFOLIO ERROR:",
                error
            );

            res.status(500).send(
                "Unable to load portfolio."
            );
        }
    }
);


// =====================================
// INTERVIEW PREPARATION
// =====================================

router.post(
    "/interview/generate",
    async (req, res) => {

        try {

            const {
                targetRole
            } = req.body;


            if (!targetRole) {

                return res.status(400).json({

                    message:
                        "Target role is required."
                });
            }


            const role =
                targetRole.toLowerCase();


            let questions = [];


            // FRONTEND
            if (
                role.includes("frontend")
            ) {

                questions = [

                    "What is HTML and why is it used?",

                    "What is the difference between HTML and HTML5?",

                    "What is CSS and how is it used?",

                    "What is the difference between Flexbox and Grid?",

                    "What is JavaScript?",

                    "What is the difference between let, const and var?",

                    "What is DOM in JavaScript?",

                    "How do you make a website responsive?",

                    "Explain your Personal Portfolio Analyzer project.",

                    "What challenges did you face while developing your project?"

                ];


            // BACKEND
            } else if (
                role.includes("backend")
            ) {

                questions = [

                    "What is Node.js?",

                    "What is Express.js?",

                    "What is an API?",

                    "What is REST API?",

                    "What is middleware in Express.js?",

                    "How do you connect Node.js with MySQL?",

                    "What is a database?",

                    "What is the difference between SQL and NoSQL?",

                    "Explain your Personal Portfolio Analyzer backend.",

                    "What challenges did you face while developing your project?"

                ];


            // PYTHON
            } else if (
                role.includes("python")
            ) {

                questions = [

                    "What is Python?",

                    "What are Python data types?",

                    "What is a list in Python?",

                    "What is the difference between a list and a tuple?",

                    "What is a function in Python?",

                    "What is exception handling?",

                    "What are modules in Python?",

                    "What is object-oriented programming?",

                    "Explain your Personal Portfolio Analyzer project.",

                    "What challenges did you face while developing your project?"

                ];


            // DATA
            } else if (
                role.includes("data")
            ) {

                questions = [

                    "What is data analysis?",

                    "What is SQL?",

                    "What is the difference between WHERE and HAVING?",

                    "What is a database?",

                    "What is Excel used for in data analysis?",

                    "What is data cleaning?",

                    "What is the difference between primary key and foreign key?",

                    "What is a JOIN in SQL?",

                    "How can data help in decision making?",

                    "Explain your Personal Portfolio Analyzer project."

                ];


            // DEFAULT
            } else {

                questions = [

                    "Tell me about yourself.",

                    "What are your strengths?",

                    "What are your weaknesses?",

                    "Why are you interested in this career?",

                    "Why should we hire you?",

                    "What are your technical skills?",

                    "Tell me about your academic project.",

                    "What challenges did you face in your project?",

                    "Where do you see yourself in five years?",

                    "Do you have any questions for the interviewer?"

                ];
            }


            await db.execute(

                `INSERT INTO interview_questions
                (user_id, target_role, questions)
                VALUES (?, ?, ?)`,

                [ getUserId(req), targetRole,
                    JSON.stringify(
                        questions
                    )
                ]
            );


            res.json({

                success: true,

                message:
                    "Interview questions generated successfully.",

                targetRole:
                    targetRole,

                questions:
                    questions
            });


        } catch (error) {

            console.error(
                "Interview preparation error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to generate interview questions."
            });
        }
    }
);


// =====================================
// GET LATEST INTERVIEW QUESTIONS
// =====================================

router.get(
    "/interview/latest",
    async (req, res) => {

        try {

            const {
                targetRole
            } = req.query;


            let query = ` SELECT * FROM interview_questions WHERE user_id <=> ? `; let params = [getUserId(req)]; if (targetRole) { query += ` AND target_role = ? `;

                params.push(
                    targetRole
                );
            }


            query += `
                ORDER BY created_at DESC
                LIMIT 1
            `;


            const [rows] =
                await db.execute(
                    query,
                    params
                );


            if (
                rows.length === 0
            ) {

                return res.status(404).json({

                    message:
                        "No interview questions found."
                });
            }


            let questions =
                rows[0].questions;


            if (
                typeof questions ===
                "string"
            ) {

                questions =
                    JSON.parse(
                        questions
                    );
            }


            res.json({

                targetRole:
                    rows[0].target_role,

                questions:
                    questions
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to fetch interview questions."
            });
        }
    }
);


// ======================================================
// SKILL PROGRESS TRACKER
// ======================================================


// --------------------------------------
// GET ALL SKILLS
// --------------------------------------

router.get(
    "/skills",
    async (req, res) => {

        try {

            const [rows] =
                await db.execute(

                    `SELECT
                        id,
                        skill_name,
                        progress,
                        target_level
                     FROM skill_progress WHERE user_id <=> ? ORDER BY id DESC`, [getUserId(req)]

                );


            res.json({

                success: true,

                skills:
                    rows
            });


        } catch (error) {

            console.error(
                "Get skills error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load skills."
            });
        }
    }
);


// --------------------------------------
// ADD / UPDATE SKILL
// --------------------------------------

router.post(
    "/skills",
    async (req, res) => {

        try {

            const {
                skillName,
                progress = 0,
                targetLevel = 100
            } = req.body;


            if (!skillName) {

                return res.status(400).json({

                    message:
                        "Skill name is required."
                });
            }


            const safeProgress =
                Math.max(
                    0,
                    Math.min(
                        100,
                        Number(progress)
                    )
                );


            const safeTarget =
                Math.max(
                    1,
                    Math.min(
                        100,
                        Number(targetLevel)
                    )
                );


            // Check existing skill

            const [existing] =
                await db.execute(

                    `SELECT id FROM skill_progress WHERE skill_name = ? AND user_id <=> ?`, [skillName, getUserId(req)]
                );


            if (
                existing.length > 0
            ) {

                // UPDATE

                await db.execute(

                    `UPDATE skill_progress
                     SET progress = ?,
                         target_level = ?
                     WHERE skill_name = ? AND user_id <=> ?`, [ safeProgress, safeTarget, skillName, getUserId(req) ]
                );


            } else {

                // INSERT

                await db.execute(

                    `INSERT INTO skill_progress (user_id, skill_name, progress, target_level) VALUES (?, ?, ?, ?)`, [ getUserId(req), skillName, safeProgress, safeTarget ]
                );
            }


            res.json({

                success: true,

                message:
                    "Skill progress saved."
            });


        } catch (error) {

            console.error(
                "Save skill error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to save skill progress."
            });
        }
    }
);


// =====================================
// EXPORT ROUTER
// =====================================

module.exports = router;