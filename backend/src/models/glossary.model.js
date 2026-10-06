
import mongoose from 'mongoose';
import verificationSchema from './common/verification.schema.js';

const glossarySchema = new mongoose.Schema(
  {
    term: {
      type: String,
      required: [true, 'Sanskrit term is required'],
      unique: true,
      trim: true,
      index: true
    },
    slug: {
      type: String,
      required: [true, 'Glossary slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    sanskritName: {
      devanagari: {
        type: String,
        required: [true, 'Devanagari script is required'],
        trim: true
      },
      iast: {
        type: String,
        required: [true, 'IAST transliteration is required'],
        trim: true
      }
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true
    },
    englishMeaning: {
      type: String,
      required: [true, 'English meaning / literal translation is required'],
      trim: true
    },
    simpleExplanation: {
      type: String,
      required: [true, 'Simple educational explanation is required'],
      trim: true
    },
    detailedDefinition: {
      type: String,
      trim: true
    },
    relatedDhatu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dhatu',
      default: null,
      index: true
    },
    relatedConcept: {
      type: String,
      trim: true
    },
    classicalReferences: [
      {
        reference: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Reference'
        },
        context: { type: String, trim: true },
        specificVerse: { type: String, trim: true }
      }
    ],
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

glossarySchema.index({
  term: 'text',
  'sanskritName.iast': 'text',
  englishMeaning: 'text',
  simpleExplanation: 'text'
});

export const GlossaryTerm = mongoose.model('GlossaryTerm', glossarySchema);
export default GlossaryTerm;
