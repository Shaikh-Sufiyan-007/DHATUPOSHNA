

import express from 'express';
import {
  getReferences,
  getReferenceById
} from '../../../controllers/reference.controller.js';

const router = express.Router();


router.get('/', getReferences);


router.get('/:id', getReferenceById);

export default router;
