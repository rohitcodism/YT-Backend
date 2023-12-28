import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.accessTokenGenerator();
        const refreshToken = user.refreshTokenGenerator();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new apiError(500, "Something went wrong while generating access and refresh token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //// get user details from frontend
    //// validation - not empty
    //// check if user already exists: username, email
    //// check for images, check for avatar
    //// upload them to cloudinary, avatar
    //// create user object - create entry in db
    //// remove password and refresh token field from response
    //// check for user creation
    //// return res

    const { fullName, email, username, password } = req.body;
    console.log(`Username: ${username} \nemail: ${email}\n`);

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All fields are required!!!")
    }
    if (!email.indexOf("@") === -1) {
        throw new apiError(400, "Incorrect email format!!!")
    }
    if (password?.length < 8) {
        throw new apiError(400, "Password must contain at least 8 characters.")
    }

    // to check if there is any existing user.
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        throw new apiError(409, "User with same username and email already exists.");
    }
    console.log(`Existing User : ${existingUser}`)

    // to check if there exists any avatar or not.
    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(avatarLocalPath);
    console.log(req.files?.avatar[0]);

    // to check if user has uploaded cover image or not..
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage[0].path) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    // if user haven't uploaded avatar it will throw an error.
    if (!avatarLocalPath) {
        throw new apiError(400, "An avatar is needed.");
    }

    // to upload avatar and coverImage 
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    let coverImage;
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    // to check if avatar uploaded correctly on Cloudinary
    if (!avatar) {
        throw new apiError(400, "An avatar is needed.");
    }

    // to save the user into database
    const user = await User.create(
        {
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase(),
        }
    )


    const createdUser = await User.findById(user?._id).select(
        "-password -refreshToken"
    );

    console.log(`created User : ${createdUser}`);

    console.log(createdUser ? createdUser : "User not created.")

    if (!createdUser) {
        throw new apiError(500, "Something went wrong while registering the user.")
    } else {
        return res.status(201).json(
            new apiResponse(201, createdUser, "User Registered Successfully"),
        );
    };

});


const loginUser = asyncHandler(async (req, res) => {
    //// get user details from the frontend
    //// validation - not empty
    //// check in the database for the user provided username or email and password
    //// validate the password
    //// if password is incorrect throw an error password is incorrect
    //// if password is correct generate access token and refresh token and log the user in
    //// send cookie
    //// send success response

    // getting user details from frontend
    const { username, email, password } = req.body;

    // validating the user details if they are empty or not
    if ([username ? username : email, password].some((field) => field?.trim === "")) {
        throw new apiError(400, "All fields are required!!!");
    }

    // checking for the correct email format
    if (email && email.indexOf('@') === -1) {
        throw new apiError(400, "Incorrect email format!!!");
    }

    // checking if the user exists or not if not then throw an error
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (!existingUser) {
        throw new apiError(400, "User haven't registered yet.");
    }

    // checking if the password is correct or not
    const isPasswordValid = await existingUser.isPasswordCorrect(password);

    // if password is incorrect then throw an error
    if (!isPasswordValid) {
        throw new apiError(401, "Invalid password");
    }

    // if password is correct then generate access token and refresh token with the help of generateAccessAndRefreshTokens function using the user id
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(existingUser._id);

    // to get the user details without password and refresh token
    const loggedInUser = await User.findById(existingUser._id).select("-password -refreshToken");

    // to send the cookie to the frontend setting the cookie options 1. httpOnly is for web server access only 2. secure is for https only 
    const cookieOptions = {
        httpOnly: true,
        secure: true,
    }

    // to send the success response
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new apiResponse(200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully."
            )
        )

});


const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    )

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(
            new apiResponse(200, {}, "User logged out successfully.")
        )
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new apiError(401, "Unauthorized request!!!");
    }

    try {
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedRefreshToken?._id);

        if (!user) {
            throw new apiError(400, "Invalid refresh token.");
        }

        if (user?.refreshToken !== incomingRefreshToken) {
            throw new apiError(400, "Refresh token is expired or used.");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { newAccessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        res
            .status(200)
            .cookie("accessToken", newAccessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new apiResponse(
                    200,
                    { accessToken: newAccessToken, refreshToken: newRefreshToken },
                    "Access token refreshed successfully",
                )
            )
    } catch (error) {
        throw new apiError(
            200,
            error?.message || "Invalid refresh token!!!",
        )
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(req?.user?._id);

    if (!user) {
        throw new apiError(400, "Unauthorized request!!!");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new apiError(400, "Invalid password!!!");
    }

    if ([!newPassword || !confirmPassword].some((field) => field.trim === "")) {
        throw new apiError(400, "All fields are required!!!");
    }

    if (newPassword !== confirmPassword) {
        throw new apiError(400, "Unmatched passwords!!!");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {},
                "Password changed successfully!!!",
            ),
        );

});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                user,
                "Current user fetched successfully",
            ),
        );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email, incomingPassword } = req.body;

    if(!fullName || !email){
        throw new apiError(400, "All fields cannot be blanked!!!");
    }

    if(incomingPassword !== req.user?.password){
        throw new apiError(400, "Invalid password !!!, cannot change the account details.")
    }

    try {
        const user = User.findOneAndUpdate(
            req.user?._id,
            {
                $set : {
                    fullName,
                    email
                }
            },
            {
                new: true,
            }
        ).select("-password");

        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                user,
                "Account updated successfully."
            )
        )
    } catch (error) {
        throw new apiError(400, "Unauthorized request!!!")
    }
});

const updateAvatar = asyncHandler( async (req, res) => {

    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        throw new apiError("Avatar file is required!!!");
    }

    const newAvatar = await uploadOnCloudinary(avatarLocalPath);

    if(!newAvatar.url){
        throw new apiError(400, "Something went wrong while uploading avatar file!!!");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar : newAvatar.url,
            }
        },
        {
            new : true,
        }
    ).select("-password")

    res
    .status(200)
    .json(
        new apiResponse(
            200,
            user,
            "Avatar updated successfully."
        )
    )
});

const updateCoverImage = asyncHandler( async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath){
        throw new apiError(400, "Cover image file required to update it.");
    }

    try {
        const newCoverImage = uploadOnCloudinary(coverImageLocalPath);

        if(!newCoverImage){
            throw new apiError(400, "Can't upload cover image.");
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set : {
                    coverImage : newCoverImage.url,
                }
            },
            {
                new : true,
            }
        ).select("-password");

        res
        .status(200)
        .json(
            new apiResponse(
                200,
                user,
                "Cover image updated successfully",
            ),
        );

    } catch (error) {
        throw new apiError(400, error.message);
    }
})

export { registerUser, loginUser, logOutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatar, updateCoverImage};