const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const contactRoutes = require('./routes/contact');
const projectRoutes = require('./routes/projects');
const chatRoutes = require('./routes/chat');

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes that don't require MongoDB
app.use('/api/chat', chatRoutes);

// Health check route (doesn't require MongoDB)
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'OK', 
    message: 'API is running',
    database: dbStatus
  });
});

// Add debug endpoint directly to app
app.get('/api/debug', (req, res) => {
  res.json({
    nodeVersion: process.version,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT
    },
    mongodb: {
      uri: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 15) + '...' : 'not set',
      connected: mongoose.connection.readyState === 1
    },
    geminiApi: {
      keyExists: !!process.env.GEMINI_API_KEY,
      keyFirstChars: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) + '...' : 'not set'
    }
  });
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware to check MongoDB connection for routes that require it
const requireDb = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      success: false, 
      message: 'Database connection unavailable. Please try again later.' 
    });
  }
  next();
};

// Routes that require MongoDB
app.use('/api/contact', requireDb, contactRoutes);
app.use('/api/projects', requireDb, projectRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});