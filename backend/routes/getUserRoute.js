import express from 'express';
import User from "../models/User.js";
import authMiddleware from '../middleware/authMiddleware.js';


const router = express.Router();

// ✅ Route: Fetch users with optional role filtering
router.get("/user", authMiddleware, async (req, res) => {
    try {
      const { role } = req.query; // Extract role from query params
  
      let filter = {};
      if (role) {
        filter.role = role; // Filter users based on role if provided
      }
  
      const users = await User.find(filter).select("name email role _id");
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });
  
  export default router;


