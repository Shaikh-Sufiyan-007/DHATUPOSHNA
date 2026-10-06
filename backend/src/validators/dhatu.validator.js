import mongoose from 'mongoose';
import {
  DHATU_LIST,
  MAHABHUTA_LIST,
  VERIFICATION_STATUS_LIST
} from '../constants/index.js';

export const validateObjectIdParam = (paramName = 'id') => {
  return (req) => {
    const errors = [];
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      errors.push({
        field: paramName,
        value: id,
        message: `Invalid identifier '${id}'. Must be a valid 24-character hexadecimal MongoDB ObjectId.`
      });
    }
    return errors;
  };
};


export const validateCreateDhatu = (req) => {
  const errors = [];
  const body = req.body;

  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return [{ field: 'body', message: 'Request body cannot be empty' }];
  }

  // 1. Name validation
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push({ field: 'name', message: 'Dhatu name is required and must be a non-empty string' });
  } else if (!DHATU_LIST.includes(body.name.trim())) {
    errors.push({
      field: 'name',
      value: body.name,
      message: `Invalid Dhatu name '${body.name}'. Must be one of: ${DHATU_LIST.join(', ')}`
    });
  }

  // 2. Sanskrit name validation
  if (!body.sanskritName || typeof body.sanskritName !== 'object') {
    errors.push({ field: 'sanskritName', message: 'sanskritName object is required' });
  } else {
    if (!body.sanskritName.devanagari || typeof body.sanskritName.devanagari !== 'string' || !body.sanskritName.devanagari.trim()) {
      errors.push({ field: 'sanskritName.devanagari', message: 'Devanagari Sanskrit name is required' });
    }
    if (!body.sanskritName.iast || typeof body.sanskritName.iast !== 'string' || !body.sanskritName.iast.trim()) {
      errors.push({ field: 'sanskritName.iast', message: 'IAST transliterated Sanskrit name is required' });
    }
  }

  // 3. Order validation (1 to 7)
  if (body.order === undefined || body.order === null) {
    errors.push({ field: 'order', message: 'Dhatu sequential order (1 to 7) is required' });
  } else {
    const orderNum = Number(body.order);
    if (!Number.isInteger(orderNum) || orderNum < 1 || orderNum > 7) {
      errors.push({ field: 'order', value: body.order, message: 'order must be an integer between 1 and 7' });
    }
  }

  // 4. General description
  if (!body.generalDescription || typeof body.generalDescription !== 'string' || !body.generalDescription.trim()) {
    errors.push({ field: 'generalDescription', message: 'General description is required' });
  }

  // 5. Dhatvagni name
  if (!body.dhatvagni || typeof body.dhatvagni !== 'object' || !body.dhatvagni.name) {
    errors.push({ field: 'dhatvagni.name', message: 'Dhatvagni object with a valid name is required' });
  }

  // 6. Mahabhuta dominance validation if provided
  if (body.classification?.mahabhutaDominance) {
    if (!Array.isArray(body.classification.mahabhutaDominance)) {
      errors.push({ field: 'classification.mahabhutaDominance', message: 'mahabhutaDominance must be an array' });
    } else {
      for (const bhuta of body.classification.mahabhutaDominance) {
        if (!MAHABHUTA_LIST.includes(bhuta)) {
          errors.push({
            field: 'classification.mahabhutaDominance',
            value: bhuta,
            message: `Invalid Mahabhuta '${bhuta}'. Must be one of: ${MAHABHUTA_LIST.join(', ')}`
          });
        }
      }
    }
  }

  // 7. Verification status if provided
  if (body.verification?.status && !VERIFICATION_STATUS_LIST.includes(body.verification.status)) {
    errors.push({
      field: 'verification.status',
      value: body.verification.status,
      message: `Invalid verification status. Must be one of: ${VERIFICATION_STATUS_LIST.join(', ')}`
    });
  }

  // 8. Classical references ObjectId check if provided
  if (Array.isArray(body.classicalReferences)) {
    body.classicalReferences.forEach((refItem, idx) => {
      if (refItem.reference && !mongoose.Types.ObjectId.isValid(refItem.reference)) {
        errors.push({
          field: `classicalReferences[${idx}].reference`,
          value: refItem.reference,
          message: 'Invalid Reference ObjectId'
        });
      }
    });
  }

  return errors;
};


export const validateUpdateDhatu = (req) => {
  const errors = [];
  const body = req.body;

  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return [{ field: 'body', message: 'Update request body cannot be empty' }];
  }

  // Name check if provided
  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || !DHATU_LIST.includes(body.name.trim())) {
      errors.push({
        field: 'name',
        value: body.name,
        message: `Invalid Dhatu name '${body.name}'. Must be one of: ${DHATU_LIST.join(', ')}`
      });
    }
  }

  // Order check if provided
  if (body.order !== undefined) {
    const orderNum = Number(body.order);
    if (!Number.isInteger(orderNum) || orderNum < 1 || orderNum > 7) {
      errors.push({ field: 'order', value: body.order, message: 'order must be an integer between 1 and 7' });
    }
  }

  // Verification status check if provided
  if (body.verification?.status && !VERIFICATION_STATUS_LIST.includes(body.verification.status)) {
    errors.push({
      field: 'verification.status',
      value: body.verification.status,
      message: `Invalid verification status. Must be one of: ${VERIFICATION_STATUS_LIST.join(', ')}`
    });
  }

  // Mahabhuta check if provided
  if (body.classification?.mahabhutaDominance) {
    if (!Array.isArray(body.classification.mahabhutaDominance)) {
      errors.push({ field: 'classification.mahabhutaDominance', message: 'mahabhutaDominance must be an array' });
    } else {
      for (const bhuta of body.classification.mahabhutaDominance) {
        if (!MAHABHUTA_LIST.includes(bhuta)) {
          errors.push({
            field: 'classification.mahabhutaDominance',
            value: bhuta,
            message: `Invalid Mahabhuta '${bhuta}'. Must be one of: ${MAHABHUTA_LIST.join(', ')}`
          });
        }
      }
    }
  }

  return errors;
};
