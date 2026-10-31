import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      dbName: env.DB_NAME,
      serverSelectionTimeoutMS: 10000,
    });

    isConnected = true;
    console.log(`[MongoDB Atlas] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    console.error(`[MongoDB Atlas] Connection error: ${error.message}`);
    // Keep server running or let caller decide, but mark disconnected
    isConnected = false;
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[MongoDB Atlas] Disconnected from database.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB Atlas] Runtime connection error: ${err.message}`);
});

export const getDBConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[MongoDB Atlas] Connection closed cleanly.');
  }
};
