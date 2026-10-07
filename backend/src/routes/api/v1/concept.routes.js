
import express from 'express';
import {
  getConcepts,
  getConceptById
} from '../../../controllers/concept.controller.js';

const router = express.Router();


router.get('/', getConcepts);

router.get('/:id', getConceptById);

export default router;
