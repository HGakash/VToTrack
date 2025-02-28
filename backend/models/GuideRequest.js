import mongoose from "mongoose";

const GuideRequestSchema = new mongoose.Schema({
    studentId: 
    { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    guideId: 
    { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", required: true 
    },
    status: 
    { 
        type: String, 
        enum: ["pending", "approved", "rejected"], 
        default: "pending" 
    },
    requestedAt: 
    { 
        type: Date, 
        default: Date.now
     },
  });
  
  const GuideRequest = mongoose.model("GuideRequest", GuideRequestSchema);
  export default GuideRequest  


