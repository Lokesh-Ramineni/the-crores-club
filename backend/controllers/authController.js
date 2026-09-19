const bcrypt=require('bcrypt')
const User = require('../models/User');
const PendingSignup = require('../models/PendingSignup');
const jwt=require('jsonwebtoken')
require("dotenv").config();
const { sendOtpEmail } = require("../utils/mailer");
const { reserveEmailSend } = require("../utils/emailQuota");

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_SENDS_PER_WINDOW = 5;
const SEND_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

async function requestSignupOtp(username, email, password) {
    if (!username || !email || !password) {
        throw new Error("Username, email and password are required");
    }

    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
        $or: [{ username }, { email: normalizedEmail }]
    });

    if (existingUser) {
        if (existingUser.username === username) {
            throw new Error("Username already exists.");
        }
        throw new Error("Email already exists.");
    }

    const now = Date.now();
    const existingPending = await PendingSignup.findOne({ email: normalizedEmail });

    if (existingPending) {
        const sinceLastSend = now - existingPending.lastSentAt.getTime();

        if (sinceLastSend < RESEND_COOLDOWN_MS) {
            const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - sinceLastSend) / 1000);
            throw new Error(`Please wait ${waitSeconds}s before requesting another code.`);
        }

        const windowStillActive =
            (now - existingPending.windowStartedAt.getTime()) < SEND_WINDOW_MS;

        if (windowStillActive && existingPending.sendCount >= MAX_SENDS_PER_WINDOW) {
            throw new Error("Too many verification codes requested for this email. Please try again later.");
        }
    }

    const allowed = await reserveEmailSend();

    if (!allowed) {
        throw new Error("We're unable to send verification emails right now. Please try again tomorrow.");
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const passwordHash = await bcrypt.hash(password, 10);

    const windowStillActive =
        existingPending &&
        (now - existingPending.windowStartedAt.getTime()) < SEND_WINDOW_MS;

    const windowStartedAt = windowStillActive ? existingPending.windowStartedAt : new Date(now);
    const sendCount = windowStillActive ? existingPending.sendCount + 1 : 1;

    await PendingSignup.findOneAndUpdate(
        { email: normalizedEmail },
        {
            email: normalizedEmail,
            username,
            passwordHash,
            otpHash,
            otpAttempts: 0,
            sendCount,
            windowStartedAt,
            lastSentAt: new Date(now),
            expiresAt: new Date(now + OTP_TTL_MS)
        },
        { upsert: true, setDefaultsOnInsert: true }
    );

    await sendOtpEmail(normalizedEmail, otp);

    return { email: normalizedEmail };
}

async function verifySignupOtp(email, otp) {
    if (!email || !otp) {
        throw new Error("Email and code are required");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const pending = await PendingSignup.findOne({ email: normalizedEmail });

    if (!pending) {
        throw new Error("No pending signup found for this email. Please sign up again.");
    }

    if (pending.expiresAt.getTime() < Date.now()) {
        await PendingSignup.deleteOne({ _id: pending._id });
        throw new Error("This code has expired. Please request a new one.");
    }

    if (pending.otpAttempts >= MAX_OTP_ATTEMPTS) {
        await PendingSignup.deleteOne({ _id: pending._id });
        throw new Error("Too many incorrect attempts. Please request a new code.");
    }

    const isMatch = await bcrypt.compare(otp, pending.otpHash);

    if (!isMatch) {
        pending.otpAttempts += 1;
        await pending.save();
        throw new Error("Incorrect code. Please try again.");
    }

    const newUser = new User({
        username: pending.username,
        email: pending.email,
        password: pending.passwordHash
    });

    let savedUser;

    try {
        savedUser = await newUser.save();
    } catch (e) {
        if (e.code === 11000) {
            throw new Error("That username or email was just taken. Please try signing up again.");
        }
        throw e;
    }

    await PendingSignup.deleteOne({ _id: pending._id });

    const token = jwt.sign(
        {
            userId: savedUser._id,
            username: savedUser.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    return {
        user: savedUser,
        token: token
    };
}

async function signup(username, email, password){
    const saltRounds = 10;
    try{
        console.log(username,email,password)
        const exsisting_user=await username_check(username);

        if(exsisting_user){
            throw new Error("Username alredy exists.")
        }
        
        const existing_email=await email_check(email);

        if(existing_email){
            throw new Error("Email already exists.")
        }
        
        const hashed_password=await bcrypt.hash(password,saltRounds)

        const userdetails={
            username:username,
            password:hashed_password,
            email:email
        };

        const newUser=new User({
            username:userdetails.username,
            email:userdetails.email,
            password:userdetails.password
        })

        const savedUser = await newUser.save();

        const token = jwt.sign(
            {
                userId: savedUser._id,
                username: savedUser.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        return {
            user: savedUser,
            token:token
        };
    }catch (e){
        if (e.code === 11000) {
            console.error("❌ Registration failed: Username or Email already exists!");
        } else {
            console.error("❌ Error saving user:", e.message);
        }
        throw e;
    }
    
}

async function username_check(username){
    try{
        const check_username = await User.findOne({username});
        if(check_username){
            return true;
        }
        return false
    }catch (e){
        console.log("Failed to check username",e);
        throw e;
    }
}

async function email_check(email){
    try{
        const check_email = await User.findOne({email});

        if(check_email){
            return true;
        }
        return false
    }catch (e){
        console.log("Failed to check email",e);
        throw e;
    }
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

module.exports={signup,login,requestSignupOtp,verifySignupOtp};