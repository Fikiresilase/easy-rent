const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Existing fields (unchanged, assumed based on authController.js)
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, default: 'user' },
  profile: {
    avatar: String,
    frontId: String,
    backId: String,
    // Other profile fields as per your model
  },
  // New fields for OTP
  resetPasswordOTP: { type: String }, // Hashed OTP
  resetPasswordExpires: { type: Date }, // OTP expiration
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);