import upload from "../middleware/uploadHandler.js";
import express from 'express';
import Submission from "../models/Submission.js";
import { body, validationResult } from "express-validator";
import authMiddleware from "../middleware/authMiddleware.js";
import Project from "../models/Project.js";
import GuideRequest from "../models/GuideRequest.js";  // Import GuideRequest model

const router = express.Router();

router.post(
  "/submit",
  authMiddleware,
  upload.single("file"), // Middleware to handle file upload
  [
    body("fileType").isIn(["synopsis", "presentation", "report", "code"]).withMessage("Invalid file type"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: "File upload is required" });
    }

    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ error: "Only students can submit projects" });
      }

      // Check if the guide has approved the student
      const guideRequest = await GuideRequest.findOne({ studentId: req.user.userId, status: "approved" });
      if (!guideRequest) {
        return res.status(403).json({ error: "Guide has not approved you yet" });
      }

      // Get the project for the student
      const project = await Project.findOne({ studentId: req.user.userId });

      if (!project) {
        return res.status(400).json({ error: "No active project found" });
      }

      const {fileType, feedback } = req.body;

      const newSubmission = new Submission({
        projectId: project._id,
        studentId: req.user.userId,
        guideId: guideRequest.guideId, // Get guideId from the approved request
        fileType,
        fileUrl: req.file ? `/uploads/${req.file.filename}` : null, // Store file path
        feedback,
      });

      await newSubmission.save();
      res.status(201).json({ message: "Project submitted successfully", submission: newSubmission });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);


//To approve or reject the synopsis
router.put(
  "/review/:submissionId",
  authMiddleware,
  [
    body("status").isIn(["approved", "rejected"]).withMessage("Status must be 'approved' or 'rejected'"),
    body("feedback").notEmpty().withMessage("Feedback is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { submissionId } = req.params;
      const { status, feedback } = req.body;

      // Find submission
      const submission = await Submission.findById(submissionId);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }

      // Check if the logged-in user is the assigned guide
      if (req.user.userId !== submission.guideId.toString()) {
        return res.status(403).json({ error: "Unauthorized: Only assigned guides can review" });
      }

      // Update status and feedback
      submission.status = status;
      submission.feedback = feedback;
      submission.updatedAt = new Date();

      await submission.save();
      res.json({ message: `Submission ${status} successfully`, submission });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);


export default router;

