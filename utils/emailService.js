const nodemailer = require("nodemailer");
require("dotenv").config();

// 🔹 Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

/**
 * ✅ Send OTP to user email with enhanced design
 * @param {string} email 
 * @param {string} otp 
 */
const sendOTP = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"Your App Name" <${process.env.EMAIL_USER}>`, 
      to: email,
      subject: "🔑 Your OTP for Account Verification",
      html: `
      <div style="max-width: 500px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9; text-align: center;">
        <h2 style="color: #333;">🔒 OTP Verification</h2>
        <p style="font-size: 16px; color: #555;">Use the following OTP to verify your account:</p>
        <div style="font-size: 22px; font-weight: bold; color: #4CAF50; background: #fff; padding: 10px 20px; display: inline-block; border-radius: 5px; border: 2px dashed #4CAF50; margin: 10px 0;">
          ${otp}
        </div>
        <p style="color: #666;">This OTP will expire in <strong>5 minutes</strong>. Do not share this with anyone.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 14px; color: #888;">If you did not request this OTP, please ignore this email.</p>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending OTP:", error.message);
  }
};

module.exports = sendOTP;
