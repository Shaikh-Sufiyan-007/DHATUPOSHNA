
import mongoose from 'mongoose';
import { Concept } from '../models/index.js';
import ApiError from '../utils/apiError.js';
import { parsePagination, buildPaginationMetadata } from '../utils/pagination.js';
import { validateSort } from '../validators/query.validator.js';

const ALLOWED_SORT_FIELDS = ['name', 'category', 'createdAt'];

class ConceptService {

  async getAllConcepts(filters = {}, options = {}) {
    const query = {};

    const categoryFilter = filters.type || filters.category;
    if (categoryFilter) {
      query.category = { $regex: new RegExp(`^${categoryFilter.trim()}$`, 'i') };
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { name: searchRegex },
        { definition: searchRegex },
        { 'sanskritName.iast': searchRegex }
      ];
    }

    const { page, limit, skip } = parsePagination(options, 20, 100);
    const sort = validateSort(options.sort, ALLOWED_SORT_FIELDS, { category: 1, name: 1 });

    const [concepts, totalItems] = await Promise.all([
      Concept.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('classicalReferences.reference', 'title classicalDetails content.originalSanskrit content.englishTranslation')
        .select('-__v')
        .lean(),
      Concept.countDocuments(query)
    ]);

    const pagination = buildPaginationMetadata(page, limit, totalItems);

    return { concepts, pagination };
  }


  async getConceptById(idOrSlug) {
    let concept;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      concept = await Concept.findById(idOrSlug)
        .populate('classicalReferences.reference', '-__v')
        .populate('academicReferences.reference', '-__v')
        .select('-__v')
        .lean();
    }

    if (!concept) {
      concept = await Concept.findOne({
        $or: [
          { slug: idOrSlug.toLowerCase() },
          { name: { $regex: new RegExp(`^${idOrSlug}$`, 'i') } }
        ]
      })
        .populate('classicalReferences.reference', '-__v')
        .populate('academicReferences.reference', '-__v')
        .select('-__v')
        .lean();
    }

    if (!concept) {
      throw ApiError.notFound(`Ayurvedic Concept '${idOrSlug}' was not found in the knowledge base`);
    }

    return concept;
  }
}

export const conceptService = new ConceptService();
export default conceptService;
