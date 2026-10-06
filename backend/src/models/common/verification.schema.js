

import mongoose from 'mongoose';
import { VERIFICATION_STATUS, VERIFICATION_STATUS_LIST } from '../../constants/status.constants.js';

export const verificationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: {
        values: VERIFICATION_STATUS_LIST,
        message: 'Invalid verification status: {VALUE}. Must be one of: ' + VERIFICATION_STATUS_LIST.join(', ')
      },
      default: VERIFICATION_STATUS.DRAFT,
      index: true
    },

    reviewedBy: {
      type: String,
      trim: true,
      default: null
    },

    reviewerDesignation: {
      type: String,
      trim: true,
      default: null
    },

    reviewerAffiliation: {
      type: String,
      trim: true,
      default: null
    },

    reviewedAt: {
      type: Date,
      default: null
    },

    verificationNotes: {
      type: String,
      trim: true,
      default: null,
      maxlength: [3000, 'Verification notes cannot exceed 3000 characters']
    },

    recommendedChanges: {
      type: String,
      trim: true,
      default: null,
      maxlength: [2000, 'Recommended changes cannot exceed 2000 characters']
    },

    verificationDecision: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'revision_required'],
      default: 'pending'
    },

    contentVersion: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  {
    _id: false
  }
);

export default verificationSchema;
