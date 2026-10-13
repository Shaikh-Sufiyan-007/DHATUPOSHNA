import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import authService from '../services/auth.service.js';
import { HTTP_STATUS } from '../constants/status.constants.js';

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.signup({ name, email, password });

  new ApiResponse(
    HTTP_STATUS.CREATED,
    result,
    'User registered successfully'
  ).send(res);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });

  new ApiResponse(
    HTTP_STATUS.OK,
    result,
    'Logged in successfully'
  ).send(res);
});

export const logout = asyncHandler(async (req, res) => {
  new ApiResponse(
    HTTP_STATUS.OK,
    null,
    'Logged out successfully'
  ).send(res);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);

  new ApiResponse(
    HTTP_STATUS.OK,
    { user },
    'Retrieved current user profile'
  ).send(res);
});

export default {
  signup,
  login,
  logout,
  getMe
};
