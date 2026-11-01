const fs = require("fs");
const path = require("path");

async function extractResumeText(filePath) {

    const extension =
        path.extname(filePath)
            .toLowerCase();


    // ==============================
    // PDF
    // ==============================

    if (extension === ".pdf") {

        const pdfParse =
            require("pdf-parse");

        const buffer =
            fs.readFileSync(filePath);

        const data =
            await pdfParse(buffer);

        return data.text || "";
    }


    // ==============================
    // DOCX
    // ==============================

    if (extension === ".docx") {

        const mammoth =
            require("mammoth");

        const result =
            await mammoth.extractRawText({
                path: filePath
            });

        return result.value || "";
    }


    // ==============================
    // DOC
    // ==============================

    if (extension === ".doc") {

        throw new Error(
            "Old .doc format is not supported. Please save the resume as DOCX or PDF."
        );
    }


    throw new Error(
        "Unsupported resume format."
    );
}


module.exports = {
    extractResumeText
};