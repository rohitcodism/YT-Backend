import { Router } from "express";
import { getChannelVideos, getChannelStats } from "../controllers/dashboard.controller.js";


const router = Router();

router.route("/get-videos/:channelId").get(getChannelVideos);

router.route("/get-channel-stats/:channelId").get(getChannelStats);

export default router;