
import ApiError from './apiError.js';
import { HTTP_STATUS } from '../constants/status.constants.js';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;


export const parsePagination = (query = {}, defaultLimit = DEFAULT_LIMIT, maxLimit = MAX_LIMIT) => {
  let page = DEFAULT_PAGE;
  let limit = defaultLimit;

  if (query.page !== undefined) {
    const parsedPage = Number(query.page);
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Invalid 'page' parameter: '${query.page}'. Must be a positive integer >= 1.`
      );
    }
    page = parsedPage;
  }

  if (query.limit !== undefined) {
    const parsedLimit = Number(query.limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Invalid 'limit' parameter: '${query.limit}'. Must be a positive integer between 1 and ${maxLimit}.`
      );
    }
    if (parsedLimit > maxLimit) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Requested 'limit' of ${parsedLimit} exceeds maximum allowable limit of ${maxLimit}.`
      );
    }
    limit = parsedLimit;
  }

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};


export const buildPaginationMetadata = (page, limit, totalItems) => {
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    currentPage: page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
};

export default {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  parsePagination,
  buildPaginationMetadata
};
