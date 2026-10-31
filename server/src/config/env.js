import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/brightloop',
  DB_NAME: process.env.DB_NAME || 'brightloop',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'brightloop-development-secret-key-32chars',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '3d',
};
