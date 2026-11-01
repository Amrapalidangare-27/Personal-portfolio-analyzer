// =====================================================
// FEATURE ROUTES  ->  server/routes/featureRoutes.js
// Daily Learning Planner + Project Recommendations
// URL prefix: /feature   (server.js mein mount hota hai)
// authRoutes.js ko chhua nahi gaya.
// =====================================================

const express = require("express");
const db = require("../config/db");
const skillGap = require("../skillGapAnalyzer");

const router = express.Router();

// careerProfiles export ho to role ke exact skills milenge, warna frontend wale missing skills use honge
const careerProfiles = skillGap.careerProfiles || {};


// =====================================================
// TABLES (server start par apne aap ban jaate hain)
// =====================================================

async function createTables() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS learning_plans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                target_role VARCHAR(100) NULL,
                skill_name VARCHAR(100) NOT NULL,
                day_number INT NOT NULL,
                task VARCHAR(255) NOT NULL,
                completed TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS project_recommendations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                target_role VARCHAR(100) NULL,
                title VARCHAR(150) NOT NULL,
                difficulty VARCHAR(30) NULL,
                match_percentage INT DEFAULT 0,
                details TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Feature tables ready (learning_plans, project_recommendations)");
    } catch (error) {
        console.error("Feature table error:", error.message);
    }
}

createTables();


// =====================================================
// HELPERS
// =====================================================

