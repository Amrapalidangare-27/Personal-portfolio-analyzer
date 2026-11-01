function generateResumeSuggestions(resumeText, atsScore, skillGap) {
    const text = String(resumeText || "").toLowerCase();
    const suggestions = [];

    const hasEmail =
        /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(resumeText);

    const hasPhone =
        /(\+91[\s-]?)?[6-9]\d{9}/.test(resumeText);

    if (!hasEmail) {
        suggestions.push("Add a professional email address.");
    }

    if (!hasPhone) {
        suggestions.push("Add a valid phone number.");
    }

    const hasSummary =
        text.includes("objective") ||
        text.includes("summary") ||
        text.includes("profile");

    if (!hasSummary) {
        suggestions.push(
            "Add a short professional summary or career objective."
        );
    }

    const hasSkills =
        text.includes("skills") ||
        text.includes("skill");

    if (!hasSkills) {
        suggestions.push(
            "Add a dedicated Skills section with job-related skills."
        );
    }

    const hasExperience =
        text.includes("experience") ||
        text.includes("employment") ||
        text.includes("worked") ||
        text.includes("internship");

    if (!hasExperience) {
        suggestions.push(
            "Add relevant work experience, internship or practical experience."
        );
    }

    const achievementWords = [
        "achieved",
        "improved",
        "increased",
        "reduced",
        "managed",
        "handled",
        "completed",
        "responsible",
        "responsibilities"
    ];

    const hasAchievements = achievementWords.some(
        word => text.includes(word)
    );

    if (!hasAchievements) {
        suggestions.push(
            "Add clear responsibilities and achievements using action words."
        );
    }

    const hasCertification =
        text.includes("certification") ||
        text.includes("certificate") ||
        text.includes("certified");

    if (!hasCertification) {
        suggestions.push(
            "Add relevant certifications or professional training if available."
        );
    }

    if (Number(atsScore) < 60) {
        suggestions.push(
            "Improve ATS compatibility using clear headings, relevant keywords and simple formatting."
        );
    } else if (Number(atsScore) < 80) {
        suggestions.push(
            "Improve your ATS score by adding role-specific keywords and measurable achievements."
        );
    } else {
        suggestions.push(
            "Your resume has good ATS compatibility. Keep using relevant job-specific keywords."
        );
    }

    if (
        skillGap &&
        Array.isArray(skillGap.missingSkills) &&
        skillGap.missingSkills.length > 0
    ) {
        suggestions.push(
            "Consider improving these skills: " +
            skillGap.missingSkills.slice(0, 5).join(", ") +
            "."
        );
    }

    if (text.length < 500) {
        suggestions.push(
            "Add more details about your education, experience, responsibilities and skills."
        );
    }

    return suggestions.slice(0, 8);
}

module.exports = {
    generateResumeSuggestions
};