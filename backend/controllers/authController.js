const bcrypt=require('bcrypt')
const User = require('../models/User');
const jwt=require('jsonwebtoken')
require("dotenv").config();

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
            token: token
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

module.exports={signup,login};