
import express from 'express';
import enforceReadOnly from '../../../middlewares/readOnly.middleware.js';
import healthRoutes from './health.routes.js';
import dhatuRoutes from './dhatu.routes.js';
import referenceRoutes from './reference.routes.js';
import dhatvagniRoutes from './dhatvagni.routes.js';
import dhatuposhanaRoutes from './dhatuposhana.routes.js';
import conceptRoutes from './concept.routes.js';
import nyayaRoutes from './nyaya.routes.js';
import glossaryRoutes from './glossary.routes.js';
import quizRoutes from './quiz.routes.js';
import revisionRoutes from './revision.routes.js';
import searchRoutes from './search.routes.js';

const router = express.Router();

router.use(enforceReadOnly);

// Mount resources
router.use('/health', healthRoutes);
router.use('/dhatus', dhatuRoutes);
router.use('/references', referenceRoutes);
router.use('/dhatvagni', dhatvagniRoutes);
router.use('/dhatuposhana', dhatuposhanaRoutes);
router.use('/concepts', conceptRoutes);
router.use('/nyayas', nyayaRoutes);
router.use('/glossary', glossaryRoutes);
router.use('/quizzes', quizRoutes);
router.use('/revision', revisionRoutes);
router.use('/search', searchRoutes);

export default router;
