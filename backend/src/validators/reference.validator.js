
import {
  SOURCE_TYPE_LIST,
  CLASSICAL_TEXT_LIST,
  SAMHITA_STHANA_LIST,
  VERIFICATION_STATUS_LIST
} from '../constants/index.js';

export const validateCreateReference = (req) => {
  const errors = [];
  const body = req.body;

  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return [{ field: 'body', message: 'Request body cannot be empty' }];
  }

  // 1. Source Type validation
  if (!body.sourceType || typeof body.sourceType !== 'string' || !body.sourceType.trim()) {
    errors.push({ field: 'sourceType', message: 'sourceType is required' });
  } else if (!SOURCE_TYPE_LIST.includes(body.sourceType.trim())) {
    errors.push({
      field: 'sourceType',
      value: body.sourceType,
      message: `Invalid sourceType. Must be one of: ${SOURCE_TYPE_LIST.join(', ')}`
    });
  }

  // 2. Title validation
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    errors.push({ field: 'title', message: 'Reference title is required and cannot be empty' });
  } else if (body.title.length > 300) {
    errors.push({ field: 'title', message: 'Reference title cannot exceed 300 characters' });
  }

  // 3. Content translation validation
  if (!body.content || typeof body.content !== 'object') {
    errors.push({ field: 'content', message: 'content object is required' });
  } else if (!body.content.englishTranslation || typeof body.content.englishTranslation !== 'string' || !body.content.englishTranslation.trim()) {
    errors.push({ field: 'content.englishTranslation', message: 'English translation or summary is required' });
  }

  // 4. Source-type specific validations
  if (body.sourceType === 'classical_text' || body.sourceType === 'commentary') {
    if (body.classicalDetails?.samhita && !CLASSICAL_TEXT_LIST.includes(body.classicalDetails.samhita)) {
      errors.push({
        field: 'classicalDetails.samhita',
        value: body.classicalDetails.samhita,
        message: `Invalid classical Samhita name. Must be one of: ${CLASSICAL_TEXT_LIST.join(', ')}`
      });
    }
    if (body.classicalDetails?.sthana && !SAMHITA_STHANA_LIST.includes(body.classicalDetails.sthana)) {
      errors.push({
        field: 'classicalDetails.sthana',
        value: body.classicalDetails.sthana,
        message: `Invalid Samhita Sthana. Must be one of: ${SAMHITA_STHANA_LIST.join(', ')}`
      });
    }
  }

  // 5. Academic details validation if provided
  if (body.academicDetails?.publicationYear !== undefined && body.academicDetails?.publicationYear !== null) {
    const year = Number(body.academicDetails.publicationYear);
    const currentYear = new Date().getFullYear() + 1;
    if (!Number.isInteger(year) || year < 1500 || year > currentYear) {
      errors.push({
        field: 'academicDetails.publicationYear',
        value: body.academicDetails.publicationYear,
        message: `Publication year must be an integer between 1500 and ${currentYear}`
      });
    }
  }

  // 6. URL validation if provided
  if (body.url) {
    try {
      const parsed = new URL(body.url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        errors.push({ field: 'url', value: body.url, message: 'URL must use http or https protocol' });
      }
    } catch {
      errors.push({ field: 'url', value: body.url, message: 'Invalid URL format' });
    }
  }

  // 7. Verification status validation if provided
  if (body.verification?.status && !VERIFICATION_STATUS_LIST.includes(body.verification.status)) {
    errors.push({
      field: 'verification.status',
      value: body.verification.status,
      message: `Invalid verification status. Must be one of: ${VERIFICATION_STATUS_LIST.join(', ')}`
    });
  }

  return errors;
};


export const validateUpdateReference = (req) => {
  const errors = [];
  const body = req.body;

  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return [{ field: 'body', message: 'Update request body cannot be empty' }];
  }

  if (body.sourceType !== undefined && !SOURCE_TYPE_LIST.includes(body.sourceType.trim())) {
    errors.push({
      field: 'sourceType',
      value: body.sourceType,
      message: `Invalid sourceType. Must be one of: ${SOURCE_TYPE_LIST.join(', ')}`
    });
  }

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      errors.push({ field: 'title', message: 'Title cannot be empty string' });
    } else if (body.title.length > 300) {
      errors.push({ field: 'title', message: 'Title cannot exceed 300 characters' });
    }
  }

  if (body.url) {
    try {
      const parsed = new URL(body.url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        errors.push({ field: 'url', value: body.url, message: 'URL must use http or https protocol' });
      }
    } catch {
      errors.push({ field: 'url', value: body.url, message: 'Invalid URL format' });
    }
  }

  if (body.verification?.status && !VERIFICATION_STATUS_LIST.includes(body.verification.status)) {
    errors.push({
      field: 'verification.status',
      value: body.verification.status,
      message: `Invalid verification status. Must be one of: ${VERIFICATION_STATUS_LIST.join(', ')}`
    });
  }

  return errors;
};
