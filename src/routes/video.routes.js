import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadVideo } from "../controllers/video.controller.js";


const router = Router();

// secured routes **requires user to be logged in to use this routes**
router.route("/upload-video").post(
    verifyJWT,
    upload.fields([
        {
            name : 'videoFile',
            maxCount : 1,
        },
        {
            name : 'thumbnail',
            maxCount : 1,
        }
    ]),
    uploadVideo
);

export default router;