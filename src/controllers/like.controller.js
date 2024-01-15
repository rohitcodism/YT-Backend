import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js"
import { Video } from "../models/video.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const toggleLikeVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new apiError(400, "Expected a video id!!!");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new apiError("Invalid video!!!");
    }

    const existingUser = req.user;

    const isLiked = existingUser.likedVideos?.includes(videoId);

    console.log(" liked : ",isLiked);

    if(isLiked){
        const user = await User.findByIdAndUpdate(
            existingUser?._id,
            {
                $pull: {
                    likedVideos: videoId
                }
            }
        )

        console.log(user)

        if (!user) {
            throw new apiError(500, "Something went wrong while updating the liked status of the video!!!");
        }
    
        res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    user,
                    "Video like status toggled successfully."
                )
            )
    }
    else{
        const user = await User.findByIdAndUpdate(
            existingUser?._id,
            {
                $push: {
                    likedVideos: videoId,
                }
            }
        )

        console.log(user)

        if (!user) {
            throw new apiError(500, "Something went wrong while updating the liked status of the video!!!");
        }
    
        res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    user,
                    "Video like status toggled successfully."
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