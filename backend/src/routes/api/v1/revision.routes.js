
import express from 'express';
import {
  getDhatuComparison,
  getNyayaComparison,
  getQuickRevisionNotes
} from '../../../controllers/revision.controller.js';

const router = express.Router();


router.get('/dhatu-comparison', getDhatuComparison);


router.get('/nyaya-comparison', getNyayaComparison);


router.get('/quick-notes', getQuickRevisionNotes);

export default router;
