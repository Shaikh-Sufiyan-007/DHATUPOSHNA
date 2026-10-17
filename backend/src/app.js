
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import config from './config/env.js';
import routes from './routes/index.js';
import { requestLogger, notFoundHandler, errorHandler } from './middlewares/index.js';
import { connectDB } from './config/database.js';

const app = express();

app.use(helmet());

const getAllowedOrigins = () => {
  if (!config.isProduction) return '*';
  if (!config.clientUrl || config.clientUrl === '*') return true;
  if (config.clientUrl.includes(',')) {
    return config.clientUrl.split(',').map((url) => url.trim());
  }
  return config.clientUrl;
};

app.use(
  cors({
    origin: getAllowedOrigins(),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));


app.use(requestLogger);


app.use('/', routes);


app.use(notFoundHandler);

app.use(errorHandler);

export default app;
