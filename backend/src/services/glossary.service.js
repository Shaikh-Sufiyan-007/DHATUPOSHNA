

import mongoose from 'mongoose';
import { GlossaryTerm, Dhatu } from '../models/index.js';
import ApiError from '../utils/apiError.js';
import { parsePagination, buildPaginationMetadata } from '../utils/pagination.js';
import { validateSort } from '../validators/query.validator.js';

const ALLOWED_SORT_FIELDS = ['term', 'name', 'category', 'createdAt'];
const SORT_FIELD_MAPPINGS = { name: 'term' };

class GlossaryService {

  async getAllTerms(filters = {}, options = {}) {
    const query = {};

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
          // No such Dhatu exists, will return empty
          query.relatedDhatu = new mongoose.Types.ObjectId();
        }
      }
    }

    if (filters.search) {
      const sanitized = filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { term: { $regex: sanitized, $options: 'i' } },
        { englishMeaning: { $regex: sanitized, $options: 'i' } },
        { simpleExplanation: { $regex: sanitized, $options: 'i' } },
        { 'sanskritName.iast': { $regex: sanitized, $options: 'i' } }
      ];
    }

    const { page, limit, skip } = parsePagination(options, 20, 100);
    const sort = validateSort(options.sort, ALLOWED_SORT_FIELDS, { term: 1 }, SORT_FIELD_MAPPINGS);

    const [terms, totalItems] = await Promise.all([
      GlossaryTerm.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('relatedDhatu', 'name sanskritName order')
        .select('-__v')
        .lean(),
      GlossaryTerm.countDocuments(query)
    ]);

    const pagination = buildPaginationMetadata(page, limit, totalItems);

    return { terms, pagination };
  }


  async getTermById(idOrTerm) {
    let termDoc;

    if (mongoose.Types.ObjectId.isValid(idOrTerm)) {
      termDoc = await GlossaryTerm.findById(idOrTerm)
        .populate('relatedDhatu')
        .select('-__v')
        .lean();
    }

    if (!termDoc) {
      termDoc = await GlossaryTerm.findOne({
        $or: [
          { slug: idOrTerm.toLowerCase() },
          { term: { $regex: new RegExp(`^${idOrTerm}$`, 'i') } }
        ]
      })
        .populate('relatedDhatu')
        .select('-__v')
        .lean();
    }

    if (!termDoc) {
      throw ApiError.notFound(`Glossary term '${idOrTerm}' was not found in the Sanskrit registry`);
    }

    return termDoc;
  }
}

export const glossaryService = new GlossaryService();
export default glossaryService;
