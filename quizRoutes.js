// ============================================================
// routes/quizRoutes.js - Quiz CRUD Routes
// ============================================================

const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const Progress = require('../models/Progress');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// =====================
// GET /api/quizzes - Get all quiz questions (optional filter by subject)
// =====================
router.get('/', async (req, res) => {
  try {
    const { subject } = req.query;
    
    // Build filter object
    const filter = subject ? { subject } : {};
    
    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
    
    // If no questions found, seed some sample data
    if (quizzes.length === 0 && subject) {
      return res.json({
        success: true,
        count: 0,
        quizzes: [],
        message: 'No questions found for this subject'
      });
    }

    res.json({
      success: true,
      count: quizzes.length,
      quizzes
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================
// POST /api/quizzes - Add a new quiz question (admin only)
// =====================
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { subject, question, options, correctAnswer, difficulty } = req.body;

    if (!subject || !question || !options || correctAnswer === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject, question, options, and correctAnswer'
      });
    }

    const quiz = await Quiz.create({
      subject,
      question,
      options,
      correctAnswer,
      difficulty: difficulty || 'easy',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Quiz question added successfully',
      quiz
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================
// PUT /api/quizzes/:id - Update a quiz question (admin only)
// =====================
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz question not found' });
    }

    res.json({ success: true, message: 'Quiz updated successfully', quiz });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================
// DELETE /api/quizzes/:id - Delete a quiz question (admin only)
// =====================
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz question not found' });
    }

    res.json({ success: true, message: 'Quiz question deleted successfully' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================
// POST /api/quizzes/results - Submit quiz result
// =====================
router.post('/results', protect, async (req, res) => {
  try {
    const { subject, score, totalQuestions, timeTaken } = req.body;

    const percentage = Math.round((score / totalQuestions) * 100);

    // Save quiz result
    const result = await QuizResult.create({
      userId: req.user._id,
      studentName: req.user.name,
      subject,
      score,
      totalQuestions,
      percentage,
      timeTaken
    });

    // Update student progress
    await Progress.findOneAndUpdate(
      { userId: req.user._id },
      {
        $inc: { quizzesTaken: 1, learningPoints: score * 10 },
        $max: { bestScore: percentage },
        $set: { lastActive: new Date() }
      },
      { upsert: true }
    );

    res.status(201).json({
      success: true,
      message: 'Quiz result saved!',
      result
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================
// GET /api/quizzes/results - Get quiz results (protected)
// =====================
router.get('/results', protect, async (req, res) => {
  try {
    const results = await QuizResult.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================
// POST /api/quizzes/seed - Seed sample questions (for testing)
// =====================
router.post('/seed', async (req, res) => {
  try {
    // Delete existing questions first
    await Quiz.deleteMany({});

    const sampleQuestions = [
      // English Questions
      { subject: 'English', question: 'How many letters are in the English alphabet?', options: ['24', '25', '26', '27'], correctAnswer: 2, difficulty: 'easy' },
      { subject: 'English', question: 'Which of these is a vowel?', options: ['B', 'C', 'A', 'D'], correctAnswer: 2, difficulty: 'easy' },
      { subject: 'English', question: 'What is the opposite of "big"?', options: ['Large', 'Small', 'Tall', 'Wide'], correctAnswer: 1, difficulty: 'easy' },
      { subject: 'English', question: 'Which word is a noun?', options: ['Run', 'Quickly', 'Happy', 'Book'], correctAnswer: 3, difficulty: 'easy' },
      { subject: 'English', question: 'Choose the correct spelling:', options: ['Beutiful', 'Beautifull', 'Beautiful', 'Beautyful'], correctAnswer: 2, difficulty: 'medium' },
      
      // Mathematics Questions
      { subject: 'Mathematics', question: 'What is 7 + 8?', options: ['13', '14', '15', '16'], correctAnswer: 2, difficulty: 'easy' },
      { subject: 'Mathematics', question: 'What is 12 × 3?', options: ['34', '36', '35', '37'], correctAnswer: 1, difficulty: 'easy' },
      { subject: 'Mathematics', question: 'What is 100 ÷ 5?', options: ['15', '25', '20', '10'], correctAnswer: 2, difficulty: 'easy' },
      { subject: 'Mathematics', question: 'What is 15 - 7?', options: ['6', '7', '8', '9'], correctAnswer: 2, difficulty: 'easy' },
      { subject: 'Mathematics', question: 'What is the value of 2³?', options: ['6', '8', '9', '12'], correctAnswer: 1, difficulty: 'medium' },
      
      // Science Questions
      { subject: 'Science', question: 'What do plants need to make their food?', options: ['Moonlight', 'Sunlight', 'Firelight', 'Starlight'], correctAnswer: 1, difficulty: 'easy' },
      { subject: 'Science', question: 'How many legs does a spider have?', options: ['6', '8', '10', '4'], correctAnswer: 1, difficulty: 'easy' },
      { subject: 'Science', question: 'What is the largest planet in our solar system?', options: ['Earth', 'Saturn', 'Jupiter', 'Mars'], correctAnswer: 2, difficulty: 'easy' },
      { subject: 'Science', question: 'What gas do plants absorb from the air?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctAnswer: 2, difficulty: 'medium' },
      { subject: 'Science', question: 'What is the boiling point of water?', options: ['90°C', '95°C', '100°C', '110°C'], correctAnswer: 2, difficulty: 'easy' },
      
      // General Knowledge Questions
      { subject: 'General Knowledge', question: 'What is the capital of India?', options: ['Mumbai', 'Chennai', 'New Delhi', 'Kolkata'], correctAnswer: 2, difficulty: 'easy' },
      { subject: 'General Knowledge', question: 'How many states are there in India?', options: ['26', '27', '28', '29'], correctAnswer: 2, difficulty: 'medium' },
      { subject: 'General Knowledge', question: 'Who is the Father of the Nation of India?', options: ['Nehru', 'Gandhi', 'Bose', 'Tilak'], correctAnswer: 1, difficulty: 'easy' },
      { subject: 'General Knowledge', question: 'Which is the largest ocean in the world?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctAnswer: 3, difficulty: 'easy' },
      { subject: 'General Knowledge', question: 'In which sport is the term "century" used?', options: ['Football', 'Cricket', 'Hockey', 'Tennis'], correctAnswer: 1, difficulty: 'easy' },
      
      // Computer Basics Questions
      { subject: 'Computer Basics', question: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Power Unit', 'Core Processing Unit', 'Central Power Unit'], correctAnswer: 0, difficulty: 'easy' },
      { subject: 'Computer Basics', question: 'Which device is used to input data by clicking?', options: ['Keyboard', 'Monitor', 'Mouse', 'Speaker'], correctAnswer: 2, difficulty: 'easy' },
      { subject: 'Computer Basics', question: 'What does WWW stand for?', options: ['World Wide Web', 'World Web Wide', 'Wide World Web', 'Web World Wide'], correctAnswer: 0, difficulty: 'easy' },
      { subject: 'Computer Basics', question: 'Which key is used to delete text to the left?', options: ['Delete', 'Backspace', 'Escape', 'Enter'], correctAnswer: 1, difficulty: 'easy' },
      { subject: 'Computer Basics', question: 'What is used to store permanent data in a computer?', options: ['RAM', 'CPU', 'Hard Drive', 'Monitor'], correctAnswer: 2, difficulty: 'medium' },
    ];

    await Quiz.insertMany(sampleQuestions);

    res.json({
      success: true,
      message: `${sampleQuestions.length} quiz questions seeded successfully!`
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
