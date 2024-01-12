import { Tweet } from "../models/tweet.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";



const createTweet = asyncHandler(async(req,res) => {
    const {message} = req.body;

    console.log(req.files);

    let mediaFileLocalPath;
    if(req.files){
        mediaFileLocalPath = req.files.map((file) => {
            return file.path;
        })
    }

    console.log("Media file local path : ",mediaFileLocalPath);

    if(!message){
        throw new apiError(400, "Did not get the caption!!!");
    }

    let mediaFiles;
    if(mediaFileLocalPath.length > 0){
        mediaFiles = await Promise.all(
            mediaFileLocalPath?.map(async(filePath) => {
                const uploadedFile = await uploadOnCloudinary(filePath)

                return uploadedFile.url;
            })
        )
    }

    console.log("Uploaded files on Cloudinary : ",mediaFiles);

    const tweet = await Tweet.create(
        {
            content : message,
            mediaFile : mediaFiles || [],
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

});

export {
    createTweet,
}