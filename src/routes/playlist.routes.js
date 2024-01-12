import { Router } from "express";
import { addVideos, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylist, removeVideos, updatePlaylistDetails } from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-playlist").post(verifyJWT,createPlaylist);

router.route("/delete-playlist").delete(verifyJWT,deletePlaylist);

router.route("/get-user-playlist").get(verifyJWT,getUserPlaylist);

router.route("/get-playlist-by-id/:playlistId").get(verifyJWT,getPlaylistById);

router.route("/add-videos/:playlistId").patch(verifyJWT,addVideos);

router.route("/remove-videos/:playlistId/:videoId").patch(verifyJWT,removeVideos);

router.route("/update-playlist-details/:playlistId").patch(verifyJWT,updatePlaylistDetails);


export default router;