import mongoose from 'mongoose';
import verificationSchema from './common/verification.schema.js';
import { DHATUPOSHANA_NYAYA_LIST } from '../constants/dhatu.constants.js';

const dhatuposhanaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Dhatuposhana concept name is required'],
      trim: true,
      index: true
    },
    slug: {
      type: String,
      required: [true, 'Dhatuposhana slug is required'],
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
    theoryCategory: {
      type: String,
      enum: [...DHATUPOSHANA_NYAYA_LIST, 'Sequential Transformation Process', 'General Nourishment Law'],
      default: 'Sequential Transformation Process',
      index: true
    },
    dhatu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dhatu',
      default: null,
      index: true
    },
    previousDhatu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dhatu',
      default: null,
      index: true
    },
    nextDhatu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dhatu',
      default: null,
      index: true
    },
    precursorSubstance: {
      type: String,
      trim: true
    },
    classicalAnalogy: {
      metaphor: { type: String, trim: true },
      explanation: { type: String, trim: true }
    },
    scholarlyInterpretations: [
      {
        authorOrSchool: {
          type: String,
          required: true,
          trim: true
        },
        interpretation: {
          type: String,
          required: true,
          trim: true
        },
        timeframeOrDuration: {
          type: String,
          trim: true
        },
        reference: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Reference',
          default: null
        }
      }
    ],
    modernPhysiologicalParallel: {
      type: String,
      trim: true
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

// Full-text search index
dhatuposhanaSchema.index({
  name: 'text',
  'userFriendlyLayer.summary': 'text',
  'userFriendlyLayer.simplifiedExplanation': 'text',
  'sourceAcademicLayer.scholarlyExplanation': 'text'
});

export const Dhatuposhana = mongoose.model('Dhatuposhana', dhatuposhanaSchema);
export const DhatuposhanaTheory = Dhatuposhana;

export default Dhatuposhana;
