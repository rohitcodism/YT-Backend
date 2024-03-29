import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import { apiError } from './apiError.js';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    console.log(`File Path : ${localFilePath}`);
    try {
        console.log(`File Path inside try block : ${localFilePath}`);
        if (!localFilePath){
            console.log(`File Path inside if block : ${localFilePath}`);
            return null;
        }
        const res = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log(`File is uploaded on cloudinary.`);
        console.log(`Response : ${res}`);
        console.log(`Response url : ${res.url}`);
        fs.unlinkSync(localFilePath); // remove the file from our server. As file is already uploaded on cloudinary.
        return res;
    } catch (error) {
        console.log(`Some error happened, while uploading file on cloudinary.`);
        console.error(error);
        console.log(`Removing file from our server.`);
        fs.unlinkSync(localFilePath); // remove the file from our server.
        return null;
    }
}

const deleteFromCloudinary = async (imageUrl) => {

    const publicId = imageUrl.match(/\/v\d+\/(.+)\.\w+$/)[1];

    console.log(`Content url : ${imageUrl}`)

    console.log(`Cloudinary Image Public Id : ${publicId}`);

    try{
        await cloudinary.uploader.destroy(publicId, (error, result) => {
            if(error){
                console.log(`Something went wrong while deleting old image.`);
                console.error(error);
                throw new apiError(500, "Cannot delete old video from cloudinary!!!");
            }else{
                console.log(`Image deleted successfully!!!`);
                console.log(result);
            }
        })
    } catch(error){
        console.log(`Something went wrong while deleting the old image from cloudinary.`)
        console.error(error);
        return null;
    }
}

const videoUploadOnCloudinary = async (videoLocalPath) => {
    console.log(`Video File Path : ${videoLocalPath}`);

    try {
        if(!videoLocalPath){
            console.log(`Video file path inside check block : ${videoLocalPath}`);
            return null;
        }
        const res = await cloudinary.uploader.upload(videoLocalPath, {
            resource_type: "video",
        });
        console.log(`Video uploaded on cloudinary.`);
        console.log(`Response : ${res}`);
        console.log(`Response url  : ${res.url}`);
        fs.unlinkSync(videoLocalPath) // removing the video file from the local server;
        return res;
    } catch (error) {
        console.log(`Something went wrong while uploading the video on cloudinary!!!`, error);
        fs.unlinkSync(videoLocalPath);
        return null;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary, videoUploadOnCloudinary };