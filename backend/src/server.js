const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import GraphQL schema and resolvers
const typeDefs = require('./schema');
const resolvers = require('../resolvers');
let models = {};

try {
  // Try to import models from index.js
  models = require('../models');
  console.log("Models loaded successfully");
} catch (error) {
  console.error("Error loading models:", error.message);
  // Define placeholder models
  console.log("Using placeholder models");
  models = {
    Sample: mongoose.model('Sample', new mongoose.Schema({
      identifier: String,
      name: String,
      substrate: String,
      grower: String
    })),
    Measurement: mongoose.model('Measurement', new mongoose.Schema({
      sample: mongoose.Schema.Types.ObjectId,
      measurementType: String,
      title: String
    })),
    User: mongoose.model('User', new mongoose.Schema({
      username: String,
      email: String,
      role: String
    })),
    File: mongoose.model('File', new mongoose.Schema({
      fileName: String,
      filePath: String
    }))
  };
}

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// File upload configuration
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Return file information
  return res.json({
    fileId: req.file.filename,
    fileName: req.file.originalname,
    filePath: req.file.path,
    fileType: req.file.mimetype,
    fileSize: req.file.size
  });
});

// Serve uploaded files
app.use('/files', express.static(uploadsDir));

// Authentication middleware
const getUser = async (token) => {
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    // In a real app, fetch user from database
    return { id: decoded.id, role: decoded.role };
  } catch (err) {
    return null;
  }
};

// Set up Apollo Server
async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const token = req.headers.authorization?.split(' ')[1] || '';
      const user = await getUser(token);
      return { user, models };
    }
  });

  await server.start();
  server.applyMiddleware({ app });
  
  // Connect to MongoDB
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scientific_data';
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
  
  // Start server
  const PORT = process.env.PORT || 4000;
  const HOST = '0.0.0.0'; // Listen on all network interfaces
  app.listen(PORT, HOST, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`Access from other devices via: http://<your-ip-address>:${PORT}${server.graphqlPath}`);
  });
}

startApolloServer().catch(err => {
  console.error('Error starting server:', err);
}); 