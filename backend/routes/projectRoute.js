import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Project from "../models/Project.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

/**
 * @route POST /api/projects/create
 * @desc Create a new project (Student creates a project)
 * @access Private (Only students)
 */
router.post(
  "/create",
  authMiddleware,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    console.log("project route");
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ error: "Only students can create projects" });
      }

      // Check if student already has a project
      const existingProject = await Project.find({ studentId: req.user.userId });
      if (existingProject.length>2) {
        return res.status(400).json({ error: "Project already exists for this student" });
      }

      const { title,category,description,milestones} = req.body;

  console.log("four");

      const newProject = new Project({
        studentId: req.user.userId,
        guideId: req.user.guideId, 
        title,
        description,
        category,
        milestones
      });
  console.log("five");

      await newProject.save();
console.log("six");

      res.status(201).json({ message: "Project created successfully", project: newProject });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * @route GET /api/projects/my-project
 * @desc Get the student's project details
 * @access Private (Only students)
 */
router.get("/my-project", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findOne({ studentId: req.user.userId });
    if (!project) {
      return res.status(404).json({ error: "No project found" });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route PUT /api/projects/update
 * @desc Update project details (Student can update description, guide can update milestones)
 * @access Private (Only student or guide)
 */
router.put(
  "/update/:projectId",
  authMiddleware,
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Check if student or guide is making the update
      if (req.user.userId !== project.studentId.toString() && req.user.userId !== project.guideId?.toString()) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Update fields if provided
      if (req.body.title) project.title = req.body.title;
      if (req.body.description) project.description = req.body.description;
      if (req.body.milestones) project.milestones = req.body.milestones;

      await project.save();
      res.json({ message: "Project updated successfully", project });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

router.delete(
    "/delete/:projectId",
    authMiddleware,
    async (req, res) => {
      try {
        const { projectId } = req.params;
  
        const project = await Project.findById(projectId);
  
        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }
  
        // Only student or guide assigned to the project can delete it
        if (req.user.userId !== project.studentId.toString() && req.user.userId !== project.guideId?.toString()) {
          return res.status(403).json({ error: "Unauthorized to delete this project" });
        }
  

        //deletion of the project 
        await Project.findByIdAndDelete(projectId);
  
        res.json({ message: "Project deleted successfully" });
      } catch (err) {
        res.status(500).json({ error: "Server error" });
      }
    }
  );

export default router;
