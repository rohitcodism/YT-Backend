import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.models.js";


const getChannelVideos = asyncHandler(async(req,res) => {
    const {channelId} = req.params;

    if(!channelId){
        throw new apiError(400, "Expected a channel id!!!");
    }

    const channelVideos = await Video.find({owner : channelId}).populate("owner");

    console.log(channelVideos);

    if(!channelVideos){
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


export {
    getChannelVideos,
}