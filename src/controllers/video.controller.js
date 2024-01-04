import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary, videoUploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js"
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

const deleteVideo = asyncHandler( async(req, res) => {
    const {title, incomingPassword} = req.body;

    if(!title || !incomingPassword){
        throw new apiError(400, "These fields cannot be blank.");
    }

    const videoToBeDeleted = await Video.findOne({title});

    if(!videoToBeDeleted){
        throw new apiError(400, "Invalid Video!!!");
    }

    const videoOwner = await User.findById(req.user?._id);

    if(!videoOwner){
        throw new apiError(400, "Owner not found!!!")
    }

    const isValidPassword = videoOwner.isPasswordCorrect(incomingPassword);

    if(!isValidPassword){
        throw new apiError(400, "Invalid password!!!");
    }

    try {
        const res = await deleteFromCloudinary(videoToBeDeleted?.videoFile);
        console.log(res);
        console.log("Video file successfully deleted from cloudinary.")
    } catch (error) {
        console.error(error);
        throw new apiError(400, "Something went wrong while deleting the video file!!!");
    }

    try {
        const res = await deleteFromCloudinary(videoToBeDeleted?.thumbnail);
        console.log(res);
        console.log("Thumbnail successfully deleted from cloudinary.")
    } catch (error) {
        console.error(error);
        throw new apiError(400, "Something went wrong while deleting the thumbnail from cloudinary!!!");
    }

    let deletedVideo;
    try {
        deletedVideo = await Video.findByIdAndDelete(videoToBeDeleted?._id);
        console.log("Deleted video : ", deletedVideo)
        console.log("Video successfully deleted from database.")
    } catch (error) {
        console.error(error);
        console.log("Something went wrong while deleting the video from the database!!!");
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            deletedVideo,
            "Video successfully deleted."
        )
    )

})

const editVideoFile = asyncHandler( async(req, res) => {
    const { incomingPassword, oldVideoTitle } = req.body;

    if(!incomingPassword || !oldVideoTitle){
        throw new apiError(400, "These fields cannot be blank.");
    }

    const newVideoFileLocalPath = req.file?.path;

    if(!newVideoFileLocalPath){
        throw new apiError(400, "New video file path is required!!!");
    }

    const newVideoFile = await videoUploadOnCloudinary(newVideoFileLocalPath);

    if(!newVideoFile){
        throw new apiError(500, "Something went wrong while uploading the video file on cloudinary.");
    }

    const newVideo = await Video.findOneAndUpdate(
        {oldVideoTitle},
        {
            $set : {
                videoFile : newVideoFile.url,
            }
        },
        {
            new : true,
        }
    );

    if(!newVideo){
        throw new apiError(500, "Something went wrong Cannot upload the video!!!");
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            newVideo,
            "Video file changed successfully."
        )
    )

})

export {uploadVideo, deleteVideo, editVideoFile};