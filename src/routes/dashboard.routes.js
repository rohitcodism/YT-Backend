import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelVideos } from "../controllers/dashboard.controller.js";


const router = Router();

router.route("/get-channel-videos/:channelId").get(verifyJWT, getChannelVideos);

export default router;