import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js"
import { Video } from "../models/video.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const toggleLikeVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params;

    const userId = req.user?._id;

    if(!videoId){
        throw new apiError(400, "Expected a video id!!!");
    }

    const existingVideo = await Video.findById(videoId)

    if(!existingVideo){
        throw new apiError(400, "Invalid video id!!!");
    }

    const isLiked = existingVideo.likes?.includes(userId);

    if(!isLiked){
        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                $push: {
                    likes: userId,
                }
            }
        )

        if(!updatedVideo){
            throw new apiError(500, "Cannot toggle the tweet like!!!");
        }

        res
        .status(200)
        .json(
            new apiResponse(
                200,
                updatedVideo,
                "Like toggled successfully!!!",
            )
        )
    }
    else{
        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                $pull: {
                    likes: userId,
                }
            }
        )

        if(!updatedVideo){
            throw new apiError(500, "Cannot toggle the tweet like!!!");
        }

        res
        .status(200)
        .json(
            new apiResponse(
                200,
                updatedVideo,
                "Like toggled successfully!!!",
            )
        )
    }

});

const toggleTweetLike = asyncHandler(async(req,res) => {
    const {tweetId} = req.params;

    const userId = req.user?._id;

    if(!tweetId){
        throw new apiError(400, "Expected a tweet id!!!");
    }

    const existingTweet = await Tweet.findById(tweetId)

    if(!existingTweet){
        throw new apiError(400, "Invalid tweet id!!!");
    }

    const isLiked = existingTweet.likes?.includes(userId);

    if(!isLiked){
        const updatedTweet = await Tweet.findByIdAndUpdate(
            tweetId,
            {
                $push: {
                    likes: userId,
                }
            }
        )

        if(!updatedTweet){
            throw new apiError(500, "Cannot toggle the tweet like!!!");
        }

        res
        .status(200)
        .json(
            new apiResponse(
                200,
                updatedTweet,
                "Like toggled successfully!!!",
            )
        )
    }
    else{
        const updatedTweet = await Tweet.findByIdAndUpdate(
            tweetId,
            {
                $pull: {
                    likes: userId,
                }
            }
        )

        if(!updatedTweet){
            throw new apiError(500, "Cannot toggle the tweet like!!!");
        }

        res
        .status(200)
        .json(
            new apiResponse(
                200,
                updatedTweet,
                "Like toggled successfully!!!",
            )
        )
    }
})


export {
    toggleLikeVideo,
    toggleTweetLike
}