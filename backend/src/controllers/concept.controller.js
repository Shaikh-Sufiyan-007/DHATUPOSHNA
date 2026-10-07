
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import conceptService from '../services/concept.service.js';
import { HTTP_STATUS } from '../constants/status.constants.js';

export const getConcepts = asyncHandler(async (req, res) => {
  const { category, type, search, page, limit, sort } = req.query;
  const { concepts, pagination } = await conceptService.getAllConcepts(
    { category, type, search },
    { page, limit, sort }
  );

  new ApiResponse(
    HTTP_STATUS.OK,
    concepts,
    'Retrieved foundational Ayurvedic concepts successfully',
    { count: concepts.length, ...pagination },
    pagination
  ).send(res);
});


export const getConceptById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const concept = await conceptService.getConceptById(id);

  new ApiResponse(
    HTTP_STATUS.OK,
    concept,
    `Retrieved '${concept.name}' concept successfully`
  ).send(res);
});

export default {
  getConcepts,
  getConceptById
};
