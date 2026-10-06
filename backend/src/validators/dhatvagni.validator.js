import mongoose from 'mongoose';
import { VERIFICATION_STATUS_LIST } from '../constants/index.js';


export const validateCreateDhatvagni = (req) => {
  const errors = [];
  const body = req.body;

  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return [{ field: 'body', message: 'Request body cannot be empty' }];
  }

  // Name
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push({ field: 'name', message: 'Dhatvagni name is required' });
  }

  // Sanskrit Name
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

  // Associated Dhatu (must be valid ObjectId)
  if (!body.dhatu || !mongoose.Types.ObjectId.isValid(body.dhatu)) {
    errors.push({
      field: 'dhatu',
      value: body.dhatu,
      message: 'Valid Dhatu ObjectId reference is required'
    });
  }

  // User-Friendly Layer
  if (!body.userFriendlyLayer || typeof body.userFriendlyLayer !== 'object') {
    errors.push({ field: 'userFriendlyLayer', message: 'userFriendlyLayer object is required' });
  } else {
    if (!body.userFriendlyLayer.summary || typeof body.userFriendlyLayer.summary !== 'string' || !body.userFriendlyLayer.summary.trim()) {
      errors.push({ field: 'userFriendlyLayer.summary', message: 'User-friendly summary is required' });
    }
    if (!body.userFriendlyLayer.simplifiedExplanation || typeof body.userFriendlyLayer.simplifiedExplanation !== 'string' || !body.userFriendlyLayer.simplifiedExplanation.trim()) {
      errors.push({ field: 'userFriendlyLayer.simplifiedExplanation', message: 'User-friendly simplified explanation is required' });
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

  // Classical references check
  if (Array.isArray(body.sourceAcademicLayer?.classicalReferences)) {
    body.sourceAcademicLayer.classicalReferences.forEach((refItem, idx) => {
      if (refItem.reference && !mongoose.Types.ObjectId.isValid(refItem.reference)) {
        errors.push({
          field: `sourceAcademicLayer.classicalReferences[${idx}].reference`,
          value: refItem.reference,
          message: 'Invalid Reference ObjectId'
        });
      }
    });
  }

  return errors;
};


export const validateUpdateDhatvagni = (req) => {
  const errors = [];
  const body = req.body;

  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return [{ field: 'body', message: 'Update request body cannot be empty' }];
  }

  if (body.dhatu && !mongoose.Types.ObjectId.isValid(body.dhatu)) {
    errors.push({
      field: 'dhatu',
      value: body.dhatu,
      message: 'Invalid Dhatu ObjectId reference'
    });
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
