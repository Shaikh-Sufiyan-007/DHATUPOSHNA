
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import config from './config/env.js';
import routes from './routes/index.js';
import { requestLogger, notFoundHandler, errorHandler } from './middlewares/index.js';

const app = express();

// 1. Security HTTP headers
app.use(helmet());

app.use(
  cors({
    origin: config.isProduction ? config.clientUrl : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));


app.use(requestLogger);


app.use('/', routes);


app.use(notFoundHandler);

app.use(errorHandler);

export default app;
