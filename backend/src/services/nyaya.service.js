
import mongoose from 'mongoose';
import { Nyaya } from '../models/index.js';
import ApiError from '../utils/apiError.js';

class NyayaService {

  async getAllNyayas() {
    return await Nyaya.find({})
      .populate('classicalReferences.reference', 'title classicalDetails content.originalSanskrit content.englishTranslation')
      .select('-__v')
      .lean();
  }


  async getNyayaById(idOrSlug) {
    let nyaya;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      nyaya = await Nyaya.findById(idOrSlug)
        .populate('classicalReferences.reference', '-__v')
        .select('-__v')
        .lean();
    }

    if (!nyaya) {
      nyaya = await Nyaya.findOne({
        $or: [
          { slug: idOrSlug.toLowerCase() },
          { name: { $regex: new RegExp(`^${idOrSlug}$`, 'i') } }
        ]
      })
        .populate('classicalReferences.reference', '-__v')
        .select('-__v')
        .lean();
    }

    if (!nyaya) {
      throw ApiError.notFound(`Nyaya '${idOrSlug}' was not found in the Ayurvedic knowledge base`);
    }

    return nyaya;
  }
}

export const nyayaService = new NyayaService();
export default nyayaService;
