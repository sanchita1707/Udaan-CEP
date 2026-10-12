// ============================================================
// server.js - Main entry point for Udaan Backend Server
// ============================================================

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import route files
const userRoutes = require('./routes/userRoutes');
const quizRoutes = require('./routes/quizRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const progressRoutes = require('./routes/progressRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize Express app
const app = express();

// =====================
// Middleware Setup
// =====================

// Enable CORS so the frontend (different port) can talk to backend
app.use(cors({
  origin: '*', // In production, replace with your actual domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded data (form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from the 'frontend' folder
app.use(express.static(path.join(__dirname, '../frontend')));
// =====================
// API Routes
// =====================
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);

// =====================
// Default Route
// =====================
// Serve index.html for any unknown routes (SPA support)
app.get('*', (req, res) => {
  // Only serve HTML for non-API routes
  if (!req.path.startsWith('/api')) {
   res.sendFile(path.join(__dirname, '../frontend/index.html'));
    res.status(404).json({ message: 'API route not found' });
  }
});

// =====================
// Error Handling Middleware
// =====================
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// =====================
// MongoDB Connection
// =====================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI environment variable is missing.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB: udaan_education');
    // Start the server only after DB connects
    app.listen(PORT, () => {
      console.log(`🚀 Udaan Server running on http://localhost:${PORT}`);
      console.log(`📚 Frontend: http://localhost:${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('⚠️  Make sure MongoDB is running: mongod');
    process.exit(1); // Exit if DB doesn't connect
  });
