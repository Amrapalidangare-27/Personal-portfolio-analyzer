function calculateATSScore(text) {

    if (!text || !text.trim()) {

        return {
            score: 0,

            details: {
                contact: 0,
                summary: 0,
                skills: 0,
                education: 0,
                experience: 0,
                projects: 0,
                certifications: 0,
                keywords: 0
            }
        };
    }


    const resume =
        text.toLowerCase();


    let score = 0;


    // =====================================
    // CONTACT
    // =====================================

    let contact = 0;


    const emailPattern =
        /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;


    const phonePattern =
        /(\+91[\s-]?)?[6-9]\d{9}/;


    if (
        emailPattern.test(text)
    ) {
        contact += 5;
    }


    if (
        phonePattern.test(text)
    ) {
        contact += 5;
    }


    score += contact;


    // =====================================
    // SUMMARY / OBJECTIVE
    // =====================================

    const summaryKeywords = [

        "career objective",
        "objective",
        "summary",
        "professional summary",
        "profile",
        "career profile"
    ];


    const hasSummary =
        summaryKeywords.some(
            word =>
                resume.includes(word)
        );


    const summary =
        hasSummary ? 10 : 0;


    score += summary;


    // =====================================
    // SKILLS
    // =====================================

    const skillKeywords = [

        "skills",
        "technical skills",
        "soft skills",
        "problem solving",
        "communication",
        "leadership",
        "decision making",
        "html",
        "css",
        "javascript",
        "python",
        "java",
        "sql",
        "mysql",
        "mongodb",
        "excel",
        "tally",
        "seo",
        "marketing",
        "sales",
        "quality",
        "quality control",
        "quality checking",
        "diamond",
        "customer service",
        "management",
        "canva",
        "figma"
    ];


    const foundSkills =
        skillKeywords.filter(
            skill =>
                resume.includes(skill)
        );


    let skills = 0;


    if (foundSkills.length >= 8) {

        skills = 15;

    } else if (
        foundSkills.length >= 5
    ) {

        skills = 12;

    } else if (
        foundSkills.length >= 3
    ) {

        skills = 9;

    } else if (
        foundSkills.length >= 1
    ) {

        skills = 5;
    }


    score += skills;


    // =====================================
    // EDUCATION
    // =====================================

    const educationKeywords = [

        "education",
        "educational",
        "degree",
        "bachelor",
        "master",
        "college",
        "university",
        "school",
        "hsc",
        "ssc",
        "diploma",
        "b.sc",
        "bsc",
        "b.a",
        "bcom",
        "b.com",
        "m.com",
        "mca",
        "bca"
    ];


    const educationFound =
        educationKeywords.filter(
            word =>
                resume.includes(word)
        );


    let education = 0;


    if (educationFound.length >= 2) {

        education = 10;

    } else if (
        educationFound.length === 1
    ) {

        education = 5;
    }


    score += education;


    // =====================================
    // EXPERIENCE
    // =====================================

    const experienceKeywords = [

        "work experience",
        "experience",
        "employment",
        "worked",
        "working",
        "internship",
        "intern",
        "company",
        "pvt ltd",
        "private limited",
        "years of experience"
    ];


    const experienceFound =
        experienceKeywords.filter(
            word =>
                resume.includes(word)
        );


    let experience = 0;


    if (
        experienceFound.length >= 3
    ) {

        experience = 20;

    } else if (
        experienceFound.length >= 1
    ) {

        experience = 12;
    }


    score += experience;


    // =====================================
    // PROJECTS
    // =====================================

    const projectKeywords = [

        "project",
        "projects",
        "developed",
        "created",
        "built",
        "implemented"
    ];


    const projectFound =
        projectKeywords.filter(
            word =>
                resume.includes(word)
        );


    let projects = 0;


    if (
        projectFound.length >= 2
    ) {

        projects = 10;

    } else if (
        projectFound.length === 1
    ) {

        projects = 5;
    }


    score += projects;


    // =====================================
    // CERTIFICATIONS
    // =====================================

    const certificationKeywords = [

        "certification",
        "certifications",
        "certificate",
        "certified",
        "course",
        "training"
    ];


    const hasCertification =
        certificationKeywords.some(
            word =>
                resume.includes(word)
        );


    const certifications =
        hasCertification ? 5 : 0;


    score += certifications;


    // =====================================
    // IMPORTANT KEYWORDS
    // =====================================

    const importantKeywords = [

        "responsibility",
        "responsibilities",
        "managed",
        "maintained",
        "checked",
        "quality",
        "analyzed",
        "designed",
        "developed",
        "team",
        "customer",
        "client",
        "accuracy",
        "inspection",
        "testing",
        "communication"
    ];


    const keywordFound =
        importantKeywords.filter(
            word =>
                resume.includes(word)
        );


    let keywords = 0;


    if (
        keywordFound.length >= 8
    ) {

        keywords = 10;

    } else if (
        keywordFound.length >= 4
    ) {

        keywords = 7;

    } else if (
        keywordFound.length >= 2
    ) {

        keywords = 4;
    }


    score += keywords;


    if (score > 100) {
        score = 100;
    }


    return {

        score: Math.round(score),

        details: {

            contact,

            summary,

            skills,

            education,

            experience,

            projects,

            certifications,

            keywords
        }
    };
}


module.exports = {
    calculateATSScore
};