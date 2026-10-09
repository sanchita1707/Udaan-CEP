// ============================================================
// models/Feedback.js - Mongoose Schema for User Feedback
// ============================================================

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({

  // Name of the person giving feedback
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },

  // Email (optional but validated if provided)
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },

  // Star rating from 1 to 5
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },

  // Main feedback message
  message: {
    type: String,
    required: [true, 'Feedback message is required'],
    trim: true,
    minlength: [10, 'Feedback must be at least 10 characters']
  },

  // Optional suggestions for improvement
  suggestions: {
    type: String,
    trim: true
  },

  // Whether admin has read this feedback
  isRead: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
