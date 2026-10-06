
import { Dhatu, Nyaya, Dhatvagni, Dhatuposhana, Concept } from '../models/index.js';

class RevisionService {

  async getDhatuComparisonTable() {
    const dhatus = await Dhatu.find({})
      .sort({ order: 1 })
      .select('name sanskritName order classification functions location formation dhatvagni upadhatus malas sarata clinicalRelevance srotas westernCorrelation')
      .lean();

    const comparisonMatrix = dhatus.map((d) => ({
      order: d.order,
      name: d.name,
      sanskritName: `${d.sanskritName?.devanagari} (${d.sanskritName?.iast})`,
      mahabhutaDominance: d.classification?.mahabhutaDominance?.join(', ') || 'N/A',
      doshaAffiliation: d.classification?.doshaAffiliation || 'N/A',
      primaryFunction: d.functions?.map((f) => `${f.classicalTerm} (${f.meaning})`).join('; ') || 'N/A',
      primaryLocation: d.location?.join(', ') || 'N/A',
      dhatvagni: d.dhatvagni?.name || 'N/A',
      upadhatus: d.upadhatus?.map((u) => u.name).join(', ') || 'None',
      malas: d.malas?.map((m) => m.name).join(', ') || 'None / Nirmala',
      srotas: d.srotas?.name || 'N/A',
      srotasMoola: d.srotas?.moolasthana?.join(', ') || 'N/A',
      sarataCategory: d.sarata?.[0]?.featureCategory || 'N/A',
      westernCorrelation: d.westernCorrelation || 'N/A'
    }));

    const functionComparison = dhatus.map((d) => ({
      order: d.order,
      dhatu: d.name,
      sanskritTerm: d.functions?.[0]?.classicalTerm || '',
      englishMeaning: d.functions?.[0]?.meaning || '',
      clinicalAction: d.functions?.[0]?.description || ''
    }));

    return {
      title: 'Sapta Dhatu Comprehensive Comparative Matrix',
      description: 'Systematic comparison of the seven fundamental bodily tissues based on classical Samhitas.',
      totalDhatus: dhatus.length,
      matrix: comparisonMatrix,
      functionComparison
    };
  }

  async getNyayaComparisonTable() {
    const nyayas = await Nyaya.find({})
      .select('name sanskritName literalMeaning analogy physiologicalMechanism scopeAndApplicability learnerSummary')
      .lean();

    const matrix = nyayas.map((n) => ({
      name: n.name,
      sanskritName: `${n.sanskritName?.devanagari} (${n.sanskritName?.iast})`,
      literalMeaning: n.literalMeaning,
      classicalAnalogy: n.analogy?.metaphor,
      modernParallel: n.analogy?.modernAnalogy,
      coreMechanism: n.physiologicalMechanism,
      scopeAndApplicability: n.scopeAndApplicability,
      simplifiedKeyTakeaway: n.learnerSummary?.keyTakeaways?.[0] || ''
    }));

    return {
      title: 'Three Nyayas of Dhatuposhana Comparative Matrix',
      description: 'Side-by-side analysis of the classical laws explaining tissue transformation and nutrient kinetics.',
      theoriesCount: nyayas.length,
      matrix
    };
  }

  async getQuickRevisionNotes() {
    const [dhatus, nyayas, agnis] = await Promise.all([
      Dhatu.find({}).sort({ order: 1 }).lean(),
      Nyaya.find({}).lean(),
      Dhatvagni.find({}).populate('dhatu', 'name order').lean()
    ]);

    const dhatuRevisionNotes = dhatus.map((d) => ({
      order: d.order,
      name: d.name,
      sanskritName: `${d.sanskritName?.devanagari} (${d.sanskritName?.iast})`,
      keyTakeaways: [
        `Primary Function: ${d.functions?.[0]?.classicalTerm} (${d.functions?.[0]?.meaning})`,
        `Mahabhuta Composition: ${d.classification?.mahabhutaDominance?.join(' + ')}`,
        `Host Dosha: ${d.classification?.doshaAffiliation}`,
        `Upadhatu: ${d.upadhatus?.map((u) => u.name).join(', ') || 'None'}`,
        `Mala (Waste): ${d.malas?.map((m) => m.name).join(', ') || 'Nirmala (No gross waste)'}`,
        `Chief Srotas: ${d.srotas?.name} (Root: ${d.srotas?.moolasthana?.join(', ')})`,
        `Kshaya (Depletion) Sign: ${d.clinicalRelevance?.kshayaLakshana?.[0]?.symptom || 'N/A'}`,
        `Vriddhi (Hypertrophy) Sign: ${d.clinicalRelevance?.vriddhiLakshana?.[0]?.symptom || 'N/A'}`
      ],
      westernAnalogue: d.westernCorrelation
    }));

    const nyayaQuickNotes = nyayas.map((n) => ({
      nyaya: n.name,
      metaphor: n.analogy?.metaphor,
      summary: n.learnerSummary?.simplifiedExplanation
    }));

    return {
      title: 'Ayurvedic Physiology High-Yield Quick Revision',
      purpose: 'Fast conceptual revision for students, clinicians, and researchers.',
      dhatus: dhatuRevisionNotes,
      nyayas: nyayaQuickNotes,
      totalAgnis: agnis.length
    };
  }
}

export const revisionService = new RevisionService();
export default revisionService;
