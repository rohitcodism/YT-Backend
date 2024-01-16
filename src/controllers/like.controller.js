import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js"
import { Video } from "../models/video.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.models.js";



const toggleLikeVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params;

    const userId = req.user?._id;

    if(!videoId){
        throw new apiError(400, "Expected a video id!!!");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new apiError(400, "Invalid video to like!!!");
    }

    const existingLike = await Like.findOne({
        owner : userId,
        video : videoId,
    })

    if(existingLike){

        console.log("Existing like : ",existingLike);

        await Like.findByIdAndDelete(existingLike?._id);

        res
        .status(200)
        .json(
            new apiResponse(
                200,
                null,
                "Video like toggled successfully."
            )
        )
    }
    else{
        const newLike = await Like.create(
            {
                owner : userId,
                video : videoId,
            }
        )

        console.log("New Like : ",newLike);

        res
        .status(200)
        .json(
            new apiResponse(
                200,
                newLike,
                "Video like toggled successfully."
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

    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        throw new apiError(400, "Invalid tweet to be liked!!!");
    }

    const existingLike = await Like.findOne({
        owner : userId,
        tweet : tweetId,
    })

    if(existingLike){

        console.log("Existing like : ",existingLike);

        await Like.findByIdAndDelete(existingLike?._id);

        res
        .status(200)
        .json(
            new apiResponse(
                200,
                null,
                "Tweet like toggled successfully."
            )
        )
    }
    else{
        const newLike = await Like.create(
            {
                owner : userId,
                tweet : tweetId,
            }
        )

        console.log("New Like : ",newLike);

        res
        .status(200)
        .json(
            new apiResponse(
                200,
                newLike,
                "Tweet like toggled successfully."
            )
        )
    }
});

const getLikedVideos = asyncHandler(async(req,res) => {
    const userId = req.user?._id;

    if(!userId){
        throw new apiError(400, "Unauthorized request!!!");
    }

    const userLikedVideos = await Like.aggregate(
        [
            {
                $match : {
                    owner : userId,
                    video : {$ne : null}
                }
            },
        ]
    )

    console.log(userLikedVideos);
});


export {
    toggleLikeVideo,
    toggleTweetLike,
    getLikedVideos
}