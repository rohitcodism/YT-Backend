import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";


const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new apiError(400, "Expected a channel id!!!");
    }

    const channelVideos = await Video.find({ owner: channelId }).populate("owner");

    console.log(channelVideos);

    if (!channelVideos) {
        throw new apiError(500, "Something went wrong while fetching the channel videos!!!");
    }

    res
        .status(200)
        .json(
            new apiResponse(
                200,
                channelVideos,
                "Channel videos fetched successfully!!!",
            )
        )
});

const testEndPoint = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new apiError(400, "Expected a channel id!!!");
    }

    console.log(channelId);

    res
        .status(200)
        .json(
            new apiResponse(
                200,
                channelId,
                "Test end point for dashboard controller!!!",
            )
        )
});

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new apiError(400, "Expected a channel id!!!");
    }

    const channelStats = await User.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(channelId),
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers",
                },
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "_id",
                    foreignField: "owner",
                    as: "videos",
                    pipeline: [
                        {
                            $group: {
                                _id: null,
                                totalViewsOnchannel: {
                                    $sum: "$views",
                                },
                            },
                        },
                    ],
                },
            },
            {
                $addFields: {
                    totalViews: { $first: "$videos" },
                },
            },
            {
                $set: {
                    totalViews:
                        "$totalViews.totalViewsOnchannel",
                },
            },
            {
                $addFields: {
                    subscribersCount: { $size: "$subscribers" },
                },
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "_id",
                    foreignField: "owner",
                    as: "videosUploadedOnChannel",
                },
            },
            {
                $addFields: {
                    videoCountOnChannel: {
                        $size: "$videosUploadedOnChannel",
                    },
                },
            },
            {
                $project: {
                    username: 1,
                    subscribersCount: 1,
                    videoCountOnChannel: 1,
                    totalViews: 1,
                },
            },
        ]
    );

    console.log("Channel Stats : ",channelStats[0]);

    const totalLikeOnChannel = await Video.aggregate(
        [
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(channelId),
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes"
                }
            },
            {
                $group: {
                    _id: null,
                    likeCountOnChannel: {
                        $sum: { $size: "$likes" }
                    }
                }
            }
        ]
    );

    console.log("Total like on channel : ",totalLikeOnChannel[0]);

    if (!channelStats || channelStats.length === 0) {
        throw new apiError(500, "Something went wrong while fetching the channel stats!!!");
    }

    if(!totalLikeOnChannel || totalLikeOnChannel.length === 0){
        throw new apiError(500, "Something went wrong while fetching the total like on channel!!!");
    }

    const channelStatsWithTotalLike = {
        ...channelStats[0],
        ...totalLikeOnChannel[0],
    }

    res
        .status(200)
        .json(
            new apiResponse(
                200,
                channelStatsWithTotalLike,
                "Channel stats fetched successfully!!!",
            )
        )

})


export {
    getChannelVideos,
    testEndPoint,
    getChannelStats
}