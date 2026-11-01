const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadFolder = path.join(__dirname, "../../public/uploads");

// uploads folder nahi hai to automatically create hoga
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() + path.extname(file.originalname);

        cb(null, uniqueName);
    }

});

const upload = multer({
    storage: storage
});

module.exports = upload;