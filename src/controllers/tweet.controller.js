import { Tweet } from "../models/tweet.models.js";
import { apiError, apiResponse } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";



const createTweet = async(asyncHandler(async(req,res) => {
    const {message} = req.body;

    const mediaLocalPath = req.files?.media[0].path;

    if(!message){
        throw new apiError(400, "Did not get the caption!!!");
    }

    let mediaFile;
    if(mediaLocalPath){
        mediaFile = await uploadOnCloudinary(mediaLocalPath)
    }

    const tweet = await Tweet.create(
        {
            content : message,
            mediaFile : mediaFile,
            owner : req.user?._id
        }
    )

    if(!tweet){
        throw new apiError(500, "Something went wrong cannot create the tweet!!!");
    }

    res
    .status(200)
    .json(
        new apiResponse(
            200,
            tweet,
            "Tweet created successfully."
        )
    )

}));

export {
    createTweet,
}