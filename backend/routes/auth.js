const express = require("express");
const { signup, login } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const User=require("../models/User")
const router = express.Router();

router.post("/signup", async(req,res) => {
    try{
        const {username,email,password}=req.body;

        const result = await signup(username, email, password);

        res.status(201).json({
            message: "Signup successful",
            token: result.token,
            user: {
                id: result.user._id,
                username: result.user.username,
                email: result.user.email
            }
        });

    }catch(e){
        res.status(400).json({
            message: e.message
        });
    }
    
});

router.post("/login",async(req,res) => {
    try{
        const {email,password}=req.body;

        const result=await login(email,password);

        res.status(200).json({
            message:"Login successful",
            token: result.token,
            user: {
                id: result.user._id,
                username: result.user.username,
                email: result.user.email
            }
        });
    }catch(e){
        res.status(401).json({
            message:e.message
        });
    }
});


router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            user
        });

    } catch (e) {
        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports=router;