const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MeasurementSchema = new Schema({
  sample: {
    type: Schema.Types.ObjectId,
    ref: 'Sample',
    required: true
  },
  measurementType: {
    type: String,
    enum: ['UV_PL', 'UV_PR', 'IR_PL', 'IR_EL', 'MBE_GROWTH'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
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
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  parameters: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  }
});

// Create index for efficient querying
MeasurementSchema.index({ sample: 1, measurementType: 1 });
MeasurementSchema.index({ createdAt: -1 });

// Add text index for full-text search
MeasurementSchema.index({
  title: 'text',
  description: 'text'
});

// Add additional indexes for enhanced filtering and sorting
MeasurementSchema.index({ measurementType: 1 });
MeasurementSchema.index({ title: 1 });
MeasurementSchema.index({ updatedAt: -1 });
MeasurementSchema.index({ createdBy: 1 });

const Measurement = mongoose.model('Measurement', MeasurementSchema);

module.exports = Measurement; 