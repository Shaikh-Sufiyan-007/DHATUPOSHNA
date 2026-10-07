
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import searchService from '../services/search.service.js';
import { HTTP_STATUS } from '../constants/status.constants.js';


export const searchKnowledge = asyncHandler(async (req, res) => {
  const { q, type, page, limit } = req.query;

  const { results, pagination } = await searchService.searchKnowledge({
    q,
    type,
    page,
    limit
  });

  new ApiResponse(
    HTTP_STATUS.OK,
    results,
    `Search completed successfully for '${q}'`,
    { count: results.length, query: q, ...pagination },
    pagination
  ).send(res);
});

export default {
  searchKnowledge
};
