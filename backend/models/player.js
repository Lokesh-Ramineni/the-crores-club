const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Player name is required"],
            trim: true
        },

        role: {
            type: String,
            required: [true, "Player role is required"],
            enum: {
                values: [
                    "Batsman",
                    "Bowler",
                    "All-Rounder",
                    "Wicketkeeper-Batsman"
                ],
                message: "Invalid player role"
            }
        },

        basePrice: {
            type: Number,
            required: [true, "Base price is required"],
            min: [0, "Base price cannot be negative"]
        },

        country: {
            type: String,
            required: [true, "Country is required"],
            trim: true
        },

        image: {
            type: String,
            required: [true, "Player image URL is required"],
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = playerSchema;