
import mongoose from 'mongoose';
import { Reference, Dhatu, Dhatvagni, Dhatuposhana } from '../models/index.js';
import ApiError from '../utils/apiError.js';
import { parsePagination, buildPaginationMetadata } from '../utils/pagination.js';
import { validateSort } from '../validators/query.validator.js';

const ALLOWED_SORT_FIELDS = ['year', 'title', 'sourceType', 'createdAt'];
const SORT_FIELD_MAPPINGS = { year: 'academicDetails.publicationYear' };

class ReferenceService {

  async createReference(referenceData) {
    const reference = await Reference.create(referenceData);
    return reference;
  }

  async getReferences(filters = {}, options = {}) {
    const query = {};

    const typeFilter = filters.type || filters.sourceType;
    if (typeFilter) {
      const lower = String(typeFilter).toLowerCase().trim();
      if (lower === 'classical') {
        query.sourceType = { $in: ['classical_text', 'commentary', 'translation'] };
      } else if (lower === 'research') {
        query.sourceType = {
          $in: [
            'research_paper',
            'academic_source',
            'academic_book',
            'university_source',
            'institutional_publication',
            'expert_review'
          ]
        };
      } else {
        query.sourceType = lower;
      }
    }

    if (filters.samhita) {
      query['classicalDetails.samhita'] = filters.samhita;
    }

    if (filters.status) {
      query['verification.status'] = filters.status;
    }

    if (filters.search) {
      const sanitized = filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: sanitized, $options: 'i' } },
        { 'content.englishTranslation': { $regex: sanitized, $options: 'i' } },
        { 'content.originalSanskrit': { $regex: sanitized, $options: 'i' } }
      ];
    }

    const { page, limit, skip } = parsePagination(options, 20, 100);
    const sort = validateSort(options.sort, ALLOWED_SORT_FIELDS, { createdAt: -1 }, SORT_FIELD_MAPPINGS);

    const [references, totalItems] = await Promise.all([
      Reference.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),
      Reference.countDocuments(query)
    ]);

    const pagination = buildPaginationMetadata(page, limit, totalItems);

    return {
      references,
      pagination,
      meta: {
        page,
        limit,
        total: totalItems,
        totalPages: pagination.totalPages,
        ...pagination
      }
    };
  }

  async getReferenceById(idOrSlug) {
    let reference;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      reference = await Reference.findById(idOrSlug).select('-__v').lean();
    }

    if (!reference) {
      reference = await Reference.findOne({ slug: idOrSlug.toLowerCase() }).select('-__v').lean();
    }

    if (!reference) {
      throw ApiError.notFound(`Reference citation with ID '${idOrSlug}' was not found`);
    }
    return reference;
  }


  async updateReference(id, updateData) {
    const updated = await Reference.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!updated) {
      throw ApiError.notFound(`Reference citation with ID '${id}' was not found`);
    }

    return updated;
  }


  async deleteReference(id) {
    const reference = await Reference.findById(id);
    if (!reference) {
      throw ApiError.notFound(`Reference citation with ID '${id}' was not found`);
    }

    const citingDhatus = await Dhatu.find({
      $or: [
        { 'classicalReferences.reference': id },
        { 'modernResearchReferences.reference': id }
      ]
    }).select('name');

    const citingDhatvagni = await Dhatvagni.find({
      $or: [
        { 'sourceAcademicLayer.classicalReferences.reference': id },
        { 'sourceAcademicLayer.academicReferences.reference': id }
      ]
    }).select('name');

    const citingDhatuposhana = await Dhatuposhana.find({
      $or: [
        { 'sourceAcademicLayer.classicalReferences.reference': id },
        { 'sourceAcademicLayer.academicReferences.reference': id },
        { 'scholarlyInterpretations.reference': id }
      ]
    }).select('name');

    if (citingDhatus.length > 0 || citingDhatvagni.length > 0 || citingDhatuposhana.length > 0) {
      const dependencies = [];
      if (citingDhatus.length > 0) {
        dependencies.push(`Dhatus: [${citingDhatus.map((d) => d.name).join(', ')}]`);
      }
      if (citingDhatvagni.length > 0) {
        dependencies.push(`Dhatvagni: [${citingDhatvagni.map((a) => a.name).join(', ')}]`);
      }
      if (citingDhatuposhana.length > 0) {
        dependencies.push(`Dhatuposhana: [${citingDhatuposhana.map((p) => p.name).join(', ')}]`);
      }

      throw ApiError.conflict(
        `Cannot delete Reference '${reference.title}'. It is currently cited by: ${dependencies.join('; ')}. Remove citations before deleting.`
      );
    }

    await Reference.findByIdAndDelete(id);

    return {
      deleted: true,
      id,
      title: reference.title
    };
  }
}

export const referenceService = new ReferenceService();
export default referenceService;
