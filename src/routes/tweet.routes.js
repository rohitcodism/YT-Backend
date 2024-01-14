import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";



const router = Router();

router.route("/create-tweet").post(verifyJWT,upload.array("mediaFile",10),createTweet);

router.route("/update-tweet/:tweetId").patch(verifyJWT,upload.array("newMediaFiles",10),updateTweet);

router.route("/delete-tweet/:tweetId").delete(verifyJWT,deleteTweet);

router.route("/get-user-tweets/:userId").get(verifyJWT,getUserTweets);


export default router;