

import mongoose from 'mongoose';
import verificationSchema from './common/verification.schema.js';

const dhatvagniSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Dhatvagni name is required'],
      trim: true,
      index: true
    },
    slug: {
      type: String,
      required: [true, 'Dhatvagni slug is required'],
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
    dhatu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dhatu',
      required: [true, 'Associated Dhatu reference is required'],
      index: true
    },
    location: {
      type: String,
      trim: true
    },
    functions: [
      {
        term: { type: String, required: true, trim: true },
        description: { type: String, trim: true }
      }
    ],
    metabolicFractions: {
      prasadaBhaga: {
        nourishesSelf: { type: String, trim: true },
        seedsNextDhatu: { type: String, trim: true },
        upadhatusFormed: [{ type: String, trim: true }]
      },
      kittaBhaga: {
        wasteProduced: { type: String, trim: true },
        description: { type: String, trim: true }
      }
    },
    sourceAcademicLayer: {
      classicalTerminology: [
        {
          type: String,
          trim: true
        }
      ],
      scholarlyExplanation: {
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
            ref: 'Reference',
            required: true
          },
          context: { type: String, trim: true }
        }
      ]
    },
    userFriendlyLayer: {
      summary: {
        type: String,
        required: [true, 'User-friendly summary is required'],
        trim: true
      },
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
    clinicalRelevance: {
      mandagniEffects: {
        type: String,
        trim: true
      },
      tikshnagniEffects: {
        type: String,
        trim: true
      }
    },
    expertNotes: {
      type: String,
      trim: true,
      maxlength: [3000, 'Expert notes cannot exceed 3000 characters']
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

// Compound text index for search
dhatvagniSchema.index({
  name: 'text',
  'userFriendlyLayer.summary': 'text',
  'userFriendlyLayer.simplifiedExplanation': 'text',
  'sourceAcademicLayer.scholarlyExplanation': 'text'
});

export const Dhatvagni = mongoose.model('Dhatvagni', dhatvagniSchema);
export default Dhatvagni;
