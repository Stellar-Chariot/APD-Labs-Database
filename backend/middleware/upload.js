const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Make sure upload directory exists
const createDirIfNotExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Created directory: ${directory}`);
  }
};

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOADS_DIR || './uploads';
    
    // Create upload directory if it doesn't exist
    createDirIfNotExists(uploadDir);
    
    // Create a subdirectory for the current date
    const today = new Date();
    const dateDir = path.join(uploadDir, `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`);
    
    createDirIfNotExists(dateDir);
    
    cb(null, dateDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with the original extension
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    
    cb(null, uniqueFilename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow all file types for now
  // You can add restrictions based on your requirements
  cb(null, true);
};

// Init upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB size limit
  },
  fileFilter: fileFilter
});

module.exports = upload; 