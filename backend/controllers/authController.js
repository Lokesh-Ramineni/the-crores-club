const bcrypt=require('bcrypt')
const User = require('../models/User');
// const PendingSignup = require('../models/PendingSignup');
const jwt=require('jsonwebtoken')
require("dotenv").config();
// const { sendOtpEmail } = require("../utils/mailer");
// const { reserveEmailSend } = require("../utils/emailQuota");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function generateUniqueUsername(displayName, email) {
    let base = (displayName || email.split("@")[0] || "player")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .slice(0, 18);

    if (!base) {
        base = "player";
    }

    let candidate = base;
    let attempt = 0;

    while (await User.findOne({ username: candidate })) {
        attempt += 1;

        const randomNumber = Math.floor(1000 + Math.random() * 9000);

        // Reserve 4 characters for the random number
        candidate = `${base.slice(0, 14)}${randomNumber}`;

        if (attempt > 10) {
            candidate = `${base.slice(0, 10)}${Date.now().toString().slice(-8)}`;
            break;
        }
    }

    return candidate.slice(0,18);
}

async function googleLogin(credential) {
    if (!credential) {
        throw new Error("Missing Google credential");
    }

    let payload;

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        payload = ticket.getPayload();
    } catch (e) {
        throw new Error("Invalid Google credential");
    }

    if (!payload || !payload.email) {
        throw new Error("Invalid Google credential");
    }

    if (!payload.email_verified) {
        throw new Error("Your Google account's email isn't verified");
    }

    const normalizedEmail = payload.email.toLowerCase().trim();
    const googleId = payload.sub;

    let user = await User.findOne({ googleId });

    if (!user) {
        user = await User.findOne({ email: normalizedEmail });

        if (user) {
            user.googleId = googleId;
            await user.save();
        } else {
            const username = await generateUniqueUsername(payload.name, normalizedEmail);

            user = new User({
                username,
                email: normalizedEmail,
                googleId
            });

            try {
                await user.save();
            } catch (e) {
                if (e.code === 11000) {
                    user.username = await generateUniqueUsername(payload.name, normalizedEmail);
                    await user.save();
                } else {
                    throw e;
                }
            }
        }
    }

    const token = jwt.sign(
        {
            userId: user._id,
            username: user.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    return {
        user,
        token
    };
}

async function login(email,password){
    try{
        const email_registered=await User.findOne({email});

        if(!email_registered){
            throw new Error("Email not found. pls siginup")
        }
        
        const compare=await bcrypt.compare(password,email_registered.password)

        if(!compare){
            throw new Error("Incorrect password")
        }
        
        console.log(process.env.JWT_SECRET);
        const token=jwt.sign(
            {
                userId:email_registered._id,
                username:email_registered.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"1h"
            }
        )
        console.log("✅ Authentication Successful",token)
        return {
            user:email_registered,
            token:token
        };

    }catch(e){
        console.log("❌ Login error ",e);
        throw e;
    }
}

// module.exports={signup,login,requestSignupOtp,verifySignupOtp,googleLogin};
module.exports={login,googleLogin}