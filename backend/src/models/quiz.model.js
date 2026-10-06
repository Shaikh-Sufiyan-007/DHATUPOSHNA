

import mongoose from 'mongoose';
import verificationSchema from './common/verification.schema.js';

export const QUIZ_DIFFICULTIES = Object.freeze(['beginner', 'intermediate', 'advanced']);

const quizSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question prompt is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Quiz question slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    questionType: {
      type: String,
      enum: ['multiple_choice'],
      default: 'multiple_choice'
    },
    options: [
      {
        optionId: {
          type: String,
          required: true,
          trim: true
        },
        text: {
          type: String,
          required: true,
          trim: true
        }
      }
    ],
    correctOptionId: {
      type: String,
      required: [true, 'Correct option identifier is required'],
      trim: true
    },
    explanation: {
      type: String,
      required: [true, 'Educational explanation for correct answer is required'],
      trim: true
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: {
        values: QUIZ_DIFFICULTIES,
        message: 'Invalid difficulty level: {VALUE}'
      },
      index: true
    },
    category: {
      type: String,
      required: [true, 'Quiz category is required'],
      trim: true,
      index: true
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
    classicalReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reference',
      default: null
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

quizSchema.index({
  question: 'text',
  explanation: 'text',
  category: 'text'
});

export const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
