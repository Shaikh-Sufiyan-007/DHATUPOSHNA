
import mongoose from 'mongoose';
import { Dhatuposhana, Dhatu, Reference } from '../models/index.js';
import ApiError from '../utils/apiError.js';

class DhatuposhanaService {

  async createDhatuposhana(dhatuposhanaData) {

    if (dhatuposhanaData.dhatu) {
      const dhatuExists = await Dhatu.findById(dhatuposhanaData.dhatu);
      if (!dhatuExists) {
        throw ApiError.badRequest(`Referenced Dhatu with ID '${dhatuposhanaData.dhatu}' does not exist.`);
      }
    }

    if (dhatuposhanaData.previousDhatu) {
      const prevDhatuExists = await Dhatu.findById(dhatuposhanaData.previousDhatu);
      if (!prevDhatuExists) {
        throw ApiError.badRequest(`Referenced previousDhatu with ID '${dhatuposhanaData.previousDhatu}' does not exist.`);
      }
    }

    if (dhatuposhanaData.nextDhatu) {
      const nextDhatuExists = await Dhatu.findById(dhatuposhanaData.nextDhatu);
      if (!nextDhatuExists) {
        throw ApiError.badRequest(`Referenced nextDhatu with ID '${dhatuposhanaData.nextDhatu}' does not exist.`);
      }
    }

    if (dhatuposhanaData.sourceAcademicLayer?.classicalReferences) {
      for (const item of dhatuposhanaData.sourceAcademicLayer.classicalReferences) {
        if (item.reference) {
          const refExists = await Reference.findById(item.reference);
          if (!refExists) {
            throw ApiError.badRequest(`Classical Reference with ID '${item.reference}' does not exist.`);
          }
        }
      }
    }

    const created = await Dhatuposhana.create(dhatuposhanaData);
    return await this.getDhatuposhanaById(created._id);
  }


