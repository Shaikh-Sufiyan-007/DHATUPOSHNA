
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import glossaryService from '../services/glossary.service.js';
import { HTTP_STATUS } from '../constants/status.constants.js';

export const getGlossaryTerms = asyncHandler(async (req, res) => {
  const { category, dhatuId, search, page, limit, sort } = req.query;
  const { terms, pagination } = await glossaryService.getAllTerms(
    { category, dhatuId, search },
    { page, limit, sort }
  );

  new ApiResponse(
    HTTP_STATUS.OK,
    terms,
    'Retrieved Sanskrit glossary terms successfully',
    { count: terms.length, ...pagination },
    pagination
  ).send(res);
});

export const getGlossaryTermById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const term = await glossaryService.getTermById(id);

  new ApiResponse(
    HTTP_STATUS.OK,
    term,
    `Retrieved glossary entry for '${term.term}' successfully`
  ).send(res);
});

export default {
  getGlossaryTerms,
  getGlossaryTermById
};
