import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary, videoUploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js"
import { apiResponse } from "../utils/apiResponse.js";
import mongoose, { get } from "mongoose";

const getPaginatedData = async(page, limit, owner) => {
    try {
        const skip = (page-1)*limit // to count the number of documents to skip.

        // TODO : Needs to be tested one more time
        const totalCount = await Video.countDocuments({owner : owner}) // to count the total number of documents.
    
        const videos = await Video.find({owner : owner})
            .skip(skip)
            .limit(limit)
    
        if(!videos){
            throw new apiError(500, "Cannot fetch videos from database!!!");
        }

        return{
            total : totalCount,
            page,
            limit,
            videos
        }
    } catch (error) {
        console.log("Something went wrong while fetching the paginated video data from the database!!!");
        console.error(error);
    }


}
const getAllVideos = asyncHandler(async(req,res) => {
    const { page=1, limit=10, query, sortBy, sortType, userId } = req.query;

    if(!sortBy || !sortType || !userId || !query){
        throw new apiError(400, "These fields cannot be blank!!!");
    }

    const uploaderChannel = await User.findById(userId);

    if(!uploaderChannel){
        throw new apiError(400, "Channel not found.");
    }

    try {
        const result = await getPaginatedData(page, limit, userId);
        console.log("Result from the pagination function : \n",result);
        res
        .status(200)
        .json(
            new apiResponse(
                200,
                result,
                "Videos fetched successfully."
            )
        )
    } catch (error) {
        console.log("Something went wrong in the pagination function!!!");
        console.error("Error : ",error);
    }


});

const uploadVideo = asyncHandler( async (req, res) => {
    const { title, description } = req.body;

    if([title, description].some((field) => field?.trim() === "")){
        throw new apiError(400, "All the fields are required!!!");
    }

    console.log(`Files uploaded by user : `, req.files);

    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    

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

});

const editVideoFile = asyncHandler( async(req, res) => {
    const { incomingPassword, oldVideoTitle } = req.body;

    console.log("Request body : ", req.body);

    console.log("Incoming password : ", incomingPassword);

    console.log("Old video title : ", oldVideoTitle);

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

    const oldVideo = await Video.findOne({oldVideoTitle});

    if(!oldVideo){
        throw new apiError(400, "Wrong video title!!!");
    }

    await deleteFromCloudinary(oldVideo?.videoFile);

    const newVideo = await Video.findOneAndUpdate(
        {title : oldVideoTitle},
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

});

const editThumbnail = asyncHandler(async(req,res) => {
    const {incomingPassword, videoTitle} = req.body;

    if(!incomingPassword || !videoTitle){
        throw new apiError(400, "These fields cannot be blanked!!!");
    }

    const video = await Video.findOne({title: videoTitle});

    if(!video){
        throw new apiError(400, "Wrong video title!!!");
    }

    const newThumbnailLocalPath = req.file?.path;

    if(!newThumbnailLocalPath){
        throw new apiError(400, "A new thumbnail is needed to update the video thumbnail!!!");
    }

    const newThumbnail = await uploadOnCloudinary(newThumbnailLocalPath);

    if(!newThumbnail){
        throw new apiError(500, "Cannot upload new thumbnail on cloudinary!!!");
    }

    const updatedThumbnailVideo = await Video.findOneAndUpdate(
        {title : videoTitle},
        {
            $set : {
                thumbnail : newThumbnail.url,
            }
        },
        {
            new : true,
        }
    )

    if(!updatedThumbnailVideo){
        throw new apiError(500, "Cannot update the thumbnail!!!");
    }

    await deleteFromCloudinary(video?.thumbnail);

    res
    .status(200)
    .json(
        new apiResponse(
            200,
            updatedThumbnailVideo,
            "Successfully updated the thumbnail.",
        )
    )
});

const getVideoById = asyncHandler(async(req,res) => {
    const {videoId} = req.params;

    console.log(req.params);

    if(!videoId){
        throw new apiError(400, "Did not get the video id!!!");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new apiError(404, "Video not found!!!");
    }

    res
    .status(200)
    .json(
        new apiResponse(
            200,
            video,
            "Fetched video successfully."
        )
    )
});

const updateVideoDetails = asyncHandler(async(req, res) => {
    const { videoId } = req.params;
    const {newTitle, newDescription} = req.body;

    console.log(req.body);
    console.log(newTitle);
    console.log(newDescription);

    if(!videoId){
        throw new apiError(400, "Invalid video id!!!");
    }

    if([newTitle, newDescription].some((field) => field?.trim() === "")){
        throw new apiError(400, "These fields cannot be blank!!!")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set : {
                title : newTitle,
                description : newDescription,
            }
        },
        {
            new : true,
        }
    );

    if(!video){
        throw new apiError(400, "Something went wrong while updating the video details!!!");
    }

    res
    .status(200)
    .json(
        new apiResponse(
            200,
            video,
            "Successfully updated video details."
        )
    )

});

const togglePublishStatus = asyncHandler(async(req,res) => {
    const {videoId} = req.params;
    const {incomingPassword} = req.body;

    if(!videoId){
        throw new apiError(400, "Did not get the video id!!!");
    }

    if(!incomingPassword){
        throw new apiError(400, "Did not get the password!!!");
    }

    const user = await User.findById(req.user?._id);

    if(!user){
        throw new apiError(400, "Unauthorized request!!!");
    }

    const isPasswordValid = await user.isPasswordCorrect(incomingPassword);

    if(!isPasswordValid){
        throw new apiError(400, "Invalid Password!!!");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set : {
                isPublished : false,
            }
        },
        {
            new : true,
        }
    )

    if(!video){
        throw new apiError(400, "Something went wrong while toggling publish status!!!");
    }

    res
    .status(200)
    .json(
        new apiResponse(
            200,
            video,
            "Publish status toggled successfully!!!"
        )
    )
})

export {
    uploadVideo,
    deleteVideo,
    editVideoFile,
    editThumbnail, 
    updateVideoDetails, 
    getVideoById,
    togglePublishStatus,
    getAllVideos
};