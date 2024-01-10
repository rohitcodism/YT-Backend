import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { upload } from "./middlewares/multer.middleware.js";

const app = express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }
));

app.use(express.json());

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());


//routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import playlistRouter from "./routes/playlist.routes.js"

// routes declaration
app.use("/api/v1/users", userRouter); // --> https://localhost:3000/api/v1/users/register

app.use("/api/v1/videos", videoRouter); // --> https://localhost:3000/api/v1/videos

app.use("/api/v1/playlist", playlistRouter) // --> https://localhost:3000/api/v1/playlist

export { app };