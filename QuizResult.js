// ============================================================
// models/QuizResult.js - Mongoose Schema for Quiz Results
// ============================================================

const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({

  // Reference to the user who took the quiz
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Student name (stored for quick display)
  studentName: {
    type: String,
    required: true
  },

  // Subject of the quiz
  subject: {
    type: String,
    required: true,
    enum: ['English', 'Mathematics', 'Science', 'General Knowledge', 'Computer Basics']
  },

  // Score obtained
  score: {
    type: Number,
    required: true,
    min: 0
  },

  // Total questions in the quiz
  totalQuestions: {
    type: Number,
    required: true
  },

  // Percentage score
  percentage: {
    type: Number,
    required: true
  },

  // Time taken in seconds
  timeTaken: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
