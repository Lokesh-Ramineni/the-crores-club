const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

async function sendOtpEmail(toEmail, otp) {
    const { error } = await resend.emails.send({
        from: `The Crores Club <${FROM_EMAIL}>`,
        to: toEmail,
        subject: `${otp} is your verification code`,
        text:
            `Your The Crores Club verification code is ${otp}. ` +
            `It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
        html: `
            <div style="font-family: -apple-system, Segoe UI, Inter, sans-serif; padding: 24px; color: #1E211D;">
                <h2 style="margin: 0 0 12px;">Verify your email</h2>
                <p style="margin: 0 0 20px; color: #5C6259;">
                    Use this code to finish creating your account. It expires in 10 minutes.
                </p>
                <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; padding: 16px 24px; background: #F3ECDC; border-radius: 10px; display: inline-block;">
                    ${otp}
                </div>
                <p style="margin: 20px 0 0; color: #9CA396; font-size: 12.5px;">
                    Didn't try to sign up? You can safely ignore this email.
                </p>
            </div>
        `
    });

    if (error) {
        console.error("RESEND SEND ERROR:", error);
        throw new Error("Failed to send verification email");
    }
}

module.exports = { sendOtpEmail };
