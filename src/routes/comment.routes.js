import { Router } from "express";
import { addTweetComment, addVideoComment, deleteComment, getTweetComments, getVideoComments, updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"



const router = Router();


router.route("/get-all-video-comments/:videoId").get(verifyJWT,getTweetComments);

router.route("/add-video-comment/:videoId").post(verifyJWT,addVideoComment);

router.route("/get-all-tweet-comments/:tweetId").get(verifyJWT,getVideoComments);

router.route("/add-tweet-comment/:tweetId").post(verifyJWT,addTweetComment);

router.route("/update-comment/:commentId").patch(verifyJWT,updateComment);

router.route("/delete-comment").delete(verifyJWT,deleteComment);


export default router;