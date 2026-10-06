

import mongoose from 'mongoose';
import { Quiz, Dhatu } from '../models/index.js';
import ApiError from '../utils/apiError.js';
import { parsePagination, buildPaginationMetadata } from '../utils/pagination.js';
import { validateSort } from '../validators/query.validator.js';

const ALLOWED_SORT_FIELDS = ['difficulty', 'category', 'createdAt'];

class QuizService {

  async getAllQuizzes(filters = {}, options = {}) {
    const query = {};

    if (filters.difficulty) {
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      const normalizedDiff = filters.difficulty.toLowerCase().trim();
      if (!validDifficulties.includes(normalizedDiff)) {
        throw ApiError.badRequest(
          `Invalid difficulty filter '${filters.difficulty}'. Allowed values: [${validDifficulties.join(', ')}]`
        );
      }
      query.difficulty = normalizedDiff;
    }

    if (filters.category) {
      query.category = { $regex: new RegExp(`^${filters.category.trim()}$`, 'i') };
    }

    if (filters.dhatuId) {
      if (mongoose.Types.ObjectId.isValid(filters.dhatuId)) {
        query.relatedDhatu = filters.dhatuId;
      } else {
        const relatedDhatu = await Dhatu.findOne({
          $or: [
            { slug: filters.dhatuId.toLowerCase() },
            { name: { $regex: new RegExp(`^${filters.dhatuId}$`, 'i') } }
          ]
        });
        if (relatedDhatu) {
          query.relatedDhatu = relatedDhatu._id;
        } else {
          query.relatedDhatu = new mongoose.Types.ObjectId();
        }
      }
    }

    const { page, limit, skip } = parsePagination(options, 20, 100);
    const sort = validateSort(options.sort, ALLOWED_SORT_FIELDS, { difficulty: 1, _id: 1 });

    const [quizzes, totalItems] = await Promise.all([
      Quiz.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('relatedDhatu', 'name order')
        .populate('classicalReference', 'title classicalDetails content.originalSanskrit')
        .select('-__v')
        .lean(),
      Quiz.countDocuments(query)
    ]);

    const pagination = buildPaginationMetadata(page, limit, totalItems);

    return { quizzes, pagination };
  }


  async getQuizById(idOrSlug) {
    let quiz;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      quiz = await Quiz.findById(idOrSlug)
        .populate('relatedDhatu', '-__v')
        .populate('classicalReference', '-__v')
        .select('-__v')
        .lean();
    }

    if (!quiz) {
      quiz = await Quiz.findOne({ slug: idOrSlug.toLowerCase() })
        .populate('relatedDhatu', '-__v')
        .populate('classicalReference', '-__v')
        .select('-__v')
        .lean();
    }

    if (!quiz) {
      throw ApiError.notFound(`Quiz with identifier '${idOrSlug}' was not found`);
    }

    return quiz;
  }
}

export const quizService = new QuizService();
export default quizService;
