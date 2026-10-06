const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'Username is required'], 
        unique: true,
        trim: true 
    },
    email: {
        type : String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\S+@\S+\.\S{2,}$/,
            "Please enter a valid email"
        ]
    },
    password: {
        type: String,
        minlength: [6, "Password must be at least 6 characters"],
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('User', userSchema);
