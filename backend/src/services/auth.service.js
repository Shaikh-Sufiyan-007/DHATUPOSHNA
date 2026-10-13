import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import { User } from '../models/user.model.js';
import ApiError from '../utils/apiError.js';

class AuthService {

  generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }


  async signup({ name, email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  }

  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  }

  async getMe(userId) {
    const user = await User.findById(userId).select('-__v');
    if (!user) {
      throw ApiError.notFound('User profile not found');
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };
  }
}

export const authService = new AuthService();
export default authService;
