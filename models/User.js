const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  name: { type: String },
  verified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next(); 
 
  
  if (!this.password.startsWith("$2b$")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
  } 

  next();
});

// Password comparison method
userSchema.methods.matchPassword = async function (enteredPassword) {

  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
