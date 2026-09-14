const mongoose = require("mongoose");
const {signup,login}=require("../controllers/authController.js")
require("dotenv").config();

const uri = process.env.MONGO_URI;

const connectDb=async () =>{
    try{
        await mongoose.connect(uri);
        console.log("✅ Successfully connected to MongoDB");
    }catch (e) {
        console.error("❌ Error:", e.message);
    }
    
}
module.exports=connectDb