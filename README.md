# Personal Portfolio Analyzer

An AI-assisted web application that analyses a resume (PDF / DOCX), calculates an **ATS score**, detects **skills**, finds the **skill gap** and suitable **careers**, and helps the user improve with a skill tracker, learning planner, project ideas, interview questions, an AI career assistant, a shareable portfolio and achievement badges.

Developed as a T.Y.B.Sc. Computer Science (Semester V) project, Ismail Yusuf College, Mumbai (2026 - 2027).

## Features

- Register / Login with a separate dashboard for every user
- Resume upload (PDF, DOCX, up to 5 MB) and text extraction
- ATS score out of 100 with section-wise breakdown (donut chart)
- Skill detection (51 skills), role match and skill gap for 15 career profiles
- Career suggestions and resume improvement tips
- Skill Progress Tracker with bar chart
- Daily Learning Planner and Project Recommendations
- Interview questions by role
- AI Career Assistant (OpenAI if `OPENAI_API_KEY` is set, otherwise rule-based answers)
- Shareable public portfolio link and 11 achievement badges

## Tech Stack

Node.js, Express.js, MySQL (mysql2), multer, pdf-parse, mammoth, Chart.js, HTML / CSS / JavaScript.

## How to Run

1. Install **Node.js** (v18 or above) and **MySQL Server**.
2. Clone the repository and install packages:
   ```bash
   git clone <your-repository-url>
   cd <repository-folder>
   npm install
   ```
3. Create the database and user in MySQL:
   ```sql
   CREATE DATABASE portfolio_analyzer;
   CREATE USER 'portfolio_app'@'localhost' IDENTIFIED BY 'PortfolioApp@123';
   GRANT ALL PRIVILEGES ON portfolio_analyzer.* TO 'portfolio_app'@'localhost';
   USE portfolio_analyzer;

   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(100) NOT NULL,
       email VARCHAR(150) NOT NULL UNIQUE,
       password VARCHAR(255) NOT NULL
   );
   CREATE TABLE skill_progress (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT NULL,
       skill_name VARCHAR(100) NOT NULL,
       progress INT DEFAULT 0,
       target_level INT DEFAULT 100
   );
   CREATE TABLE portfolios (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT NULL,
       share_slug VARCHAR(150) NOT NULL UNIQUE,
       portfolio_data JSON,
       is_public BOOLEAN DEFAULT TRUE,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   CREATE TABLE interview_questions (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT NULL,
       target_role VARCHAR(100),
       questions JSON,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```
   The tables `learning_plans` and `project_recommendations` are created automatically when the server starts.
   The database settings are in `server/config/db.js`.
4. Start the server:
   ```bash
   node server/server.js
   ```
5. Open **http://localhost:3000** in the browser, register an account and sign in.

## Project Structure

```
public/    HTML pages, CSS and browser JavaScript (dashboard, login, register)
server/    Express server, routes, resume parser and analysis modules
```

## Limitations

- The ATS score is an estimate for learning purposes, not the score of a real employer's system.
- Works best with text-based English resumes (PDF / DOCX); scanned images are not read.
- Passwords are stored as entered and login uses a simple user id; password hashing and token-based login are planned as future work.

## Author

Amrapali Dangre - T.Y.B.Sc. Computer Science, Ismail Yusuf College, Mumbai
