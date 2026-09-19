const mongoose = require("mongoose");

const emailUsageSchema = new mongoose.Schema({
    date: {
        type: String, 
        required: true,
        unique: true
    },
    count: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("EmailUsage", emailUsageSchema);
