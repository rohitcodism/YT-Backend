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

    let user;

    try {
        const isFieldExists = await User.findOne({ _id: req.user?._id, likedVideos: { $exists: true } })

        console.log(isFieldExists);

        if (isFieldExists) {
            console.log("entered-main-if")
            const isLiked = await User.exists({ _id: req.user?._id, likedVideos: videoId });

            if (!isLiked) {
                console.log("entered-sub-if")
                user = await User.findByIdAndUpdate(
                    req.user?._id,
                    {
                        $push: {
                            likedVideos: videoId,
                        }
                    },
                    {
                        new: true,
                    }
                );
            }
            else {
                console.log("entered-sub-else")
                user = await User.findByIdAndUpdate(
                    req.user?._id,
                    {
                        $pull: {
                            likedVideos: videoId,
                        }
                    },
                    {
                        new: true,
                    }
                );
            }
        } else {
            console.log("Entered else");
            user = await User.findByIdAndUpdate(
                req.user?._id,
                {
                    $addToSet : {
                        likedVideos : [
                            videoId,
                        ]
                    }
                },
                {
                    new: true,
                }
            );
        }

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
    } catch (error) {
        console.error("Error : ",error);
        console.log("Something went wrong!!!");
    }


});


export {
    toggleLikeVideo,
}