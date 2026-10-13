const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateSignup = (req) => {
  const errors = [];
  const body = req.body;

  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return [{ field: 'body', message: 'Request body cannot be empty' }];
  }

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push({ field: 'name', message: 'Name is required and must be a non-empty string' });
  } else if (body.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  } else if (body.name.trim().length > 50) {
    errors.push({ field: 'name', message: 'Name cannot exceed 50 characters' });
  }

  if (!body.email || typeof body.email !== 'string' || !body.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_REGEX.test(body.email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (body.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }

  return errors;
};

export const validateLogin = (req) => {
  const errors = [];
  const body = req.body;

  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return [{ field: 'body', message: 'Request body cannot be empty' }];
  }

  if (!body.email || typeof body.email !== 'string' || !body.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_REGEX.test(body.email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
};

export default {
  validateSignup,
  validateLogin
};
