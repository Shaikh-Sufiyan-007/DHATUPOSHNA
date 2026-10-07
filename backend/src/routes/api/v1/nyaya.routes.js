
import express from 'express';
import {
  getNyayas,
  getNyayaById
} from '../../../controllers/nyaya.controller.js';

const router = express.Router();


router.get('/', getNyayas);


router.get('/:id', getNyayaById);

export default router;
