import mongoose from 'mongoose';
import config from './env.js';
import logger from '../utils/logger.js';


const CONNECTION_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      logger.info('MongoDB connection already established.');
      return mongoose.connection;
    }
    mongoose.connection.on('connected', () => {
      logger.info(`MongoDB connected successfully to: ${mongoose.connection.host}/${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection runtime error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection lost. Disconnected from database.');
    });

    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    return mongoose.connection;
  } catch (error) {
    logger.error(`Initial MongoDB connection failed: ${error.message}`);
    // In production we exit; in dev we log clearly
    if (config.isProduction) {
      process.exit(1);
    }
    return null;
  }
};


export const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed gracefully.');
    }
  } catch (error) {
    logger.error('Error during MongoDB disconnection:', error.message);
  }
};

export const getDBStatus = () => {
  const stateCode = mongoose.connection.readyState;
  return {
    state: CONNECTION_STATES[stateCode] || 'unknown',
    isConnected: stateCode === 1,
    host: mongoose.connection.host || null,
    dbName: mongoose.connection.name || null
  };
};

export default {
  connectDB,
  disconnectDB,
  getDBStatus
};
