import { Comment } from "../models/comment.models.js";
import { Tweet } from "../models/tweet.models.js";
import { Video } from "../models/video.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getPaginatedComment = async (page, limit, videoId) => {
    try {
        const skip = (page - 1) * limit;

        const totalCount = await Comment.countDocuments({ video: videoId });

        const videoComments = await Comment.find({ video: videoId })
            .skip(skip)
            .limit(limit)

        if (!videoComments) {
            throw new apiError(500, "Cannot fetch comments from the database!!!");
        }

        return {
            total: totalCount,
            page,
            limit,
            videoComments
        }
    } catch (error) {
        console.log("Something went wrong while fetching the paginated comments!!!");
        console.error(error);
    }
}

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const { page = 1, limit = 10 } = req.query;

    const video = await Video.findById(videoId);

    if(!video){
        throw new apiError(400, "Invalid video!!!");
    }

    try {
        const result = await getPaginatedComment(page,limit,videoId);

        console.log("Result from the paginated function : ",result);

        if(!result){
            throw new apiError(500, "Something went wrong while getting comments!!!")
        }

        res
        .status(200)
        .json(
            new apiResponse(
                200,
                result?.videoComments,
                "Paginated comment fetched successfully."
            )
        )
    } catch (error) {
        console.log("Something went wrong while fetching the paginated comments!!!");
        console.error(error);
        throw new apiError(500,"Something went wrong while fetching the paginated comments!!!")
    }
});

const addVideoComment = asyncHandler(async(req,res) => {
    const { videoId } = req.params;

    const {content} = req.body;

    const userId = req.user?._id;

    if(!videoId){
        throw new apiError(400, "Expected a video id as parameter!!!");
    }

    if(!userId){
        throw new apiError(400, "Unauthorized request!!!");
    }

    if(!content){
        throw new apiError(400, "Content field cannot be blank!!!");
    }

    const videoComment = await Comment.create(
        {
            content,
            video : videoId,
            owner : userId, 
        }
    )

    if(!videoComment){
        throw new apiError(500, "Something went wrong while adding the video comment!!!")
    }

    res
    .status(200)
    .json(
        new apiResponse(
            200,
            videoComment,
            "Video comment added successfully."
        )
    )

})


export {
    getVideoComments,
    addVideoComment,
}