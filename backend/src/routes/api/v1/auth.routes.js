import express from 'express';
import {
  signup,
  login,
  logout,
  getMe
} from '../../../controllers/auth.controller.js';
import { validate } from '../../../validators/validate.middleware.js';
import {
  validateSignup,
  validateLogin
} from '../../../validators/auth.validator.js';
import { authenticate } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/signup', validate(validateSignup), signup);
router.post('/login', validate(validateLogin), login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
