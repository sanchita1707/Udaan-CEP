// ============================================================
// models/User.js - Mongoose Schema for Users (Students & Admin)
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User Schema
const userSchema = new mongoose.Schema({
  // Student's full name
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },

  // Email address (must be unique)
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },

  // Password (will be hashed before saving)
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },

  // Age of the student
  age: {
    type: Number,
    min: [5, 'Age must be at least 5'],
    max: [18, 'Age must be 18 or below']
  },

  // Class/Grade of the student
  studentClass: {
    type: String,
    trim: true
  },

  // Role: 'student' or 'admin'
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },

  // Profile picture (optional, URL or filename)
  avatar: {
    type: String,
    default: 'default-avatar.png'
  }

}, {
  // Automatically add createdAt and updatedAt fields
  timestamps: true
});

// =====================
// Pre-save Hook: Hash password before saving
// =====================
// This runs automatically before every .save() call
userSchema.pre('save', async function(next) {
  // Only hash if the password was modified (not on every update)
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt (10 rounds is a good balance of security and speed)
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// =====================
// Method: Compare entered password with stored hash
// =====================
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the model
module.exports = mongoose.model('User', userSchema);
