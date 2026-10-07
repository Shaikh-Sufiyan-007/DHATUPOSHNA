

import express from 'express';
import { searchKnowledge } from '../../../controllers/search.controller.js';

const router = express.Router();

router.get('/', searchKnowledge);

export default router;
