const express = require("express");
const path = require("path");

const app = express();

// Har user ka data alag rakhne ke liye user_id columns (apne aap ban jaate hain)
require("./config/ensureSchema")();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve public folder
app.use(
    express.static(
        path.join(__dirname, "../public")
    )
);

// Authentication + resume routes
const authRoutes = require("./routes/authRoutes");

app.use("/auth", authRoutes);

// Learning Planner + Project Recommendations
const featureRoutes = require("./routes/featuresroutes");
app.use("/feature", featureRoutes);

// Home page
app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "../public/index.html"
        )
    );
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("Portfolio Analyzer Server");
    console.log("--------------------------------");
    console.log(
        `Server running at http://localhost:${PORT}`
    );
});