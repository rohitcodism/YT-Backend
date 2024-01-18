import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Subscription } from "../models/subscription.models.js";


const toggleSubscription = asyncHandler(async(req,res) => {
    const { channelId } = req.params;

    const userId = req.user?._id

    if(!channelId){
        throw new apiError(400, "Expected a channel id!!!");
    }

    const isSubscribed = await Subscription.findOne({channel : channelId, subscriber : userId})

    if(!isSubscribed){
        const updatedSubscription = await Subscription.findOneAndUpdate(
            {
                channel :channelId,
            },
            {
                $pull : {
                    subscriber : userId,
                }
            },
            {
                new : true,
            }
        )

        if(!updatedSubscription){
            throw new apiError(500, "Something went wrong while toggling the subscription!!!");
        }

        res
        .status(200)
        .json(
            new apiResponse(
                200,
                updatedSubscription,
                "Subscription toggled successfully!!!",
            )
        )
    }
    else
    {
        const updatedSubscription = await Subscription.findOneAndUpdate(
            {
                channel :channelId,
            },
            {
                $push : {
                    subscriber : userId,
                }
            },
            {
                new : true,
            }
        )

        if(!updatedSubscription){
            throw new apiError(500, "Something went wrong while toggling the subscription!!!");
        }

        res
        .status(200)
        .json(
            new apiResponse(
                200,
                updatedSubscription,
                "Subscription toggled successfully!!!",
            )
        )
    }
});