

import mongoose from 'mongoose';
import verificationSchema from './common/verification.schema.js';

const nyayaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nyaya name is required'],
      unique: true,
      trim: true,
      index: true
    },
    slug: {
      type: String,
      required: [true, 'Nyaya slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    sanskritName: {
      devanagari: {
        type: String,
        required: [true, 'Devanagari Sanskrit name is required'],
        trim: true
      },
      iast: {
        type: String,
        required: [true, 'IAST transliterated name is required'],
        trim: true
      }
    },
    literalMeaning: {
      type: String,
      required: [true, 'Literal meaning is required'],
      trim: true
    },
    analogy: {
      metaphor: {
        type: String,
        required: [true, 'Metaphor is required'],
        trim: true
      },
      classicalDescription: {
        type: String,
        required: [true, 'Classical description of the analogy is required'],
        trim: true
      },
      modernAnalogy: {
        type: String,
        trim: true
      }
    },
    physiologicalMechanism: {
      type: String,
      required: [true, 'Physiological mechanism in Dhatuposhana is required'],
      trim: true
    },
    scopeAndApplicability: {
      type: String,
      required: [true, 'Scope and applicability explanation is required'],
      trim: true
    },
    scholarlyCommentary: [
      {
        commentator: { type: String, required: true, trim: true },
        work: { type: String, required: true, trim: true },
        interpretation: { type: String, required: true, trim: true }
      }
    ],
    classicalReferences: [
      {
        reference: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Reference',
          required: true
        },
        context: { type: String, trim: true },
        specificVerse: { type: String, trim: true },
        excerpt: { type: String, trim: true }
      }
    ],
    learnerSummary: {
      simplifiedExplanation: {
        type: String,
        required: [true, 'Simplified explanation is required'],
        trim: true
      },
      keyTakeaways: [
        {
          type: String,
          trim: true
        }
      ]
    },
    verification: {
      type: verificationSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

nyayaSchema.index({
  name: 'text',
  literalMeaning: 'text',
  physiologicalMechanism: 'text',
  'learnerSummary.simplifiedExplanation': 'text'
});

export const Nyaya = mongoose.model('Nyaya', nyayaSchema);
export default Nyaya;
