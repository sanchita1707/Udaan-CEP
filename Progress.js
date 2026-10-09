// ============================================================
// models/Progress.js - Mongoose Schema for Student Progress
// ============================================================

const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({

  // Reference to the student
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One progress document per user
  },

  // Number of lessons completed
  lessonsCompleted: {
    type: Number,
    default: 0
  },

  // Subjects explored (array of subject names)
  subjectsExplored: {
    type: [String],
    default: []
  },

  // Total quizzes taken
  quizzesTaken: {
    type: Number,
    default: 0
  },

  // Best quiz score ever
  bestScore: {
    type: Number,
    default: 0
  },

  // Activities completed
  activitiesCompleted: {
    type: Number,
    default: 0
  },

  // Total learning points earned
  learningPoints: {
    type: Number,
    default: 0
  },

  // Array of completed activity names
  completedActivities: {
    type: [String],
    default: []
  },

  // Last active date
  lastActive: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Progress', progressSchema);
