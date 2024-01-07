// require("dotenv").config({path: './env'});  // bad for conistency
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})

const PORT = process.env.PORT;

connectDB()
.then(() => {
    app.on("error" , (error) => {
        console.log("ERR: ", error);
        throw error;
    })
    app.listen( PORT || 8000, () => {
        console.log(` server is running at Port :🫡:🫡: ${PORT} :🫡:🫡:`);
    })
})
.catch((err) => {
    console.log("MongoDB connection Failed !!! ", err);
})








// in this approch we make iife function and for connecting database we have use good approch by using try and catch for error handling and async await for wating for data to come form other contnent
/*
import express from "express";
const app = express()

;( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        app.on("error", (error) => {
            console.log("ERR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening to port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("Error: ",error);
        throw error
    }
} )()

*/