  async getAllDhatuposhana(filters = {}) {
    const query = {};

    if (filters.dhatuId) {
      let targetId = null;
      if (mongoose.Types.ObjectId.isValid(filters.dhatuId)) {
        targetId = filters.dhatuId;
      } else {
        const relatedDhatu = await Dhatu.findOne({
          $or: [
            { slug: filters.dhatuId.toLowerCase() },
            { name: { $regex: new RegExp(`^${filters.dhatuId}$`, 'i') } }
          ]
        });
        if (relatedDhatu) {
          targetId = relatedDhatu._id;
        } else {
          targetId = new mongoose.Types.ObjectId();
        }
      }
      query.$or = [
        { dhatu: targetId },
        { previousDhatu: targetId },
        { nextDhatu: targetId }
      ];
    }

    if (filters.theoryCategory) {
      query.theoryCategory = filters.theoryCategory;
    }

    if (filters.status) {
      query['verification.status'] = filters.status;
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    return await Dhatuposhana.find(query)
      .populate('dhatu', 'name sanskritName order')
      .populate('previousDhatu', 'name sanskritName order')
      .populate('nextDhatu', 'name sanskritName order')
      .populate('sourceAcademicLayer.classicalReferences.reference', 'title classicalDetails content.originalSanskrit')
      .populate('scholarlyInterpretations.reference', 'title classicalDetails')
      .select('-__v')
      .lean();
  }


  async getDhatuposhanaById(idOrSlugOrDhatu) {
    let item;

    // 1. Try finding by ObjectId of Dhatuposhana or Dhatu
    if (mongoose.Types.ObjectId.isValid(idOrSlugOrDhatu)) {
      item = await Dhatuposhana.findById(idOrSlugOrDhatu)
        .populate('dhatu', 'name sanskritName order classification westernCorrelation -__v')
        .populate('previousDhatu', 'name sanskritName order -__v')
        .populate('nextDhatu', 'name sanskritName order -__v')
        .populate('sourceAcademicLayer.classicalReferences.reference', '-__v')
        .populate('scholarlyInterpretations.reference', '-__v')
        .select('-__v')
        .lean();

      if (!item) {
        item = await Dhatuposhana.findOne({ dhatu: idOrSlugOrDhatu })
          .populate('dhatu', 'name sanskritName order classification westernCorrelation -__v')
          .populate('previousDhatu', 'name sanskritName order -__v')
          .populate('nextDhatu', 'name sanskritName order -__v')
          .populate('sourceAcademicLayer.classicalReferences.reference', '-__v')
          .populate('scholarlyInterpretations.reference', '-__v')
          .select('-__v')
          .lean();
      }
    }

    // 2. Try finding by Dhatuposhana slug or name
    if (!item) {
      item = await Dhatuposhana.findOne({
        $or: [
          { slug: idOrSlugOrDhatu.toLowerCase() },
          { name: { $regex: new RegExp(`^${idOrSlugOrDhatu}$`, 'i') } }
        ]
      })
        .populate('dhatu', 'name sanskritName order classification westernCorrelation -__v')
        .populate('previousDhatu', 'name sanskritName order -__v')
        .populate('nextDhatu', 'name sanskritName order -__v')
        .populate('sourceAcademicLayer.classicalReferences.reference', '-__v')
        .populate('scholarlyInterpretations.reference', '-__v')
        .select('-__v')
        .lean();
    }

    // 3. Try finding by related Dhatu slug or name
    if (!item) {
      const relatedDhatu = await Dhatu.findOne({
        $or: [
          { slug: idOrSlugOrDhatu.toLowerCase() },
          { name: { $regex: new RegExp(`^${idOrSlugOrDhatu}$`, 'i') } }
        ]
      });

      if (relatedDhatu) {
        item = await Dhatuposhana.findOne({ dhatu: relatedDhatu._id })
          .populate('dhatu', 'name sanskritName order classification westernCorrelation -__v')
          .populate('previousDhatu', 'name sanskritName order -__v')
          .populate('nextDhatu', 'name sanskritName order -__v')
          .populate('sourceAcademicLayer.classicalReferences.reference', '-__v')
          .populate('scholarlyInterpretations.reference', '-__v')
          .select('-__v')
          .lean();
      }
    }

    if (!item) {
      throw ApiError.notFound(`Dhatuposhana concept '${idOrSlugOrDhatu}' was not found`);
    }

    return item;
  }


  async updateDhatuposhana(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest(`Invalid identifier '${id}'`);
    }

    // Validate updated Dhatu relations if supplied
    if (updateData.dhatu) {
      const dhatuExists = await Dhatu.findById(updateData.dhatu);
      if (!dhatuExists) {
        throw ApiError.badRequest(`Referenced Dhatu with ID '${updateData.dhatu}' does not exist.`);
      }
    }
    if (updateData.previousDhatu) {
      const prevExists = await Dhatu.findById(updateData.previousDhatu);
      if (!prevExists) {
        throw ApiError.badRequest(`Referenced previousDhatu with ID '${updateData.previousDhatu}' does not exist.`);
      }
    }
    if (updateData.nextDhatu) {
      const nextExists = await Dhatu.findById(updateData.nextDhatu);
      if (!nextExists) {
        throw ApiError.badRequest(`Referenced nextDhatu with ID '${updateData.nextDhatu}' does not exist.`);
      }
    }

    const updated = await Dhatuposhana.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw ApiError.notFound(`Dhatuposhana concept with ID '${id}' was not found`);
    }

    return await this.getDhatuposhanaById(id);
  }


  async deleteDhatuposhana(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest(`Invalid identifier '${id}'`);
    }

    const item = await Dhatuposhana.findById(id);
    if (!item) {
      throw ApiError.notFound(`Dhatuposhana concept with ID '${id}' was not found`);
    }

    await Dhatuposhana.findByIdAndDelete(id);

    return {
      deleted: true,
      id,
      name: item.name
    };
  }
}

export const dhatuposhanaService = new DhatuposhanaService();
export default dhatuposhanaService;
