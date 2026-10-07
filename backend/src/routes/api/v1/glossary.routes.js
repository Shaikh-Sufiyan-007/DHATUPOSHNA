

import express from 'express';
import {
  getGlossaryTerms,
  getGlossaryTermById
} from '../../../controllers/glossary.controller.js';

const router = express.Router();


router.get('/', getGlossaryTerms);


router.get('/:id', getGlossaryTermById);

export default router;
