
import express from 'express';
import {
  getQuizzes,
  getQuizById
} from '../../../controllers/quiz.controller.js';

const router = express.Router();


router.get('/', getQuizzes);


router.get('/:id', getQuizById);

export default router;
