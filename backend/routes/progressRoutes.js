// ============================================================
// routes/progressRoutes.js - Student Progress Routes
// ============================================================

const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const QuizResult = require('../models/QuizResult');
const { protect } = require('../middleware/authMiddleware');

// =====================
// GET /api/progress/:userId - Get student's progress
// =====================
router.get('/:userId', protect, async (req, res) => {
  try {
    // Students can only view their own progress
    if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let progress = await Progress.findOne({ userId: req.params.userId });

    // Create progress document if it doesn't exist
    if (!progress) {
      progress = await Progress.create({ userId: req.params.userId });
    }

    // Fetch recent quiz results
    const recentResults = await QuizResult.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      progress,
      recentResults
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================
// POST /api/progress - Update progress
// =====================
router.post('/', protect, async (req, res) => {
  try {
    const { type, value, subject } = req.body;
    // type can be: 'lesson', 'activity', 'subject'

    let updateQuery = { $set: { lastActive: new Date() } };

    if (type === 'lesson') {
      updateQuery.$inc = { lessonsCompleted: 1, learningPoints: 5 };
    } else if (type === 'activity') {
      updateQuery.$inc = { activitiesCompleted: 1, learningPoints: 15 };
      if (value) {
        updateQuery.$addToSet = { completedActivities: value };
      }
    } else if (type === 'subject') {
      updateQuery.$addToSet = { subjectsExplored: subject };
    }

    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id },
      updateQuery,
      { new: true, upsert: true }
    );

    res.json({ success: true, progress });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
