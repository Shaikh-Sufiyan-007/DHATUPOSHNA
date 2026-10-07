import express from 'express';
import {
  getDhatus,
  getDhatuById
} from '../../../controllers/dhatu.controller.js';

const router = express.Router();


router.get('/', getDhatus);


router.get('/:id', getDhatuById);

export default router;
