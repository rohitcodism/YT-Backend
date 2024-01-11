import { Router } from "express";
import { addVideos, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylist } from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/create-playlist").post(verifyJWT,createPlaylist);

router.route("/delete-playlist").delete(verifyJWT,deletePlaylist);

router.route("/get-user-playlist").get(verifyJWT,getUserPlaylist);

router.route("/get-playlist-by-id/:playlistId").get(verifyJWT,getPlaylistById);

router.route("/add-videos/:playlistId").patch(verifyJWT,addVideos);


export default router;