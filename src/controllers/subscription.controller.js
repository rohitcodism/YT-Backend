import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Subscription } from "../models/subscription.models.js";
import mongoose from "mongoose";


const toggleSubscription = asyncHandler(async(req,res) => {
    const { channelId } = req.params;

    const userId = req.user?._id

    if(!channelId){
        throw new apiError(400, "Expected a channel id!!!");
    }

    const isSubscribed = await Subscription.findOne({channel : channelId, subscriber : userId})

    if(!isSubscribed){
        const createdSubscription = await Subscription.create(
            {
                subscriber : userId,
                channel :channelId,
            },
        )

        if(!createdSubscription){
            throw new apiError(500, "Something went wrong while toggling the subscription!!!");
        }

        res
        .status(200)
        .json(
            new apiResponse(
                200,
                createdSubscription,
                "Subscription toggled successfully!!!",
            )
        )
    }
    else
    {
        try {
            await Subscription.findByIdAndDelete(isSubscribed?._id);
            console.log("Subscription deleted successfully.");

            res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    null,
                    "Subscription deleted successfully!!!",
                )
            )

        } catch (error) {
            console.error(error);
            throw new apiError(500, "Something went wrong while creating the subscription!!!");
        }
    }
});

const getUserChannelSubscribers = asyncHandler(async(req,res) => {
    const {channelId} = req.params;

    if(!channelId){
        throw new apiError(400, "Expected a channel id!!!");
    }

    const channelSubscribers = await Subscription.aggregate(
        [
            {
                $match : {
                    channel : new mongoose.Types.ObjectId(channelId),
                }
            },
            {
                $project : {
                    subscriber : 1,
                    _id : 0,
                }
            }
        ]
    )

    console.log(channelSubscribers[0]);

    if(!channelSubscribers || !channelSubscribers?.length){
        throw new apiError(500, "Something went wrong while fetching the subscriber count!!!");
    }

    res
    .status(200)
    .json(
        new apiResponse(
            200,
            channelSubscribers[0],
            "Subscribers count fetched successfully!!!",
        )
    )
});

const getSubscribedChannel = asyncHandler(async(req,res) => {
    const {subscriberId} = req.params;

    if(!subscriberId){
        throw new apiError(400, "Expected a subscriber id!!!");
    }

    const subscribedChannels = await Subscription.aggregate(
        [
            {
                $match : {
                    subscriber : new mongoose.Types.ObjectId(subscriberId),
                }
            },
            {
                $project : {
                    subscriber : 1,
                    _id : 0,
                }
            }
        ]
    )

    console.log(subscribedChannels);

    if(!subscribedChannels || !subscribedChannels.length){
        throw new apiError(500, "Something went wrong while fetching the subscribed channels!!!");
    }

    res
    .status(200)
    .json(
        new apiResponse(
            200,
            subscribedChannels[0],
            "Subscribed channels fetched successfully!!!",
        )
    )
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannel,
}