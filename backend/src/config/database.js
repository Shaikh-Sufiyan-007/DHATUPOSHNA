import mongoose from 'mongoose';
import config from './env.js';
import logger from '../utils/logger.js';


const CONNECTION_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

let listenersAttached = false;
let cachedPromise = null;

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (!listenersAttached) {
      mongoose.connection.on('connected', () => {
        logger.info(`MongoDB connected successfully to: ${mongoose.connection.host}/${mongoose.connection.name}`);
      });

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection runtime error:', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB connection lost. Disconnected from database.');
      });
      listenersAttached = true;
    }

    if (!cachedPromise) {
      cachedPromise = mongoose.connect(config.mongodb.uri, config.mongodb.options)
        .then(() => mongoose.connection)
        .catch((err) => {
          cachedPromise = null;
          throw err;
        });
    }

    await cachedPromise;
    return mongoose.connection;
  } catch (error) {
    logger.error(`Initial MongoDB connection failed: ${error.message}`);
    return null;
  }
};


export const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      cachedPromise = null;
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
