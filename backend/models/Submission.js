import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema({
  projectId: 
   { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Project", 
    required: true 
   },
  studentId: 
  { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", required: true 
  },
  guideId: 
  { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", required: true 
  },
  
  projectTitle: 
  { 
    type: String, 
    required: true 
  }, // Added: Project Title for reference
  abstract: 
  { 
    type: String, 
    required: true 
  }, // Added: Small abstract for topic clarity

  fileType: 
  { 
    type: String, 
    enum: ["synopsis", "presentation", "report", "code"], 
    required: true 
},
  fileUrl: 
  { 
    type: String, 
    required: true,
  }, // Cloud storage URL
  
  submittedAt: 
  { 
    type: Date, 
    default: Date.now 
  },
  status: 
  { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },
    feedback: 
    { 
        type: String, 
        default: "" 
    },
},
  {timestamps:true}
);

const Submission = mongoose.model("Submission", SubmissionSchema);
export default Submission



