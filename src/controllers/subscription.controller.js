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


export {
    toggleSubscription,
}