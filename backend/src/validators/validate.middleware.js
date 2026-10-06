
import ApiError from '../utils/apiError.js';
import { HTTP_STATUS } from '../constants/status.constants.js';


export const validate = (validatorFn) => {
  return (req, res, next) => {
    try {
      const errors = validatorFn(req);
      if (errors && errors.length > 0) {
        return next(
          new ApiError(
            HTTP_STATUS.UNPROCESSABLE_ENTITY,
            'Request validation failed',
            errors
          )
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default validate;
