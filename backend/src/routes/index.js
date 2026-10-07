
import express from 'express';
import healthRoutes from './health.routes.js';
import v1Routes from './api/v1/index.js';

const router = express.Router();

router.use('/health', healthRoutes);

router.use('/api/v1', v1Routes);

router.get('/', (req, res) => {
  res.status(200).json({
    service: 'Ayurvedic Dhatu Knowledge & Information Platform API',
    phase: 'Phase 6 — Read-Only API, Search & Filtering',
    status: 'online',
    access: 'Strictly Read-Only (GET only)',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      dhatus: '/api/v1/dhatus',
      dhatvagni: '/api/v1/dhatvagni',
      dhatuposhana: '/api/v1/dhatuposhana',
      nyayas: '/api/v1/nyayas',
      concepts: '/api/v1/concepts',
      glossary: '/api/v1/glossary',
      quizzes: '/api/v1/quizzes',
      references: '/api/v1/references',
      search: '/api/v1/search',
      revision: '/api/v1/revision'
    }
  });
});

export default router;
