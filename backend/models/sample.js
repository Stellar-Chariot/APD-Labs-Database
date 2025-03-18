const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SampleSchema = new Schema({
  identifier: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  growthDate: {
    type: Date,
    default: null
  },
  substrate: {
    type: String,
    trim: true,
    default: null
  },
  grower: {
    type: String,
    trim: true,
    default: null
  },
  description: {
    type: String,
    trim: true,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  recipe: {
    type: Schema.Types.ObjectId,
    ref: 'MBERecipe',
    default: null
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  }
});

// Create text index for search
SampleSchema.index({ 
  identifier: 'text', 
  name: 'text', 
  description: 'text',
  grower: 'text',
  substrate: 'text'
});

// Create compound index for efficient filtering
SampleSchema.index({ 
  growthDate: -1,
  grower: 1
});

// Add additional indexes for enhanced filtering and sorting
SampleSchema.index({ identifier: 1 });
SampleSchema.index({ name: 1 });
SampleSchema.index({ substrate: 1 });
SampleSchema.index({ createdAt: -1 });
SampleSchema.index({ recipe: 1 });

const Sample = mongoose.model('Sample', SampleSchema);

module.exports = Sample; 