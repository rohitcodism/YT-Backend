import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleLikeVideo, toggleTweetLike } from "../controllers/like.controller.js";



const router = Router();


router.route("/toggle-video-like/:videoId").patch(verifyJWT,toggleLikeVideo);

router.route("/toggle-tweet-like/:tweetId").patch(verifyJWT,toggleTweetLike);

router.route("/get-liked-videos").get(verifyJWT,getLikedVideos);


export default router;