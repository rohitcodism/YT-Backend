import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, editThumbnail, editVideoFile, getAllVideos, getVideoById, incrementViews, togglePublishStatus, updateVideoDetails, uploadVideo } from "../controllers/video.controller.js";


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

router.route("/delete-video").delete(verifyJWT,deleteVideo)

router.route("/edit-video-file").patch(verifyJWT, upload.single("newVideoFile"), editVideoFile);

router.route("/update-thumbnail").patch(verifyJWT,upload.single("newThumbnail"),editThumbnail);

router.route("/get-video/:videoId").get(verifyJWT,getVideoById);

router.route("/update-video-details/:videoId").patch(verifyJWT,updateVideoDetails);

router.route("/toggle-publish-status/:videoId").patch(verifyJWT,togglePublishStatus);

router.route("/get-all-videos").get(verifyJWT,getAllVideos);

router.route("/increment-views/:videoId").patch(incrementViews);

export default router;