
import express from 'express';
import {
  getDhatuposhanaList,
  getDhatuposhanaById
} from '../../../controllers/dhatuposhana.controller.js';

const router = express.Router();


router.get('/', getDhatuposhanaList);


router.get('/:id', getDhatuposhanaById);

export default router;
