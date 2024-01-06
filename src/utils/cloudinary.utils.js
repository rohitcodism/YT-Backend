import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import { apiError } from './apiError';

cloudinary.config({
    cloud_name: 'dhiytc6vf',
    api_key: '767695252931981', 
    api_secret: 'XanIo5SeI60BQ_DAJEO81tOPceA',
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