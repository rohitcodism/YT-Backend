import { Router } from "express";
import { addVideos, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylist } from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/create-playlist").post(verifyJWT,createPlaylist);

router.route("/delete-playlist").delete(verifyJWT,deletePlaylist); // TODO : Yet to test!!

router.route("/get-user-playlist").get(verifyJWT,getUserPlaylist); // TODO : Yet to test!!

router.route("/get-playlist-by-id").get(verifyJWT,getPlaylistById); // TODO : Yet to test!!

router.route("/add-videos").patch(verifyJWT,addVideos); // TODO : Yet to test!!


export default router;