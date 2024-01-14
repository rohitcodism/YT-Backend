import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleLikeVideo } from "../controllers/like.controller.js";



const router = Router();


router.route("/toggle-video-like/:videoId").patch(verifyJWT,toggleLikeVideo);


export default router;