const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendOTP = require("../utils/emailService");
require("dotenv").config();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * ✅ Step 1: Send OTP to New Users
 */
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    let user = await User.findOne({ email });

    if (user && user.verified) {
      return res.status(400).json({ message: "User already exists. Please login." });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    if (!user) {
      user = new User({ email, otp, otpExpiry });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
    }

    await user.save();
    await sendOTP(email, otp);

    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

/**
 * ✅ Step 2: Verify OTP & Complete Signup
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, password, name } = req.body;
    let user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found. Please sign up first." });

    if (!user.otp || user.otp !== otp || new Date(user.otpExpiry) < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    if (!password) return res.status(400).json({ message: "Password is required." });

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Update user details
    user.verified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.name = name;
    await user.save();

    res.status(200).json({
      message: "Signup successful!",
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
});

/**
 * ✅ Step 3: User Login (Only Verified Users)
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.verified) {
      return res.status(403).json({ error: "Please verify your email before logging in." });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
