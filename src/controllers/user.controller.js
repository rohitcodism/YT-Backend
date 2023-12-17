import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";

const registerUser = asyncHandler( async (req, res) => {
    res.status(200).json({
        message: "Ok!! its working man",
    })

    const {fullName, email, username, password} = req.body;
    console.log(`Username: ${username} \nemail: ${email}\n`);

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

    const existingUser = User.findOne({ $or: [{username},{email}] });
    if(existingUser)
    {
        throw new apiError(409, "User already exist.");
    }

} )

export {registerUser}; 