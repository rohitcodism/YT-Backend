import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";



const router = Router();

router.route("/toggle-subscription/:channelId").post(verifyJWT, toggleSubscription);

router.route("/get-user-channel-subscribers/:channelId").get(verifyJWT,getUserChannelSubscribers);


export default router;