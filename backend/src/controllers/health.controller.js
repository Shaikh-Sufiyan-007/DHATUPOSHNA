

import { getDBStatus } from '../config/database.js';
import config from '../config/env.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/status.constants.js';

export const checkHealth = asyncHandler(async (req, res) => {
  const dbStatus = getDBStatus();

  const healthData = {
    status: dbStatus.isConnected ? 'UP' : 'DEGRADED',
    service: 'Ayurvedic Dhatu Knowledge & Information Platform API',
    phase: 'Phase 2 — Backend Core',
    environment: config.env,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus.state,
      connected: dbStatus.isConnected,
      host: dbStatus.host,
      name: dbStatus.dbName
    },
    version: '1.0.0'
  };

  const statusCode = dbStatus.isConnected
    ? HTTP_STATUS.OK
    : HTTP_STATUS.SERVICE_UNAVAILABLE;

  new ApiResponse(statusCode, healthData, 'API is running').send(res);
});

export default {
  checkHealth
};
