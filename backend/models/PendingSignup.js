const mongoose = require("mongoose");

const pendingSignupSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        username: {
            type: String,
            required: true
        },
        passwordHash: {
            type: String,
            required: true
        },
        otpHash: {
            type: String,
            required: true
        },
        otpAttempts: {
            type: Number,
            default: 0
        },
        sendCount: {
            type: Number,
            default: 1
        },
        windowStartedAt: {
            type: Date,
            default: Date.now
        },
        lastSentAt: {
            type: Date,
            default: Date.now
        },
        expiresAt: {
            type: Date,
            required: true
        }
    },
    { timestamps: true }
);

pendingSignupSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PendingSignup", pendingSignupSchema);
