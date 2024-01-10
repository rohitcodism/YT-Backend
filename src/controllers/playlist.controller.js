import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, videoTitles } = req.body

    if ((!name || !description) || videoTitles?.length === 0) {
        throw new apiError(400, "These fields cannot be blank!!!")
    }



    const playlist = await Promise.all(
        videoTitles.map(async (videoTitle) => {
            const video = await Video.findOne({ title: videoTitle })

            if (!video) {
                throw new apiError(400, `Video not found of given title ${videoTitle}!!!`);
            }

            console.log("Video found : ", video);

            return video;
        })
    )

    if (!playlist) {
        throw new apiError(400, "Something went wrong while creating the playlist!!!");
    }

    console.log("Created playlist : ", playlist);

    const newPlayList = await Playlist.create(
        {
            name,
            description,
            owner: req.user?._id,
            videos: playlist,
        }
    )

    if(!newPlayList){
        throw new apiError(500, "Something went wrong while creating a new playlist");
    }

    res
        .status(200)
        .json(
            new apiResponse(
                200,
                newPlayList,
                "Playlist created successfully."
            )
        )
});

export {
    createPlaylist,
}