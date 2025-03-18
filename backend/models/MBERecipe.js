const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// MBE Layer Schema (subdocument)
const MBELayerSchema = new Schema({
  material: {
    type: String,
    required: true,
    trim: true
  },
  thickness: {
    type: Number,
    required: true
  },
  layerOrder: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    trim: true,
    default: null
  },
  growthTempThermocouple: {
    type: Number,
    default: null
  },
  growthTempPyro: {
    type: Number,
    default: null
  },
  isSubstrate: {
    type: Boolean,
    default: false
  },
  composition: {
    type: String,
    trim: true,
    default: null
  },
  purpose: {
    type: String,
    trim: true,
    default: null
  }
});

// MBE Cell Condition Schema (subdocument)
const MBECellConditionSchema = new Schema({
  cellName: {
    type: String,
    required: true,
    trim: true
  },
  temperature: {
    type: Number,
    default: null
  },
  pressure: {
    type: Number,
    default: null
  },
  growthRate: {
    type: Number,
    default: null
  },
  flux: {
    type: Number,
    default: null
  },
  bep: {
    type: Number,
    default: null
  },
  idleTemp: {
    type: Number,
    default: null
  },
  evalTemp: {
    type: Number,
    default: null
  }
});

// Main MBE Recipe Schema
const MBERecipeSchema = new Schema({
  recipeName: {
    type: String,
    required: true,
    trim: true
  },
  grower: {
    type: String,
    required: true,
    trim: true
  },
  growthDate: {
    type: Date,
    required: true
  },
  substrateType: {
    type: String,
    required: true,
    trim: true
  },
  backingWafer: {
    type: String,
    trim: true,
    default: null
  },
  rotationRpm: {
    type: Number,
    default: null
  },
  growthTemp: {
    type: Number,
    default: null
  },
  specialNotes: {
    type: String,
    trim: true,
    default: null
  },
  layers: {
    type: [MBELayerSchema],
    default: []
  },
  cellConditions: {
    type: [MBECellConditionSchema],
    default: []
  }
});

// Create indexes for efficient querying
MBERecipeSchema.index({ recipeName: 'text' });
MBERecipeSchema.index({ grower: 1, growthDate: -1 });

// Add more text fields for comprehensive text search
MBERecipeSchema.index({ 
  recipeName: 'text',
  grower: 'text',
  substrateType: 'text',
  specialNotes: 'text'
});

// Add additional indexes for advanced filtering and sorting
MBERecipeSchema.index({ substrateType: 1 });
MBERecipeSchema.index({ growthDate: -1 });
MBERecipeSchema.index({ growthTemp: 1 });

const MBERecipe = mongoose.model('MBERecipe', MBERecipeSchema);

module.exports = MBERecipe; 