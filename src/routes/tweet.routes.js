import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createTweet, updateTweet } from "../controllers/tweet.controller.js";



const router = Router();

router.route("/create-tweet").post(verifyJWT,upload.array("mediaFile",10),createTweet);

router.route("/update-tweet/:tweetId").patch(verifyJWT,upload.array("newMediaFiles",10),updateTweet);


export default router;