// ============================================================
// routes/adminRoutes.js - Admin Panel Routes
// ============================================================

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const Feedback = require('../models/Feedback');
const Activity = require('../models/Activity');
const Progress = require('../models/Progress');
const { protect, adminOnly, generateToken } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// =====================
// POST /api/admin/login - Admin Login
// =====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with admin role
    const admin = await User.findOne({ email, role: 'admin' });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    const token = generateToken(admin._id);

    res.json({
      success: true,
      message: `Welcome Admin, ${admin.name}!`,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================
// POST /api/admin/setup - Create initial admin account (run once)
// =====================
router.post('/setup', async (req, res) => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Admin account already exists'
      });
    }

    // Create admin account
    const admin = await User.create({
      name: 'Udaan Admin',
      email: process.env.ADMIN_EMAIL || 'admin@udaan.edu',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      email: admin.email
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================
// GET /api/admin/users - Get all registered users
// =====================
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================
// GET /api/admin/feedback - Get all feedback
// =====================
router.get('/feedback', protect, adminOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json({ success: true, count: feedbacks.length, feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================
// GET /api/admin/results - Get all quiz results
// =====================
router.get('/results', protect, adminOnly, async (req, res) => {
  try {
    const results = await QuizResult.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, count: results.length, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================
// GET /api/admin/stats - Get dashboard statistics
// =====================
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalQuizzes = await Quiz.countDocuments();
    const totalResults = await QuizResult.countDocuments();
    const totalFeedback = await Feedback.countDocuments();
    const avgScore = await QuizResult.aggregate([
      { $group: { _id: null, avg: { $avg: '$percentage' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalQuizzes,
        totalResults,
        totalFeedback,
        averageScore: avgScore.length > 0 ? Math.round(avgScore[0].avg) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================
// DELETE /api/admin/users/:id - Delete a user
// =====================
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Also delete their progress
    await Progress.findOneAndDelete({ userId: req.params.id });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
