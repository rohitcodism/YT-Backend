import { Router } from "express";
import { addVideoComment, getVideoComments } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"



const router = Router();


router.route("/get-all-video-comments/:videoId").get(verifyJWT,getVideoComments);

router.route("/add-video-comment/:videoId").post(verifyJWT,addVideoComment);


export default router;