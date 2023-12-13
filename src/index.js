// require('dotenv').config({ path: './env' });
import dotenv from "dotenv";
import { connectDb } from "./db/index.js";
import { app } from "./app.js";

dotenv.config(
    {
        path: "./env"
    }
)

connectDb()
.then((res) => {
    app.on("error", (error) => {
        console.log(`Server error: ${error}`);
        throw error;
    });
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port: ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.log(`MongoDB connection ERROR: ${error}`);
});