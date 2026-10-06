

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = Object.freeze({
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dhatuposhna_db',
    options: {
      autoIndex: process.env.NODE_ENV !== 'production', // Build indexes in dev, manage externally in prod
      serverSelectionTimeoutMS: 5000,                   // Timeout after 5s instead of hanging
      maxPoolSize: 10                                   // Maintain up to 10 socket connections
    }
  },
  apiPrefix: process.env.API_PREFIX || '/api/v1'
});

// Basic validation for critical configuration
if (!config.mongodb.uri) {
  throw new Error('CRITICAL: MONGODB_URI environment variable is not defined.');
}

export default config;
