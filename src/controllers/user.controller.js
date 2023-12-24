import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { apiResponse } from "../utils/apiResponse.js";

// const registerUser = asyncHandler( async (req, res) => {
//     res.status(200).json({
//         message: "Ok!! its working man",
//     })

//     const {fullName, email, username, password} = req.body;
//     console.log(`Username: ${username} \nemail: ${email}\n`);

//     if([fullName, email, username, password].some((field) => field?.trim() === ""))
//     {
//         throw new apiError(400, "All fields are required!!!")
//     }
//     if(!email.indexOf("@") === -1)
//     {
//         throw new apiError(400, "Incorrect email format!!!")
//     }
//     if(password?.length<8)
//     {
//         throw new apiError(400, "Password must contain at least 8 characters.")
//     }

//     // to check if there is any existing user.
//     const existingUser = await User.findOne({ $or: [{username},{email}] });
//     if(existingUser)
//     {
//         throw new apiError(409, "User already exist.");
//     }
//     console.log(`Existing User : ${existingUser}`)

//     // to check if there exists any avatar or not.
//     const avatarLocalPath = req.files?.avatar[0]?.path;
//     console.log(avatarLocalPath);
//     console.log(req.files?.avatar[0]);

//     // to check if user has uploaded cover image or not..
//     const coverImageLocalPath = req.files?.coverImage[0]?.path;
//     console.log(coverImageLocalPath);
//     console.log(req.files?.coverImage[0]);

//     // if user haven't uploaded avatar it will throw an error.
//     if(!avatarLocalPath){
//         throw new apiError(400, "An avatar is needed.");
//     }
    
//     // to upload avatar and coverImage 
//     const avatar = await uploadOnCloudinary(avatarLocalPath);
//     const coverImage  = await uploadOnCloudinary(coverImageLocalPath);

//     // to check if avatar uploaded correctly on Cloudinary
//     if(!avatar){
//         throw new apiError(400, "An avatar is needed.");
//     }

//     // to save the user into database
//     const user = await User.create(
//         {
//             fullName,
//             avatar : avatar.url,
//             coverImage : coverImage?.url || "",
//             email,
//             password,
//             username : username.toLowerCase(),
//         }
//     )


//     const createdUser = await User.findById(user?._id).select(
//         "-password -refreshToken"
//     );

//     console.log(`created User : ${createdUser}`);

//     console.log(createdUser ? createdUser : "User not created.")

//     if(!createdUser) {
//         throw new apiError(500, "Something went wrong while registering the user.")
//     }else{
//         return res.status(201).json(
//             new apiResponse(201, createdUser, "User Registered Successfully"),
//         );
//     };

// } );


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new apiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new apiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(avatarLocalPath);
    console.log(req.files?.avatar[0]);

    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    console.log(avatar);

    if (!avatar) {
        throw new apiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new apiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered Successfully")
    )

} )


export {registerUser};