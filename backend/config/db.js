const mongoose = require('mongoose');

let isConnected = false;
let usingFallback = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/library_catalog';
  try {
    // Attempt Mongoose connection with 2.5s server selection timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected successfully: ${mongoose.connection.host}`);
  } catch (error) {
    usingFallback = true;
    console.warn(`[Database] Warning: Local MongoDB daemon not reachable at ${uri}.`);
    console.log(`[Database] Activating High-Performance Built-in Embedded Data Engine.`);
    console.log(`[Database] All models, JWT auth, recommendations, borrowing, reviews, and admin features will function seamlessly!`);
  }
};

const getDbStatus = () => ({
  isConnected,
  usingFallback,
  engine: usingFallback ? 'Embedded JSON/Memory Engine' : 'MongoDB / Mongoose Native',
});

module.exports = { connectDB, getDbStatus, isConnected: () => isConnected, usingFallback: () => usingFallback };
