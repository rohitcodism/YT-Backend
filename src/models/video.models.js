import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
    {
        videoFile:
        {
            type: String,
            required: [true, "Video file is required."],
        },
        thumbnail:
        {
            type: String,
            required: [true, "Thumbnail is required."],
        },
        owner:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        title:
        {
            type: String,
            required: [true, "Video titled is required."],
            trim: true,
            index: true,
        },
        description:
        {
            type: String,
            required: [true, "Video description is required."],
            trim: true,
        },
        duration:
        {
            type: Number, // will fetch this from Cloudinary
            // required: [true, "Video duration is required."]
        },
        views:
        {
            type: Number,
            default: 0,
        },
        isPublished:
        {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);