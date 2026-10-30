const mongoose = require('mongoose');

const dbURI = process.env.MONGODB_URI;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  try {
    await mongoose.connect(dbURI);
    console.log('Successfully connected to MongoDB via Mongoose!');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
