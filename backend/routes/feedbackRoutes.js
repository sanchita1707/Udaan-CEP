// ============================================================
// routes/feedbackRoutes.js - Feedback Submission Routes
// ============================================================

const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// =====================
// POST /api/feedback - Submit new feedback
// =====================
router.post('/', async (req, res) => {
  try {
    const { name, email, rating, message, suggestions } = req.body;

    // Validate required fields
    if (!name || !rating || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your name, rating and feedback message'
      });
    }

    // Create feedback entry in MongoDB
    const feedback = await Feedback.create({
      name,
      email,
      rating: parseInt(rating),
      message,
      suggestions
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! We appreciate it.',
      feedback
    });

  } catch (error) {
    console.error('Feedback error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback. Please try again.',
      error: error.message
    });
  }
});

// =====================
// GET /api/feedback - Get all feedback (admin only)
// =====================
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: feedbacks.length,
      feedbacks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================
// PUT /api/feedback/:id/read - Mark feedback as read (admin only)
// =====================
router.put('/:id/read', protect, adminOnly, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
