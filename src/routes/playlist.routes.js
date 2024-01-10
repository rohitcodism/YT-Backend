import { Router } from "express";
import { createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylist } from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/create-playlist").post(verifyJWT,createPlaylist);

router.route("/delete-playlist").delete(verifyJWT,deletePlaylist);

router.route("/get-user-playlist").get(verifyJWT,getUserPlaylist);

router.route("/get-playlist-by-id").get(verifyJWT,getPlaylistById);


export default router;