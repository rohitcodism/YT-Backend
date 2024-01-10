import { Playlist } from "../models/playlist.models.js";
import { User } from "../models/user.models.js";
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

const deletePlaylist = asyncHandler(async(req,res) => {
    const {playlistId} = req.params;
    const {incomingPassword} = req.body;

    if(!playlistId || !incomingPassword){
        throw new apiError("Did not got the playlist id!!!");
    }

    const user = await User.findById(req.user?._id);

    if(!user){
        throw new apiError(400, "Unauthorized request!!!");
    }

    const isValidPassword = user.isPasswordCorrect(incomingPassword);

    if(!isValidPassword){
        throw new apiError(400, "Invalid password!!!");
    }

    try {
        await Playlist.findByIdAndDelete(playlistId);
        console.log("Playlist deleted successfully");
    } catch (error) {
        console.error(error);
        throw new apiError(500, "Something went wrong while deleting the playlist from the database!!!");
    }

    res
    .status(200)
    .json(
        new apiResponse(
            200,
            null,
            "Playlist deleted successfully."
        )
    )
});

const getUserPlaylist = asyncHandler(async(req,res) => {
    const playlist = await Playlist.findOne({owner : req.user?._id});

    if(!playlist){
        throw new apiError(404, "Playlist not found!!!");
    }

    res
    .status(200)
    .json(
        new apiResponse(
            200,
            playlist,
            "Playlist fetched successfully."
        )
    )
});

const getPlaylistById = asyncHandler(async(req,res) => {
    const {playlistId} = req.params;

    if(!playlistId){
        throw new apiError(400, "Did not get the playlist id!!!");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new apiError(400, "Cannot fetch playlist from database!!!");
    }

    res
    .status(200)
    .json(
        new apiResponse(
            200,
            playlist,
            "Playlist fetched successfully!!!",
        )
    )
})

export {
    createPlaylist,
    deletePlaylist,
    getUserPlaylist,
    getPlaylistById
}