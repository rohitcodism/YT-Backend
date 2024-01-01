import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

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

    console.log(`Cloudinary Image Public Id : ${publicId}`);

    try{
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if(error){
                console.log(`Something went wrong while deleting old image.`);
                console.error(error);
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

export { uploadOnCloudinary, deleteFromCloudinary };