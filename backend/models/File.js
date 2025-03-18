const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FileSchema = new Schema({
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  filePath: {
    type: String,
    required: true,
    trim: true
  },
  fileType: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  md5Hash: {
    type: String,
    trim: true,
    default: null
  },
  isRawData: {
    type: Boolean,
    default: false
  },
  measurementId: {
    type: Schema.Types.ObjectId,
    ref: 'Measurement',
    default: null
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
});

// Create indexes for efficient querying
FileSchema.index({ measurementId: 1 });
FileSchema.index({ uploadDate: -1 });
FileSchema.index({ fileName: 'text', originalName: 'text' });

const File = mongoose.model('File', FileSchema);

module.exports = File; 