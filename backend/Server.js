import mongoose from "mongoose";
import dotenv from 'dotenv'
import path from 'path'
import express from 'express'
import authRoute from './routes/auth.js' 
import cors from 'cors'
import projectSubmission from './routes/projectSubmission.js'
import projectRoute from './routes/projectRoute.js'
import guideRequestRoute from './routes/guideRequestRoute.js'
import similarityRoute from './routes/similarityRoute.js';
import getUserRoute from './routes/getUserRoute.js';

const app = express();

app.use(cors());

app.use(express.json())  //express.json() middleware to read JSON data from requests.

dotenv.config({ path: path.resolve("../.env") });

app.use("/api",authRoute); //Authentication related routes 

app.use("/api/submission",  projectSubmission); // submission routes

app.use('/api/projects', projectRoute); // project related routes

app.use('/api/guide',guideRequestRoute ); // route for requesting guide to take student under them 

app.use("/uploads", express.static("uploads")); //to upload pdf

app.use('/api/similar',similarityRoute); //to check the similarit of the project 

app.use('/api/getuser',getUserRoute);// to fetch user based on theier roles

const URI = process.env.MONGO_URI
const PORT = process.env.PORT
if (!URI) {
    throw new Error("MONGO_URI not found in environment variables");
}

console.log(URI);
mongoose.connect(URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
.then(()=>console.log("mongoDB connected"))
.catch((err)=>console.log("mongoDB Connection error",err));


app.listen(PORT,()=>{
    console.log(`server is listening on the port ${PORT}`)
})

