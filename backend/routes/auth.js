const express = require("express");
const { login, requestSignupOtp, verifySignupOtp } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { otpRequestLimiter } = require("../middleware/otpRateLimit");
const User=require("../models/User")
const router = express.Router();

router.post("/signup/request-otp", otpRequestLimiter, async (req, res) => {
    try{
        const {username,email,password}=req.body;

        const result = await requestSignupOtp(username, email, password);

        res.status(200).json({
            message: "Verification code sent",
            email: result.email
        });

    }catch(e){
        res.status(400).json({
            message: e.message
        });
    }

});

router.post("/signup/verify-otp", async (req, res) => {
    try{
        const {email,otp}=req.body;

        const result = await verifySignupOtp(email, otp);

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