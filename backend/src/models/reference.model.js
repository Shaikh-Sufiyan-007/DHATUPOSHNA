

import mongoose from 'mongoose';
import verificationSchema from './common/verification.schema.js';
import {
  SOURCE_TYPE_LIST,
  CLASSICAL_TEXT_LIST,
  SAMHITA_STHANA_LIST
} from '../constants/source.constants.js';

const referenceSchema = new mongoose.Schema(
  {
    sourceType: {
      type: String,
      required: [true, 'Source type is required'],
      enum: {
        values: SOURCE_TYPE_LIST,
        message: 'Invalid source type: {VALUE}'
      },
      index: true
    },


    title: {
      type: String,
      required: [true, 'Reference title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters']
    },

    // Stable unique identifier for citation referencing and idempotent seeding
    slug: {
      type: String,
      required: [true, 'Reference slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    // Classical Ayurvedic text specific bibliographic details
    classicalDetails: {
      samhita: {
        type: String,
        enum: CLASSICAL_TEXT_LIST,
        default: null
      },
      sthana: {
        type: String,
        enum: SAMHITA_STHANA_LIST,
        default: null
      },
      adhyayaNumber: {
        type: Number,
        min: 1,
        default: null
      },
      adhyayaName: {
        type: String,
        trim: true,
        default: null
      },
      shlokaNumber: {
        type: String,
        trim: true,
        default: null
      },
      commentator: {
        type: String,
        trim: true,
        default: null
      },
      commentaryTitle: {
        type: String,
        trim: true,
        default: null
      }
    },

    // Modern academic, scholarly, or peer-reviewed research details
    academicDetails: {
      authors: [
        {
          type: String,
          trim: true
        }
      ],
      journalName: {
        type: String,
        trim: true,
        default: null
      },
      publicationYear: {
        type: Number,
        min: 1500,
        max: 2100,
        default: null
      },
      volume: {
        type: String,
        trim: true,
        default: null
      },
      issue: {
        type: String,
        trim: true,
        default: null
      },
      pages: {
        type: String,
        trim: true,
        default: null
      },
      doi: {
        type: String,
        trim: true,
        default: null
      },
      isbn: {
        type: String,
        trim: true,
        default: null
      },
      publisher: {
        type: String,
        trim: true,
        default: null
      },
      institution: {
        type: String,
        trim: true,
        default: null
      }
    },


    content: {
      originalSanskrit: {
        type: String,
        trim: true,
        default: null,
        description: 'Original Sanskrit verse in Devanagari script'
      },
      transliteration: {
        type: String,
        trim: true,
        default: null,
        description: 'Standard IAST transliteration'
      },
      englishTranslation: {
        type: String,
        trim: true,
        required: [true, 'English translation or summary is required']
      },
      commentarySummary: {
        type: String,
        trim: true,
        default: null
      }
    },

    // Canonical link to journal paper, archive, or institutional catalog
    url: {
      type: String,
      trim: true,
      default: null,
      match: [
        /^(https?:\/\/[^\s$.?#].[^\s]*)?$/,
        'Please provide a valid HTTP/HTTPS URL'
      ]
    },


    notes: {
      type: String,
      trim: true,
      default: null,
      maxlength: [3000, 'Notes cannot exceed 3000 characters']
    },

    // Content verification lifecycle subdocument
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

// Compound index to quickly find classical citations by Samhita, Sthana, and Chapter
referenceSchema.index({
  'classicalDetails.samhita': 1,
  'classicalDetails.sthana': 1,
  'classicalDetails.adhyayaNumber': 1
});


referenceSchema.index({
  title: 'text',
  'content.englishTranslation': 'text',
  'content.originalSanskrit': 'text',
  notes: 'text'
});

export const Reference = mongoose.model('Reference', referenceSchema);

export default Reference;
