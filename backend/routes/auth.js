import dotenv from 'dotenv'
import express from 'express'
import User from '../models/User.js'
import path from 'path'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import authMidlleware from '../middleware/authMiddleware.js'
import { body, validationResult } from "express-validator";

dotenv.config({ path: path.resolve("../.env") });

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET

router.post('/signup', 
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
        body("role").isIn(["student", "guide"]).withMessage("Role must be either 'student' or 'guide'"),
        body("guideId").optional().isMongoId().withMessage("Invalid Guide ID"),
        body("department").optional().isString(),
      ],
    async (req,res)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
    try {
        const {name, email, password, role, guideId,department } = req.body;
        
        //check if user already exist
        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(400).json({error:"Email already in use"})

        //create new user
        const newUser = new User({
            name,
            email,
            password,
            role,
            guideId,
            department 
        })
      await newUser.save();

      res.status(201).json({message:"SignUp successfull", userId:newUser._id});
    } catch (err) {
        console.error('Error details:', err);
        res.status(500).json({error: "server error"})
    }
})



// Login API
router.post("/login",
    [
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
     async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
    
    try {
      const { email, password } = req.body;
  
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: "User not found" });
  
      //logg the user in the console 
      console.log(user);
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: "Invalid password" });
  
      console.log(isMatch);
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id,
          role: user.role,
          guideId: user.guideId || null, 
        },JWT_SECRET, { expiresIn: "1h" }
      );
  
      res.json({ message: "Login successful", token });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

// router.get('/protected',authMidlleware,(req,res)=>{
//     res.json({
//         message:"You have successully accessed protected route",
//         user:req.user  //user details from token 
//     })
// })



export default router;
