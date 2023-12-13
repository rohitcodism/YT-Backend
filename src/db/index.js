import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDb = async () => {
    try
    {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected to ${connectionInstance} \n DB Host: ${connectionInstance.connection.host} \n DB Name: ${connectionInstance.connection.name} \n}`);
    }
    catch(error)
    {
        console.log( `MongoDB connection FAILED !!! ${error}` );
        process.exit(1);
    }
};