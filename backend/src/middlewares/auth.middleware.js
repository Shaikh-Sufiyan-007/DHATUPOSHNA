import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import ApiError from '../utils/apiError.js';
import { User } from '../models/user.model.js';

export const authenticate = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(ApiError.unauthorized('Authentication token is required'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(ApiError.unauthorized('Authentication token has expired'));
      }
      return next(ApiError.unauthorized('Invalid authentication token'));
    }

    const user = await User.findById(decoded.id).select('-__v');
    if (!user) {
      return next(ApiError.unauthorized('User associated with this token no longer exists'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
