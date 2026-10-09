// ============================================================
// models/Activity.js - Mongoose Schema for NGO Activities
// ============================================================

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({

  // Title of the activity
  title: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true
  },

  // Detailed description
  description: {
    type: String,
    required: true
  },

  // Type of activity
  type: {
    type: String,
    enum: ['teaching', 'game', 'quiz', 'craft', 'sports', 'awareness', 'other'],
    default: 'teaching'
  },

  // Date the activity was conducted
  date: {
    type: Date,
    default: Date.now
  },

  // Location / NGO name
  location: {
    type: String,
    trim: true
  },

  // Number of students who participated
  participantCount: {
    type: Number,
    default: 0
  },

  // Subjects covered
  subjectsCovered: {
    type: [String],
    default: []
  },

  // Photos (array of image filenames or URLs)
  photos: {
    type: [String],
    default: []
  },

  // Is this a featured/highlighted activity?
  isFeatured: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);
