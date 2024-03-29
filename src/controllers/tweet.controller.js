import mongoose from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.utils.js";



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

const updateTweet = asyncHandler(async(req,res) => {
    const {tweetId} = req.params;
    const {newMessage, filesToDelete} = req.body;

    if(!tweetId){
        throw new apiError(400, "Did not get the tweet id!!!");
    }

    console.log("New message : ",newMessage);
    console.log(req.files);
    console.log("Files to remove",filesToDelete);

    let newFilesLocalPath;
    if(req.files){
        newFilesLocalPath = req.files.map((newFile) => {
            return newFile.path;
        })
    }

    console.log("Local path of files to be added : ",newFilesLocalPath);

    let newFiles;
    if(newFilesLocalPath.length > 0){
        newFiles = await Promise.all(
            newFilesLocalPath.map(async(newFileLocalPath) => {
                const newFile = await uploadOnCloudinary(newFileLocalPath);

                return newFile?.url;
            })
        )
    }

    console.log("Uploaded new files on cloudinary : ",newFiles);

    if(!newFiles){
        throw new apiError("Cannot upload new media files on cloudinary!!!");
    }


    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $push : {
                mediaFile : newFiles,
            },
            $set : {
                content : newMessage
            }
        },
        {
            new : true,
        }
    )

    if(!updatedTweet){
        throw new apiError(500, "Cannot update the tweet!!!");
    }

    //TODO : Have plans to edit the existing media files in the tweet, use can remove existing media files in the tweet.

    // if(filesToDelete.length > 0){
    //     filesToDelete.map(async(fileToDelete) => {
    //         try {
    //             await deleteFromCloudinary(fileToDelete)
    //         } catch (error) {
    //             console.log("Something went wrong deleting the replaced files from cloudinary!!!");
    //             console.error(error);

    //             throw new apiError(500, "Cannot delete photos from cloudinary!!!");
    //         }
    //     })
    // }

    res
    .status(200)
    .json(
        new apiResponse(
            200,
            updatedTweet,
            "Tweet updated successfully."
        )
    )

});

const deleteTweet = asyncHandler(async(req,res) =>{
    const { tweetId } = req.params;

    if(!tweetId){
        throw new apiError(400, "Expected a tweet id!!!");
    }

    try {
        await Tweet.findByIdAndDelete(tweetId);
    } catch (error) {
        console.log("Something went wrong while deleting the tweet!!!");
        console.error(error)
    }

    res
    .status(200)
    .json(
        new apiResponse(
            200,
            null,
            "Tweet deleted successfully."
        )
    )
});

const getUserTweets = asyncHandler(async(req,res) => {
    const {userId} = req.params;

    if(!userId){
        throw new apiError(400, "Expected a user id!!!");
    }

    const userTweets = await Tweet.aggregate(
        [
            {
                $match : {
                    owner : new mongoose.Types.ObjectId(userId),
                }
            },
            {
                $project : {
                    _id : 0,
                    content : 1
                }
            }
        ]
    );

    if(!userTweets){
        throw new apiError(500, "Something went wrong while fetching the user tweets!!!");
    }

    console.log(userTweets);

    res
    .status(200)
    .json(
        new apiResponse(
            200,
            userTweets,
            "User tweets fetched successfully!!!",
        )
    )
})

export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets
}