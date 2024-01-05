import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINAEY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        // uplode the file in cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploded successfully
        console.log("file has been uploded successfully on cloudinery",response.url);
        console.log(response);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // removed the tempory saved file
    }
}

export {uploadOnCloudinary}