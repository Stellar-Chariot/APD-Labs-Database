const mongoose = require('mongoose');
require('dotenv').config();
const models = require('../models');

const seedSamples = async () => {
  const sampleData = [
    {
      identifier: 'SAMPLE-001',
      name: 'Test Sample 1',
      substrate: 'GaAs',
      grower: 'Dr. Smith'
    },
    {
      identifier: 'SAMPLE-002',
      name: 'Test Sample 2',
      substrate: 'InP',
      grower: 'Dr. Doe'
    }
  ];

  try {
    await models.Sample.deleteMany({});
    console.log('Cleared old sample data.');
    const insertedSamples = await models.Sample.insertMany(sampleData);
    console.log('Inserted sample data:', insertedSamples);
  } catch (error) {
    console.error('Error seeding sample data:', error);
  }
};

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/scientific-data-system';
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for seeding.');
    await seedSamples();
    console.log('Seeding completed.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

seedDatabase(); 