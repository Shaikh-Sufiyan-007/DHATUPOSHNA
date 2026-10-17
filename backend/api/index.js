import app from '../src/app.js';
import { connectDB } from '../src/config/database.js';

connectDB().catch((err) => {
  console.error('Initial MongoDB connection error in serverless entry:', err.message);
});

export default app;
