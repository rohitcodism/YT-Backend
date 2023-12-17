import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        username:
        {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email:
        {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        fullName:
        {
            type: String,
            required: true,
        },
        password:
        {
            type: String,
            required: [true, "Password is required"],
            min: [8,'Must be at lease 6 letters, got {VALUE}'],
            max: 12,
        },
        coverImage:
        {
            type: String,
        },
        avatar:
        {
            type: String, // Cloudinary URL
            required: true,
        },
        watchHistory:
        [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video",
            }
        ],
        refreshToken:
        {
            type: String,
        }
    },
    {
        timestamps: true,
    },
);

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.accessTokenGenerator = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        },
    );
};

userSchema.methods.refreshTokenGenerator = async function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        },
    );
};

export const User = mongoose.model("User", userSchema);