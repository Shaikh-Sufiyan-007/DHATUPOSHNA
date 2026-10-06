

import mongoose from 'mongoose';
import verificationSchema from './common/verification.schema.js';

export const CONCEPT_CATEGORIES = Object.freeze([
  'Tridosha',
  'Agni',
  'Mala',
  'Ama',
  'Ojas',
  'Srotas',
  'Prakriti',
  'Foundational Concept'
]);

const conceptSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Concept name is required'],
      unique: true,
      trim: true,
      index: true
    },
    slug: {
      type: String,
      required: [true, 'Concept slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'Concept category is required'],
      enum: {
        values: CONCEPT_CATEGORIES,
        message: 'Invalid concept category: {VALUE}'
      },
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
      },
      etymology: {
        type: String,
        trim: true
      }
    },
    definition: {
      type: String,
      required: [true, 'Definition is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    characteristics: [
      {
        type: String,
        trim: true
      }
    ],
    functions: [
      {
        term: { type: String, required: true, trim: true },
        meaning: { type: String, required: true, trim: true },
        description: { type: String, trim: true }
      }
    ],
    relationshipToDhatus: {
      type: String,
      required: [true, 'Relationship to Dhatus is required'],
      trim: true
    },
    modernPhysiologicalPerspective: {
      type: String,
      trim: true
    },
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
    academicReferences: [
      {
        reference: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Reference'
        },
        context: { type: String, trim: true }
      }
    ],
    learnerSummary: {
      simplifiedExplanation: {
        type: String,
        required: [true, 'Simplified explanation is required'],
        trim: true
      },
      keyPoints: [
        {
          type: String,
          trim: true
        }
      ]
    },
    educationalSafetyNotice: {
      type: String,
      trim: true,
      default: 'This information is for classical educational and conceptual study only, and does not constitute personalized medical advice or individual clinical diagnosis.'
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

conceptSchema.index({
  name: 'text',
  definition: 'text',
  description: 'text',
  relationshipToDhatus: 'text',
  'learnerSummary.simplifiedExplanation': 'text'
});

export const Concept = mongoose.model('Concept', conceptSchema);
export default Concept;
