import multer from "multer";

const storage = multer.diskStorage(
    {
        destination: function (req, file, cb) {
            cb(null, './public/temp')
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + "_@#" + file.originalname);
        },
    },
    console.log("File uploaded on local server."),
);

export const upload = multer({ storage });