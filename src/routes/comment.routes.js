import { Router } from "express";
import { addTweetComment, addVideoComment, deleteComment, getTweetComments, getVideoComments, updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { get } from "mongoose";



const router = Router();


router.route("/get-all-video-comments/:videoId").get(verifyJWT,getVideoComments);

router.route("/add-video-comment/:videoId").post(verifyJWT,addVideoComment);

router.route("/get-all-tweet-comments/:tweetId").get(verifyJWT,getTweetComments);

router.route("/add-tweet-comment/:tweetId").post(verifyJWT,addTweetComment);

router.route("/update-comment/:commentId").patch(verifyJWT,updateComment);

router.route("/delete-comment/:commentId").delete(verifyJWT,deleteComment);


export default router;