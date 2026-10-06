import ApiError from '../utils/apiError.js';

export const enforceReadOnly = (req, res, next) => {
  const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (writeMethods.includes(req.method.toUpperCase())) {
    throw ApiError.forbidden(
      'Public access is strictly read-only. Creating, modifying, or deleting authentic Ayurvedic knowledge is disabled.'
    );
  }
  next();
};

export default enforceReadOnly;
