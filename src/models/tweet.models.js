import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema(
    {
        content : {
            type : String,
            required : true,
        },
        mediaFile : {
            type : String,
        },
        owner : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
        }
    },
    {
        timestamps : true,
    }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);