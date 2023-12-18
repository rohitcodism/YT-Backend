import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCLoudinary } from "../utils/cloudinary.utils.js";
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    res.status(200).json({
        message: "Ok!! its working man",
    })

    const {fullName, email, username, password} = req.body;
    console.log(`Username: ${username} \nemail: ${email}\n`);
    console.log(`Request Body : ${req.body}`)

    if([fullName, email, username, password].some((field) => field?.trim() === ""))
    {
        throw new apiError(400, "All fields are required!!!")
    }
    if(!email?.contains("@"))
    {
        throw new apiError(400, "Incorrect api format!!!")
    }
    if(password?.length<8)
    {
        throw new apiError(400, "Password must contain at least 8 characters.")
    }

    // to check if there is any existing user.
    const existingUser = User.findOne({ $or: [{username},{email}] });
    if(existingUser)
    {
        throw new apiError(409, "User already exist.");
    }
    console.log(`Existing User : ${existingUser}`)

    // to check if there exists any avatar or not.
    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(req.files?req.files:"");
    console.log(req.files?.avatar[0]);
    console.log(req.files?.avatar);

    // to check if user has uploaded cover image or not..
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    console.log(req.files?req.files:"");
    console.log(req.files?.coverImage[0]);
    console.log(req.files?.coverImage);

    // if user haven't uploaded avatar it will throw an error.
    if(!avatarLocalPath){
        throw new apiError(400, "An avatar is needed.");
    }
    
    // to upload avatar and coverImage 
    const avatar = await uploadOnCLoudinary(avatarLocalPath);
    const coverImage  = await uploadOnCLoudinary(coverImageLocalPath);

    // to check if avatar uploaded correctly on Cloudinary
    if(!avatar){
        throw new apiError(400, "An avatar is needed.");
    }

    // to save the user into database
    const user = await User.create(
        {
            fullName,
            avatar : avatar.url,
            coverImage : coverImage?.url || "",
            email,
            password,
            username : username.toLowerCase(),
        }
    )


    const isUserCreated = await User.findById(user?._id).select(
        "-password -refreshToken"
    );

    console.log(isUserCreated ? isUserCreated : "User not created.")

    if(!isUserCreated) {
        throw new apiError(500, "Something went wrong while registering the user.")
    }else{
        return res.status(201).json(
            new apiResponse(201, isUserCreated, "User Registered Successfully"),
        );
    };

} );

export {registerUser}; 