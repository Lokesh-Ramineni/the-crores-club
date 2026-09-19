const rateLimit = require("express-rate-limit");

const otpRequestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many verification code requests from this device. Please try again later."
    }
});

module.exports = { otpRequestLimiter };
