import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import GuideRequest from "../models/GuideRequest.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ Student sends guide request
router.post("/request-guide", authMiddleware, async (req, res) => {
    try {
        const { guideId } = req.body;
        const studentId = req.user.userId;

        // Check if a request already exists
        const existingRequest = await GuideRequest.findOne({ studentId });
        if (existingRequest) {
            return res.status(400).json({ error: "Guide request already sent" });
        }

        // Create new guide request
        const newRequest = new GuideRequest({
            studentId,
            guideId
        });

        await newRequest.save();
        res.status(201).json({ message: "Guide request sent", request: newRequest });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});


// ✅ Guide approves or rejects student
router.put("/review-request/:requestId", authMiddleware, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body;

        // ✅ Ensure status is either "approved" or "rejected"
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }
      console.log(requestId);
        // ✅ Find guide request
        const guideRequest = await GuideRequest.findById(requestId);
        if (!guideRequest || guideRequest.guideId.toString() !== req.user.userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }


        // ✅ Update status
        guideRequest.status = status;
        await guideRequest.save();
 
        //find the student and update his guide id 
        const user = User.findById(guideRequest.studentId);
        user.guideId = req.user.userId;

        res.status(200).json({ message: `Guide request ${status}`, guideRequest });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});



export default router;
