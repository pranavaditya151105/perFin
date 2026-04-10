const mongoose = require('mongoose');

const connectDB = async () => {
  // Read env vars at call time (not at require time) so dotenv has already loaded
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
  const MONGO_DB = process.env.MONGO_DB || 'perfin';

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      dbName: MONGO_DB,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host} | DB: ${conn.connection.name}`);

    // Drop legacy index that causes E11000 duplicate key error
    try {
      await mongoose.connection.collection('users').dropIndex('username_1');
    } catch (_) {
      // Silently ignore if the index doesn't exist
    }
  } catch (error) {
    console.log('------------------------------------------');
    console.log('❌ DATABASE CONNECTION CRITICAL ERROR');
    console.log('Error Message:', error.message);
    console.log('URI Used:', MONGO_URI);
    console.log('DB Name Used:', MONGO_DB);
    console.log('------------------------------------------');
    process.exit(1);
  }
};

module.exports = connectDB;
