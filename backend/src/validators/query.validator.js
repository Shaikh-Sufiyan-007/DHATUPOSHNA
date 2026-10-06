import ApiError from '../utils/apiError.js';
import { HTTP_STATUS } from '../constants/status.constants.js';


export const validateSort = (sortParam, allowedFields = [], defaultSort = { _id: 1 }, fieldMappings = {}) => {
  if (!sortParam) {
    return defaultSort;
  }

  const trimmed = String(sortParam).trim();
  const isDesc = trimmed.startsWith('-');
  const fieldName = isDesc ? trimmed.slice(1) : trimmed;

  if (!allowedFields.includes(fieldName)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Invalid sort field '${fieldName}'. Allowed sort fields are: [${allowedFields.join(', ')}]`
    );
  }

  const targetField = fieldMappings[fieldName] || fieldName;
  return { [targetField]: isDesc ? -1 : 1 };
};


export const validateSearchQuery = (q, minLength = 1) => {
  if (q === undefined || q === null || typeof q !== 'string') {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Search query parameter 'q' is required and must be a string.");
  }

  const sanitized = q.trim();
  if (sanitized.length < minLength) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Search query 'q' must contain at least ${minLength} non-whitespace character(s).`
    );
  }

  return sanitized;
};

export default {
  validateSort,
  validateSearchQuery
};
