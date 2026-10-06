
import mongoose from 'mongoose';
import { Dhatvagni, Dhatu, Reference } from '../models/index.js';
import ApiError from '../utils/apiError.js';

class DhatvagniService {

  async createDhatvagni(dhatvagniData) {

    const dhatuExists = await Dhatu.findById(dhatvagniData.dhatu);
    if (!dhatuExists) {
      throw ApiError.badRequest(
        `Referenced Dhatu with ID '${dhatvagniData.dhatu}' does not exist in the database.`
      );
    }

    const existingDhatvagni = await Dhatvagni.findOne({
      dhatu: dhatvagniData.dhatu,
      name: dhatvagniData.name
    });
    if (existingDhatvagni) {
      throw ApiError.conflict(
        `Dhatvagni '${dhatvagniData.name}' is already registered for ${dhatuExists.name} Dhatu.`
      );
    }

    if (dhatvagniData.sourceAcademicLayer?.classicalReferences) {
      for (const item of dhatvagniData.sourceAcademicLayer.classicalReferences) {
        if (item.reference) {
          const refExists = await Reference.findById(item.reference);
          if (!refExists) {
            throw ApiError.badRequest(`Classical Reference with ID '${item.reference}' does not exist.`);
          }
        }
      }
    }

    const dhatvagni = await Dhatvagni.create(dhatvagniData);
    return await this.getDhatvagniById(dhatvagni._id);
  }


  async getAllDhatvagni(filters = {}) {
    const query = {};

    if (filters.dhatuId) {
      if (mongoose.Types.ObjectId.isValid(filters.dhatuId)) {
        query.dhatu = filters.dhatuId;
      } else {
        const relatedDhatu = await Dhatu.findOne({
          $or: [
            { slug: filters.dhatuId.toLowerCase() },
            { name: { $regex: new RegExp(`^${filters.dhatuId}$`, 'i') } }
          ]
        });
        if (relatedDhatu) {
          query.dhatu = relatedDhatu._id;
        } else {
          query.dhatu = new mongoose.Types.ObjectId();
        }
      }
    }

    if (filters.status) {
      query['verification.status'] = filters.status;
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    return await Dhatvagni.find(query)
      .populate('dhatu', 'name sanskritName order classification')
      .populate('sourceAcademicLayer.classicalReferences.reference', 'title classicalDetails content.originalSanskrit')
      .populate('sourceAcademicLayer.academicReferences.reference', 'title academicDetails')
      .select('-__v')
      .lean();
  }


  async getDhatvagniById(idOrSlugOrDhatu) {
    let dhatvagni;

    if (mongoose.Types.ObjectId.isValid(idOrSlugOrDhatu)) {
      dhatvagni = await Dhatvagni.findById(idOrSlugOrDhatu)
        .populate('dhatu', 'name sanskritName order classification westernCorrelation')
        .populate('sourceAcademicLayer.classicalReferences.reference', '-__v')
        .populate('sourceAcademicLayer.academicReferences.reference', '-__v')
        .select('-__v')
        .lean();

      if (!dhatvagni) {
        dhatvagni = await Dhatvagni.findOne({ dhatu: idOrSlugOrDhatu })
          .populate('dhatu', 'name sanskritName order classification westernCorrelation')
          .populate('sourceAcademicLayer.classicalReferences.reference', '-__v')
          .populate('sourceAcademicLayer.academicReferences.reference', '-__v')
          .select('-__v')
          .lean();
      }
    }

    if (!dhatvagni) {
      dhatvagni = await Dhatvagni.findOne({
        $or: [
          { slug: idOrSlugOrDhatu.toLowerCase() },
          { name: { $regex: new RegExp(`^${idOrSlugOrDhatu}$`, 'i') } }
        ]
      })
        .populate('dhatu', 'name sanskritName order classification westernCorrelation')
        .populate('sourceAcademicLayer.classicalReferences.reference', '-__v')
        .populate('sourceAcademicLayer.academicReferences.reference', '-__v')
        .select('-__v')
        .lean();
    }

    if (!dhatvagni) {
      const relatedDhatu = await Dhatu.findOne({
        $or: [
          { slug: idOrSlugOrDhatu.toLowerCase() },
          { name: { $regex: new RegExp(`^${idOrSlugOrDhatu}$`, 'i') } }
        ]
      });

      if (relatedDhatu) {
        dhatvagni = await Dhatvagni.findOne({ dhatu: relatedDhatu._id })
          .populate('dhatu', 'name sanskritName order classification westernCorrelation')
          .populate('sourceAcademicLayer.classicalReferences.reference', '-__v')
          .populate('sourceAcademicLayer.academicReferences.reference', '-__v')
          .select('-__v')
          .lean();
      }
    }

    if (!dhatvagni) {
      throw ApiError.notFound(`Dhatvagni '${idOrSlugOrDhatu}' was not found`);
    }

    return dhatvagni;
  }


  async updateDhatvagni(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest(`Invalid identifier '${id}'`);
    }

    if (updateData.dhatu) {
      const dhatuExists = await Dhatu.findById(updateData.dhatu);
      if (!dhatuExists) {
        throw ApiError.badRequest(`Referenced Dhatu with ID '${updateData.dhatu}' does not exist.`);
      }
    }

    const updated = await Dhatvagni.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw ApiError.notFound(`Dhatvagni with ID '${id}' was not found`);
    }

    return await this.getDhatvagniById(id);
  }


  async deleteDhatvagni(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest(`Invalid identifier '${id}'`);
    }

    const dhatvagni = await Dhatvagni.findById(id);
    if (!dhatvagni) {
      throw ApiError.notFound(`Dhatvagni with ID '${id}' was not found`);
    }

    await Dhatvagni.findByIdAndDelete(id);

    return {
      deleted: true,
      id,
      name: dhatvagni.name
    };
  }
}

export const dhatvagniService = new DhatvagniService();
export default dhatvagniService;
