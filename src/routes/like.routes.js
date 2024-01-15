import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleLikeVideo, toggleTweetLike } from "../controllers/like.controller.js";



const router = Router();


router.route("/toggle-video-like/:videoId").patch(verifyJWT,toggleLikeVideo);

router.route("/toggle-tweet-like/:tweetId").patch(verifyJWT,toggleTweetLike);


export default router;