// Abhi login se user id nahi aati to NULL; Phase 5 mein header se aayegi
function getUserId(req) {
    const id = parseInt(req.headers["x-user-id"], 10);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function cleanList(value, max = 60) {
    if (!Array.isArray(value)) return [];
    return value
        .filter(v => typeof v === "string" && v.trim())
        .map(v => v.trim().slice(0, 60))
        .slice(0, max);
}

function cleanText(value, max = 100) {
    return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function sameUser(userId) {
    return userId === null ? { sql: "user_id IS NULL", params: [] } : { sql: "user_id = ?", params: [userId] };
}


// =====================================================
// LEARNING TASKS (skill -> daily activities)
// =====================================================

const taskBank = {
    "HTML": ["Revise HTML tags, headings, lists and forms", "Build a simple resume page using semantic HTML"],
    "CSS": ["Practice Flexbox and CSS Grid layouts", "Style a responsive card layout with media queries"],
    "JavaScript": ["Practice variables, functions and arrays", "Practice DOM manipulation with a small to-do app", "Learn fetch API and async/await"],
    "Python": ["Practice variables, loops and functions", "Solve 5 small problems using lists and dictionaries", "Learn OOP basics and exception handling"],
    "Java": ["Revise OOP concepts: class, object, inheritance", "Solve 5 programs using collections"],
    "C++": ["Revise pointers, arrays and functions", "Solve 5 problems using STL vectors"],
    "React": ["Learn components, props and state", "Build a small counter or to-do app in React", "Learn useEffect and API calls in React"],
    "Node.js": ["Learn Node.js modules and npm basics", "Create a simple HTTP server with Node.js"],
    "Express.js": ["Create routes (GET, POST) with Express", "Add middleware and error handling in Express"],
    "MySQL": ["Practice CREATE, INSERT, SELECT queries", "Practice JOIN and GROUP BY with sample tables"],
    "SQL": ["Practice SELECT, WHERE and ORDER BY", "Practice JOIN, GROUP BY and subqueries"],
    "MongoDB": ["Learn collections and documents, practice CRUD", "Practice queries and aggregation basics"],
    "Git": ["Learn git init, add, commit and push", "Practice branches and merge on a sample repo"],
    "API": ["Learn what REST APIs are (GET, POST, PUT, DELETE)", "Test an API using Postman and fetch"],
    "TypeScript": ["Learn basic types, interfaces and functions in TypeScript", "Convert a small JavaScript file to TypeScript"],
    "Testing": ["Learn what unit testing is and why it matters", "Write 5 simple tests for one function"],
    "Excel": ["Practice formulas: SUM, IF, VLOOKUP", "Create a pivot table and a chart from sample data"],
    "Tally": ["Revise ledger, voucher and day book entries", "Practice GST entries in Tally"],
    "GST": ["Revise GST types (CGST, SGST, IGST)", "Practice preparing a GST invoice"],
    "Accounting": ["Revise debit and credit rules", "Prepare a sample trial balance"],
    "SEO": ["Learn keyword research basics", "Do an on-page SEO check for one web page"],
    "Digital Marketing": ["Learn the marketing funnel and channels", "Plan a one-week campaign for a sample product"],
    "Social Media Marketing": ["Study 3 successful brand pages", "Create a 7-day content calendar"],
    "Content Creation": ["Write one 300-word blog post", "Edit and proofread your content"],
    "Communication": ["Practice explaining a topic in 2 minutes", "Write a professional email"],
    "Leadership": ["Read about team leadership basics", "Write one example where you led a team"],
    "Teaching": ["Prepare a 10-minute lesson plan", "Practice explaining one concept simply"]
};

function tasksForSkill(skill) {
    if (taskBank[skill]) return taskBank[skill];
    return [
        `Learn the basics of ${skill} (watch one tutorial or read one guide)`,
        `Practice ${skill} with a small hands-on exercise`,
        `Revise ${skill} and write short notes`
    ];
}


// =====================================================
// PROJECT CATALOG
// skills = jo skills ye project use karta hai (skillGapAnalyzer ke naam)
// =====================================================

const projectCatalog = [
    { title: "Personal Portfolio Website", difficulty: "Beginner", skills: ["HTML", "CSS", "JavaScript"], roles: ["Frontend Developer", "Full Stack Developer"], tech: ["HTML", "CSS", "JavaScript"], description: "A responsive website showing your skills, projects and contact details.", why: "Every recruiter wants to see a live portfolio. It proves your frontend basics." },
    { title: "To-Do List App", difficulty: "Beginner", skills: ["HTML", "CSS", "JavaScript"], roles: ["Frontend Developer", "Full Stack Developer"], tech: ["HTML", "CSS", "JavaScript", "localStorage"], description: "Add, edit, delete and complete tasks, saved in the browser.", why: "Teaches DOM manipulation and state handling." },
    { title: "Weather Dashboard", difficulty: "Intermediate", skills: ["HTML", "CSS", "JavaScript", "API"], roles: ["Frontend Developer", "Full Stack Developer"], tech: ["JavaScript", "Fetch API", "Chart.js"], description: "Show live weather of any city using a public API.", why: "Shows you can consume APIs and handle async data." },
    { title: "React Movie Search App", difficulty: "Intermediate", skills: ["React", "JavaScript", "API"], roles: ["Frontend Developer", "Full Stack Developer"], tech: ["React", "Movie API", "CSS"], description: "Search movies, view details and save favourites.", why: "A classic project to prove React components, props and state." },
    { title: "Expense Tracker", difficulty: "Intermediate", skills: ["JavaScript", "Node.js", "Express.js", "MySQL"], roles: ["Full Stack Developer", "Backend Developer"], tech: ["Node.js", "Express.js", "MySQL", "Chart.js"], description: "Add income and expenses, see monthly charts and totals.", why: "Covers a full CRUD cycle with a database." },
    { title: "Student Management System", difficulty: "Intermediate", skills: ["Node.js", "Express.js", "MySQL", "SQL"], roles: ["Backend Developer", "Full Stack Developer"], tech: ["Node.js", "Express.js", "MySQL", "HTML"], description: "Manage students, courses and marks with add, edit and search.", why: "Great for learning database design and REST routes." },
    { title: "REST API with Authentication", difficulty: "Intermediate", skills: ["Node.js", "Express.js", "API", "MySQL"], roles: ["Backend Developer", "Full Stack Developer"], tech: ["Express.js", "JWT", "bcrypt", "MySQL"], description: "Register, login and protected routes using JWT.", why: "Authentication is asked in almost every backend interview." },
    { title: "Job Portal", difficulty: "Advanced", skills: ["Node.js", "Express.js", "MySQL", "HTML", "CSS", "JavaScript"], roles: ["Full Stack Developer", "Backend Developer"], tech: ["Node.js", "MySQL", "HTML/CSS/JS"], description: "Companies post jobs and candidates apply with a resume.", why: "A big project that shows full stack skills together." },
    { title: "Resume Analyzer", difficulty: "Advanced", skills: ["Node.js", "JavaScript", "MySQL", "API"], roles: ["Full Stack Developer", "Backend Developer", "Python Developer"], tech: ["Node.js", "multer", "MySQL"], description: "Upload a resume and get ATS score and skill gap.", why: "Solves a real problem and impresses interviewers." },
    { title: "Number Guessing and Quiz Game", difficulty: "Beginner", skills: ["Python"], roles: ["Python Developer"], tech: ["Python"], description: "Console quiz with scores and file storage.", why: "Practises loops, functions and file handling." },
    { title: "Library Management System", difficulty: "Intermediate", skills: ["Python", "SQL"], roles: ["Python Developer", "Data Analyst"], tech: ["Python", "SQLite or MySQL"], description: "Add books, issue and return them, track fines.", why: "Shows OOP and database use together." },
    { title: "Sales Data Analysis", difficulty: "Intermediate", skills: ["Python", "Excel", "SQL"], roles: ["Data Analyst", "Python Developer"], tech: ["Python (pandas)", "Excel", "Matplotlib"], description: "Clean a sales dataset and create charts and insights.", why: "Data cleaning and storytelling are core analyst skills." },
    { title: "Excel Sales Dashboard", difficulty: "Beginner", skills: ["Excel"], roles: ["Data Analyst", "Accountant", "Sales Executive"], tech: ["Excel", "Pivot tables", "Charts"], description: "Monthly sales report with pivot tables and charts.", why: "Shows you can turn raw numbers into a clear report." },
    { title: "Accounts and GST Practice File", difficulty: "Beginner", skills: ["Tally", "GST", "Accounting"], roles: ["Accountant"], tech: ["Tally", "Excel"], description: "Record a month of sample transactions and prepare GST summary.", why: "Practical proof of accounting software skills." },
    { title: "Social Media Content Calendar", difficulty: "Beginner", skills: ["Social Media Marketing", "Content Creation"], roles: ["Digital Marketing Executive"], tech: ["Canva", "Google Sheets"], description: "Plan and design one month of posts for a sample brand.", why: "Portfolio piece showing planning and creativity." },
    { title: "SEO Audit Report", difficulty: "Intermediate", skills: ["SEO", "Digital Marketing"], roles: ["Digital Marketing Executive"], tech: ["Google Search Console", "Google Sheets"], description: "Audit one website and suggest keyword and page fixes.", why: "Shows you can find problems and give solutions." },
    { title: "Brand Identity Design Set", difficulty: "Intermediate", skills: ["Photoshop", "Illustrator", "Canva", "Figma"], roles: ["Graphic Designer"], tech: ["Figma", "Canva", "Illustrator"], description: "Logo, colour palette and social media templates for a brand.", why: "A complete case study is what design recruiters look for." },
    { title: "Quality Inspection Checklist and Report", difficulty: "Beginner", skills: ["Quality Control", "Excel"], roles: ["Quality Control Executive", "Diamond Quality Checker", "Jewellery Quality Executive"], tech: ["Excel", "Checklists"], description: "Design an inspection checklist and defect-tracking sheet.", why: "Shows structured thinking and accuracy." },
    { title: "Customer Query Tracker", difficulty: "Beginner", skills: ["Excel", "Communication"], roles: ["Customer Service Executive", "Sales Executive", "HR Executive"], tech: ["Excel", "Google Sheets"], description: "Track customer queries, status and resolution time.", why: "Proves you can organise follow-ups and measure service." },
    { title: "Lesson Plan and Study Material Pack", difficulty: "Beginner", skills: ["Teaching", "Communication"], roles: ["Teacher / Educator"], tech: ["Google Docs", "Canva"], description: "A 4-week lesson plan with worksheets and quizzes.", why: "Shows planning and teaching ability." }
];

function scoreProject(project, role, detected, missing) {
    const have = project.skills.filter(s => detected.has(s));
    const learn = project.skills.filter(s => !detected.has(s));
    const missingUsed = project.skills.filter(s => missing.has(s));

    let score = (have.length / project.skills.length) * 70;
    score += missingUsed.length > 0 ? 10 : 0;
    score += project.roles.includes(role) ? 20 : 0;

    return {
        title: project.title,
        difficulty: project.difficulty,
        description: project.description,
        why: project.why,
        technologies: project.tech,
        skillsUsed: project.skills,
        skillsYouHave: have,
        skillsToLearn: learn,
        matchPercentage: Math.min(100, Math.round(score))
    };
}


// =====================================================
// LEARNING PLANNER
// =====================================================

// GET /feature/planner  -> saved plan
router.get("/planner", async (req, res) => {
    try {
        const who = sameUser(getUserId(req));
        const [rows] = await db.query(
            `SELECT id, target_role, skill_name, day_number, task, completed
             FROM learning_plans WHERE ${who.sql} ORDER BY day_number ASC, id ASC`,
            who.params
        );
        res.json({ success: true, plan: rows });
    } catch (error) {
        console.error("Planner load error:", error);
        res.status(500).json({ success: false, message: "Could not load learning plan." });
    }
});


// POST /feature/planner/generate  { role, detectedSkills[], missingSkills[] }
router.post("/planner/generate", async (req, res) => {
    try {
        const userId = getUserId(req);
        const role = cleanText(req.body.role);
        const detected = cleanList(req.body.detectedSkills);
        let missing = cleanList(req.body.missingSkills);

        if (!role) {
            return res.status(400).json({ success: false, message: "Please select a target career." });
        }

        // Role ke exact skills mil jaayein to unse missing nikalo
        if (careerProfiles[role] && Array.isArray(careerProfiles[role].skills)) {
            const have = new Set(detected);
            missing = careerProfiles[role].skills.filter(s => !have.has(s));
        }

        let focus = missing.slice(0, 5);
        let revision = false;

        // Koi skill missing nahi: apni detected skills ki revision plan
        if (focus.length === 0) {
            focus = detected.slice(0, 4);
            revision = true;
        }

        if (focus.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No skills found. Please upload and analyze your resume first."
            });
        }

        const rows = [];
        let day = 1;

        for (const skill of focus) {
            const tasks = tasksForSkill(skill);
            const limit = Math.min(tasks.length, 3);
            for (let i = 0; i < limit; i++) {
                rows.push([userId, role, skill, day++, (revision ? "Revision: " : "") + tasks[i]]);
            }
        }

        // Last day: revision + mini project
        rows.push([userId, role, "Revision", day, `Revise ${focus.slice(0, 3).join(", ")} and build one small mini project`]);

        const who = sameUser(userId);
        await db.query(`DELETE FROM learning_plans WHERE ${who.sql}`, who.params);
        await db.query(
            "INSERT INTO learning_plans (user_id, target_role, skill_name, day_number, task) VALUES ?",
            [rows]
        );

        const [saved] = await db.query(
            `SELECT id, target_role, skill_name, day_number, task, completed
             FROM learning_plans WHERE ${who.sql} ORDER BY day_number ASC, id ASC`,
            who.params
        );

        res.json({ success: true, role, missingSkills: missing, revisionMode: revision, plan: saved });

    } catch (error) {
        console.error("Planner generate error:", error);
        res.status(500).json({ success: false, message: "Could not generate learning plan." });
    }
});


