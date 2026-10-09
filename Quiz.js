// ============================================================
// models/Quiz.js - Mongoose Schema for Quiz Questions
// ============================================================

const mongoose = require('mongoose');

// Schema for each quiz question
const quizSchema = new mongoose.Schema({

  // Subject this question belongs to
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: ['English', 'Mathematics', 'Science', 'General Knowledge', 'Computer Basics'],
    trim: true
  },

  // The actual question text
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
  },

  // Four answer options (array of strings)
  options: {
    type: [String],
    required: [true, 'Options are required'],
    validate: {
      validator: function(v) {
        return v.length === 4; // Must have exactly 4 options
      },
      message: 'Exactly 4 options are required'
    }
  },

  // Index of the correct answer (0, 1, 2, or 3)
  correctAnswer: {
    type: Number,
    required: [true, 'Correct answer index is required'],
    min: 0,
    max: 3
  },

  // Difficulty level
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },

  // Created by (admin user id)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
