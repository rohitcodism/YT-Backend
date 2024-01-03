import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import path from "path";
import { uploadOnCloudinary, videoUploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { Video } from "../models/video.models.js";
import { apiResponse } from "../utils/apiResponse.js";


const uploadVideo = asyncHandler( async (req, res) => {
    const { title, description } = req.body;

    if([title, description].some((field) => field?.trim() === "")){
        throw new apiError(400, "All the fields are required!!!");
    }

    const videoFileLocalPath = req.files?.videoFile[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;

    // console.log(`Files uploaded by user : ${req.files}`);

    if(!videoFileLocalPath){
        throw new apiError(400, "Video file is required!!!");
    }

    if(!videoFileLocalPath?.toLowerCase().includes(".mp4")){
        throw new apiError(400, "You can upload only mp4 file!!!");
    }

    if(!thumbnailLocalPath){
        throw new apiError(400, "Thumbnail is required to upload a video.");
    }

    const videoFile = await videoUploadOnCloudinary(videoFileLocalPath);

    console.log(`videoFile : ${videoFile}`)

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    console.log(`Thumbnail : ${thumbnail}`);

    if(!videoFile){
        throw new apiError(400, "Error while uploading video file!!!");
    }

    if(!thumbnail){
        throw new apiError(400, "Error while uploading the thumbnail!!!");
    }

    const video = await Video.create(
        {
            title,
            description,
            videoFile : videoFile.url,
            thumbnail : thumbnail.url,
            owner : req.user?._id,
            isPublished : true,
        }
    );

    const uploadedVideo = await Video.findById(video?._id);

    console.log(`Uploaded video : ${uploadedVideo}`);

    if(!uploadedVideo){
        throw new apiError(400, "Something went wrong while uploading the video!!!");
    }else{
        res
        .status(200)
        .json(
            200,
            new apiResponse(
                200,
                uploadedVideo,
                "Video uploaded successfully."
            )
        )
    }

});


export {uploadVideo};