// POST /feature/planner/toggle  { id, completed }
router.post("/planner/toggle", async (req, res) => {
    try {
        const id = parseInt(req.body.id, 10);
        const completed = req.body.completed ? 1 : 0;

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({ success: false, message: "Invalid task id." });
        }

        const who = sameUser(getUserId(req));
        const [result] = await db.query(
            `UPDATE learning_plans SET completed = ? WHERE id = ? AND ${who.sql}`,
            [completed, id, ...who.params]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Task not found." });
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Planner toggle error:", error);
        res.status(500).json({ success: false, message: "Could not update task." });
    }
});


// DELETE /feature/planner  -> plan reset
router.delete("/planner", async (req, res) => {
    try {
        const who = sameUser(getUserId(req));
        await db.query(`DELETE FROM learning_plans WHERE ${who.sql}`, who.params);
        res.json({ success: true });
    } catch (error) {
        console.error("Planner reset error:", error);
        res.status(500).json({ success: false, message: "Could not reset plan." });
    }
});


// =====================================================
// PROJECT RECOMMENDATIONS
// =====================================================

// POST /feature/projects  { role, detectedSkills[], missingSkills[] }
router.post("/projects", async (req, res) => {
    try {
        const userId = getUserId(req);
        const role = cleanText(req.body.role);
        const detected = new Set(cleanList(req.body.detectedSkills));
        const missing = new Set(cleanList(req.body.missingSkills));

        if (detected.size === 0 && !role) {
            return res.status(400).json({
                success: false,
                message: "Please upload and analyze your resume first."
            });
        }

        let list = projectCatalog
            .map(p => scoreProject(p, role, detected, missing))
            .filter(p => p.matchPercentage >= 25)
            .sort((a, b) => b.matchPercentage - a.matchPercentage)
            .slice(0, 6);

        // Kuch match na ho to role ke beginner projects
        if (list.length === 0) {
            list = projectCatalog
                .filter(p => p.roles.includes(role) || p.difficulty === "Beginner")
                .slice(0, 4)
                .map(p => scoreProject(p, role, detected, missing));
        }

        const who = sameUser(userId);
        await db.query(`DELETE FROM project_recommendations WHERE ${who.sql}`, who.params);

        if (list.length > 0) {
            await db.query(
                "INSERT INTO project_recommendations (user_id, target_role, title, difficulty, match_percentage, details) VALUES ?",
                [list.map(p => [userId, role || null, p.title, p.difficulty, p.matchPercentage, JSON.stringify(p)])]
            );
        }

        res.json({ success: true, role, projects: list });

    } catch (error) {
        console.error("Project recommendation error:", error);
        res.status(500).json({ success: false, message: "Could not generate project recommendations." });
    }
});


// GET /feature/projects  -> last saved recommendations
router.get("/projects", async (req, res) => {
    try {
        const who = sameUser(getUserId(req));
        const [rows] = await db.query(
            `SELECT target_role, details FROM project_recommendations
             WHERE ${who.sql} ORDER BY match_percentage DESC, id ASC`,
            who.params
        );

        const projects = rows.map(r => {
            try { return JSON.parse(r.details); } catch (e) { return null; }
        }).filter(Boolean);

        res.json({ success: true, role: rows[0] ? rows[0].target_role : "", projects });
    } catch (error) {
        console.error("Project load error:", error);
        res.status(500).json({ success: false, message: "Could not load projects." });
    }
});


module.exports = router;