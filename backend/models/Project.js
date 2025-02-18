import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
    studentId: 
    { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    guideId: 
    { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: false,  //make it falls for now 
        default:null // change this later to true 
    },
    title: 
    { 
        type: String, 
        required: true 
    },
    description: 
        {
         type: String 
        },
    milestones: [
      { 
        name: String, 
        status: { 
        type: String, 
        enum: ["pending", "completed"], 
        default: "pending" 
       } 
   }
    ],
  });
  
  const Project = mongoose.model("Project", ProjectSchema);
  export default Project  



