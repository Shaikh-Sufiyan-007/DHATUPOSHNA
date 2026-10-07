

import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import quizService from '../services/quiz.service.js';
import { HTTP_STATUS } from '../constants/status.constants.js';


export const getQuizzes = asyncHandler(async (req, res) => {
  const { difficulty, category, dhatuId, page, limit, sort } = req.query;
  const { quizzes, pagination } = await quizService.getAllQuizzes(
    { difficulty, category, dhatuId },
    { page, limit, sort }
  );

  new ApiResponse(
    HTTP_STATUS.OK,
    quizzes,
    'Retrieved educational quizzes successfully',
    { count: quizzes.length, ...pagination },
    pagination
  ).send(res);
});

export const getQuizById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const quiz = await quizService.getQuizById(id);

  new ApiResponse(
    HTTP_STATUS.OK,
    quiz,
    `Retrieved quiz '${quiz.slug}' successfully`
  ).send(res);
});

export default {
  getQuizzes,
  getQuizById
};
