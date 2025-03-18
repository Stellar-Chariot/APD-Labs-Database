const Sample = require('./sample');
const User = require('./User');
const Measurement = require('./Measurement');
const File = require('./File');
const MBERecipe = require('./MBERecipe');
const AnalysisResult = require('./AnalysisResult');

// Don't try to require models that don't exist yet
// We'll directly define dummy models in server.js 

module.exports = {
  Sample,
  User,
  Measurement,
  File,
  MBERecipe,
  AnalysisResult
}; 