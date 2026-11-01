const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "portfolio_app",
    password: "PortfolioApp@123",
    database: "portfolio_analyzer",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;