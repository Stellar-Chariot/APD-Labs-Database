const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnalysisResultSchema = new Schema({
  type: {
    type: String,
    enum: ['PEAK_DETECTION', 'CURVE_FITTING', 'STATISTICAL_ANALYSIS', 'COMPARISON'],
    required: true
  },
  data: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  measurement: {
    type: Schema.Types.ObjectId,
    ref: 'Measurement',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Create index for efficient querying
AnalysisResultSchema.index({ measurement: 1, type: 1 });
AnalysisResultSchema.index({ createdAt: -1 });

const AnalysisResult = mongoose.model('AnalysisResult', AnalysisResultSchema);

module.exports = AnalysisResult; 