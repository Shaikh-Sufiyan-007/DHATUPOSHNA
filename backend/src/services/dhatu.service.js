import mongoose from 'mongoose';
import { Dhatu, Dhatvagni, Dhatuposhana } from '../models/index.js';
import ApiError from '../utils/apiError.js';

class DhatuService {

  async createDhatu(dhatuData) {

    const existingName = await Dhatu.findOne({ name: dhatuData.name });
    if (existingName) {
      throw ApiError.conflict(`Dhatu with name '${dhatuData.name}' already exists.`);
    }


    const existingOrder = await Dhatu.findOne({ order: dhatuData.order });
    if (existingOrder) {
      throw ApiError.conflict(`Dhatu with order '${dhatuData.order}' already assigned to '${existingOrder.name}'.`);
    }

    const dhatu = await Dhatu.create(dhatuData);
    return dhatu;
  }

  async getAllDhatus(filters = {}) {
    const query = {};

    if (filters.name) {
      query.name = { $regex: new RegExp(`^${filters.name.trim()}$`, 'i') };
    }

    if (filters.status) {
      query['verification.status'] = filters.status;
    }

    const dhatus = await Dhatu.find(query)
      .sort({ order: 1 })
      .select('name slug order sanskritName generalDescription functions classification westernCorrelation classicalReferences modernResearchReferences verification')
      .lean();

    return dhatus.map((d) => ({
      _id: d._id,
      id: d._id,
      name: d.name,
      slug: d.slug,
      order: d.order,
      sanskritName: d.sanskritName,
      generalDescription: d.generalDescription,
      functions: d.functions,
      classification: d.classification,
      westernCorrelation: d.westernCorrelation,
      referenceCount: (d.classicalReferences?.length || 0) + (d.modernResearchReferences?.length || 0),
      verification: d.verification
    }));
  }

  async getDhatuById(idOrName) {
    let dhatu;

    if (mongoose.Types.ObjectId.isValid(idOrName)) {
      dhatu = await Dhatu.findById(idOrName)
        .populate('classicalReferences.reference', '-__v')
        .populate('modernResearchReferences.reference', '-__v')
        .select('-__v')
        .lean();
    }

    if (!dhatu) {
      dhatu = await Dhatu.findOne({
        $or: [
          { slug: idOrName.toLowerCase() },
          { name: { $regex: new RegExp(`^${idOrName}$`, 'i') } }
        ]
      })
        .populate('classicalReferences.reference', '-__v')
        .populate('modernResearchReferences.reference', '-__v')
        .select('-__v')
        .lean();
    }

    if (!dhatu) {
      throw ApiError.notFound(`Dhatu '${idOrName}' was not found in the Ayurvedic registry`);
    }

    return dhatu;
  }


  async getDhatuRevision(idOrName) {
    const dhatu = await this.getDhatuById(idOrName);

    return {
      name: dhatu.name,
      order: dhatu.order,
      sanskritName: dhatu.sanskritName,
      primaryFunction: dhatu.functions?.[0] || null,
      mahabhutaDominance: dhatu.classification?.mahabhutaDominance || [],
      doshaAffiliation: dhatu.classification?.doshaAffiliation || null,
      dhatvagni: dhatu.dhatvagni,
      upadhatus: dhatu.upadhatus || [],
      malas: dhatu.malas || [],
      srotas: dhatu.srotas || null,
      keyKshayaSymptoms: dhatu.clinicalRelevance?.kshayaLakshana || [],
      keyVriddhiSymptoms: dhatu.clinicalRelevance?.vriddhiLakshana || [],
      westernCorrelation: dhatu.westernCorrelation
    };
  }


  async getDhatuComparison() {
    const dhatus = await this.getAllDhatus();
    return dhatus.map((d) => ({
      order: d.order,
      name: d.name,
      sanskrit: `${d.sanskritName?.devanagari} (${d.sanskritName?.iast})`,
      mahabhutas: d.classification?.mahabhutaDominance?.join(', ') || '',
      dosha: d.classification?.doshaAffiliation || '',
      primaryKarma: d.functions?.[0]?.classicalTerm || '',
      functionMeaning: d.functions?.[0]?.meaning || '',
      location: d.location?.join(', ') || '',
      dhatvagni: d.dhatvagni?.name || '',
      upadhatus: d.upadhatus?.map((u) => u.name).join(', ') || 'None',
      malas: d.malas?.map((m) => m.name).join(', ') || 'Nirmala',
      srotas: d.srotas?.name || '',
      westernCorrelation: d.westernCorrelation || ''
    }));
  }


  async updateDhatu(id, updateData) {
    const dhatu = await Dhatu.findById(id);
    if (!dhatu) {
      throw ApiError.notFound(`Dhatu with ID '${id}' was not found`);
    }


    if (updateData.name && updateData.name !== dhatu.name) {
      const nameConflict = await Dhatu.findOne({ name: updateData.name, _id: { $ne: id } });
      if (nameConflict) {
        throw ApiError.conflict(`Dhatu name '${updateData.name}' is already used by another record.`);
      }
    }


    if (updateData.order && updateData.order !== dhatu.order) {
      const orderConflict = await Dhatu.findOne({ order: updateData.order, _id: { $ne: id } });
      if (orderConflict) {
        throw ApiError.conflict(`Order position '${updateData.order}' is already assigned to '${orderConflict.name}'.`);
      }
    }

    const updated = await Dhatu.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v');

    return updated;
  }


  async deleteDhatu(id) {
    const dhatu = await Dhatu.findById(id);
    if (!dhatu) {
      throw ApiError.notFound(`Dhatu with ID '${id}' was not found`);
    }

    const dependentDhatus = await Dhatu.find({
      'formation.precursorDhatu': { $regex: new RegExp(dhatu.name, 'i') },
      _id: { $ne: id }
    }).select('name');

    if (dependentDhatus.length > 0) {
      const depNames = dependentDhatus.map((d) => d.name).join(', ');
      throw ApiError.conflict(
        `Cannot delete '${dhatu.name}' Dhatu. It is registered as the physiological precursor for: [${depNames}].`
      );
    }

    const linkedDhatvagni = await Dhatvagni.find({ dhatu: id }).select('name');
    if (linkedDhatvagni.length > 0) {
      const agniNames = linkedDhatvagni.map((a) => a.name).join(', ');
      throw ApiError.conflict(
        `Cannot delete '${dhatu.name}' Dhatu. It is linked to active Dhatvagni records: [${agniNames}]. Remove them first.`
      );
    }

    const linkedPoshana = await Dhatuposhana.find({
      $or: [{ dhatu: id }, { previousDhatu: id }, { nextDhatu: id }]
    }).select('name');
    if (linkedPoshana.length > 0) {
      const poshanaNames = linkedPoshana.map((p) => p.name).join(', ');
      throw ApiError.conflict(
        `Cannot delete '${dhatu.name}' Dhatu. It is referenced in Dhatuposhana processes: [${poshanaNames}].`
      );
    }

    await Dhatu.findByIdAndDelete(id);

    return {
      deleted: true,
      id,
      name: dhatu.name,
      order: dhatu.order
    };
  }
}

export const dhatuService = new DhatuService();
export default dhatuService;
