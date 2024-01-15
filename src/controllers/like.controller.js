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


export {
    toggleLikeVideo,
}