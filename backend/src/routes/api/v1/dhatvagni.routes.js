

import express from 'express';
import {
  getDhatvagniList,
  getDhatvagniById
} from '../../../controllers/dhatvagni.controller.js';

const router = express.Router();

router.get('/', getDhatvagniList);


router.get('/:id', getDhatvagniById);

export default router;
