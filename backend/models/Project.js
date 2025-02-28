import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    guideId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: false,  
        default: null 
    },
    title: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        enum: ["Societal Project", "Main Project"], 
        required: true 
    },
    description: { 
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
export default Project;
