// =====================================================
// ensureSchema.js  ->  server/config/ensureSchema.js
// Server start hone par apne aap user_id columns add karta hai,
// taaki har user ka data alag-alag save ho. Manual SQL ki zaroorat nahi.
// Dobara chalane se koi nuksaan nahi (jo pehle se hai use chhodta hai).
// =====================================================
const db = require("./db");

const TABLES = [
    "skill_progress",
    "portfolios",
    "interview_questions",
    "learning_plans",
    "project_recommendations"
];

async function tableExists(name) {
    const [rows] = await db.query(
        `SELECT COUNT(*) AS c FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
        [name]
    );
    return rows[0].c > 0;
}

async function columnExists(table, column) {
    const [rows] = await db.query(
        `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column]
    );
    return rows[0].c > 0;
}

async function ensureSchema() {
    try {
        // 1) Har table mein user_id column
        for (const table of TABLES) {
            if (!(await tableExists(table))) continue;
            if (!(await columnExists(table, "user_id"))) {
                await db.query(`ALTER TABLE ${table} ADD COLUMN user_id INT NULL`);
                console.log(`Schema: user_id column added to ${table}`);
            }
        }

        // 2) skill_progress: sirf skill_name par UNIQUE key ho to hatao
        //    (warna dusre user ki same skill save nahi hogi)
        if (await tableExists("skill_progress")) {
            const [idx] = await db.query(
                `SELECT INDEX_NAME AS name,
                        GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS cols
                 FROM information_schema.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'skill_progress'
                       AND NON_UNIQUE = 0 AND INDEX_NAME <> 'PRIMARY'
                 GROUP BY INDEX_NAME`
            );
            for (const i of idx) {
                if (String(i.cols).toLowerCase() === "skill_name") {
                    await db.query(`ALTER TABLE skill_progress DROP INDEX \`${i.name}\``);
                    console.log(`Schema: unique key on skill_name removed (${i.name})`);
                }
            }
        }
        console.log("Schema check done (per-user data ready).");
    } catch (error) {
        console.error("Schema check failed (app will still run):", error.message);
    }
}

module.exports = ensureSchema;
