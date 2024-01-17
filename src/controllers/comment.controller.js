import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { Tweet } from "../models/tweet.models.js";
import { Video } from "../models/video.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getPaginatedComment = async (page, limit, id, type) => {
    try {
        const skip = (page - 1) * limit;

        if(type === "video"){
            const totalCount = await Comment.countDocuments({ video: id });

            const videoComments = await Comment.find({ video: id })
                .skip(skip)
                .limit(limit)
    
            if (!videoComments) {
                throw new apiError(500, "Cannot fetch comments from the database!!!");
            }
    
            return {
                total: totalCount,
                page,
                limit,
                videoComments
            }
        }
        else if(type === "tweet"){
            const totalCount = await Comment.countDocuments({ tweet: id });

            const tweetComments = await Comment.find({ tweet: id })
                .skip(skip)
                .limit(limit)
    
            if (!tweetComments) {
                throw new apiError(500, "Cannot fetch comments from the database!!!");
            }
    
            return {
                total: totalCount,
                page,
                limit,
                tweetComments
            }
        }
    } catch (error) {
        console.log("Something went wrong while fetching the paginated comments!!!");
        console.error(error);
    }
}

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const { page = 1, limit = 10 } = req.query;

    const video = await Video.findById(videoId);

    if(!video){
        throw new apiError(400, "Invalid video!!!");
    }

    try {
        const result = await getPaginatedComment(page,limit,videoId,"video");

        console.log("Result from the paginated function : ",result);

        if(!result){
            throw new apiError(500, "Something went wrong while getting comments!!!")
        }

        res
        .status(200)
        .json(
            new apiResponse(
                200,
                result?.videoComments,
                "Paginated comment fetched successfully."
            )
        )
    } catch (error) {
        console.log("Something went wrong while fetching the paginated comments!!!");
        console.error(error);
        throw new apiError(500,"Something went wrong while fetching the paginated comments!!!")
    }
});

const getTweetComments = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if(!tweetId){
        throw new apiError(400, "Expected a tweet id as parameter!!!")
    }

    const { page = 1, limit = 10 } = req.query;

    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        throw new apiError(400, "Invalid tweet!!!");
    }

    try {
        const result = await getPaginatedComment(page,limit,tweetId,"tweet");

        console.log("Result from the paginated function : ",result);

        if(!result){
            throw new apiError(500, "Something went wrong while getting comments!!!")
        }

        res
        .status(200)
        .json(
            new apiResponse(
                200,
                result?.tweetComments,
                "Paginated comment fetched successfully."
            )
        )
    } catch (error) {
        console.log("Something went wrong while fetching the paginated comments!!!");
        console.error(error);
        throw new apiError(500,"Something went wrong while fetching the paginated comments!!!")
    }
});

const addVideoComment = asyncHandler(async(req,res) => {
    const { videoId } = req.params;

    const {content} = req.body;

    const userId = req.user?._id;

    if(!videoId){
        throw new apiError(400, "Expected a video id as parameter!!!");
    }

    if(!userId){
        throw new apiError(400, "Unauthorized request!!!");
    }

    if(!content){
        throw new apiError(400, "Content field cannot be blank!!!");
    }

    const videoComment = await Comment.create(
        {
            content,
            video : videoId,
            owner : userId, 
        }
    )

    if(!videoComment){
        throw new apiError(500, "Something went wrong while adding the video comment!!!")
    }

    res
    .status(200)
    .json(
        new apiResponse(
            200,
            videoComment,
            "Video comment added successfully."
        )
    )

});

const addTweetComment = asyncHandler(async(req,res) => {
    const { tweetId } = req.params;

    const {content} = req.body;

    const userId = req.user?._id;

    if(!tweetId){
        throw new apiError(400, "Expected a tweet id as parameter!!!");
    }

    if(!userId){
        throw new apiError(400, "Unauthorized request!!!");
    }

    if(!content){
        throw new apiError(400, "Content field cannot be blank!!!");
    }

    const tweetComment = await Comment.create(
        {
            content,
            tweet : tweetId,
            owner : userId, 
        }
    )

    if(!tweetComment){
        throw new apiError(500, "Something went wrong while adding the tweet comment!!!")
    }

    res
    .status(200)
    .json(
        new apiResponse(
            200,
            tweetComment,
            "Tweet comment added successfully."
        )
    )
});

const updateComment = asyncHandler(async(req,res) => {
    const {commentId} = req.params;
    const {newContent} = req.body;

    if(!commentId){
        throw new apiError(400, "Expected a video or twitter id!!!");
    }

    if(!newContent){
        throw new apiError(400, "These fields cannot be blank!!!");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            content : newContent,
        },
        {
            new : true,
        }
    );

    if(!updatedComment){
        throw new apiError(500, "Something went wrong while updating the comment in the video.")
    }

    res
    .status(200)
    .json(
        new apiResponse(
            500,
            updatedComment,
            "Comment updated successfully!!!",
        )
    )
});

const deleteComment = asyncHandler(async(req,res) => {
    const {commentId} = req.params;

    if(!commentId){
        throw new apiError(400, "Expected a comment id!!!");
    }

    try {
        await Comment.findByIdAndDelete(commentId);

        res
        .status(200)
        .json(
            new apiResponse(
                200,
                null,
                "Comment deleted successfully.",
            )
        )
    } catch (error) {
        console.log("Something went wrong while deleting the comment!!!");
        console.error(error);
        throw new apiError(500, "Something went wrong while deleting the comment!!!")
    }
});


export {
    getVideoComments,
    addVideoComment,
    addTweetComment,
    getTweetComments,
    updateComment,
    deleteComment
}