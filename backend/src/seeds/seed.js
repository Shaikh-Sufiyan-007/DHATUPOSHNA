
import { connectDB, disconnectDB } from '../config/database.js';
import {
  Reference,
  Dhatu,
  Dhatvagni,
  Dhatuposhana,
  Nyaya,
  Concept,
  GlossaryTerm,
  Quiz
} from '../models/index.js';
import logger from '../utils/logger.js';

import referencesSeedData from '../data/references/references.data.js';
import allDhatusData from '../data/dhatus/index.js';
import dhatvagniSeedData from '../data/dhatvagni/dhatvagni.data.js';
import dhatuposhanaSeedData from '../data/dhatuposhana/dhatuposhana.data.js';
import nyayasSeedData from '../data/nyayas/nyayas.data.js';
import conceptsSeedData from '../data/concepts/concepts.data.js';
import glossarySeedData from '../data/glossary/glossary.data.js';
import quizzesSeedData from '../data/quizzes/quizzes.data.js';

const isClearOnly = process.argv.includes('--clear-only');
const isForceClear = process.argv.includes('--clear');

export const runSeed = async () => {
  try {
    await connectDB();
    logger.info('  Starting Phase 5 Ayurvedic Knowledge Base Seeder  ');

    if (isForceClear || isClearOnly) {
      logger.info('Purging existing knowledge collections...');
      await Promise.all([
        Reference.deleteMany({}),
        Dhatu.deleteMany({}),
        Dhatvagni.deleteMany({}),
        Dhatuposhana.deleteMany({}),
        Nyaya.deleteMany({}),
        Concept.deleteMany({}),
        GlossaryTerm.deleteMany({}),
        Quiz.deleteMany({})
      ]);
      logger.info('All knowledge collections cleared.');

      if (isClearOnly) {
        logger.info('Clear-only flag specified. Database reset complete.');
        await disconnectDB();
        process.exit(0);
      }
    }

    // STEP 1: Seed References (Classical & Academic)
    logger.info('\n[1/8] Seeding Authentic References & Citations...');
    const referenceMap = new Map();

    for (const refItem of referencesSeedData) {
      const savedRef = await Reference.findOneAndUpdate(
        { slug: refItem.slug },
        { $set: refItem },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      referenceMap.set(savedRef.slug, savedRef._id);
    }
    logger.info(`  ✓ Upserted ${referencesSeedData.length} References with source provenance.`);

    // STEP 2: Seed Seven Sapta Dhatus
    logger.info('\n[2/8] Seeding Seven Sapta Dhatus...');
    const dhatuMap = new Map();

    for (const dhatuItem of allDhatusData) {
      const classicalRefs = [];
      if (dhatuItem.slug === 'rasa' && referenceMap.has('charaka-sutra-28-4')) {
        classicalRefs.push({
          reference: referenceMap.get('charaka-sutra-28-4'),
          context: 'Origin of Rasa Dhatu from Ahara Rasa',
          specificVerse: 'Charaka Samhita Sutra 28/4',
          excerpt: 'तत्राहारप्रसादाख्यो रसो...'
        });
      }
      if (referenceMap.has('ashtanga-hridaya-sutra-11-4')) {
        classicalRefs.push({
          reference: referenceMap.get('ashtanga-hridaya-sutra-11-4'),
          context: 'Foremost physiological function (Dhatu Karma)',
          specificVerse: 'Ashtanga Hridaya Sutra 11/4-5',
          excerpt: 'प्रीणनं जीवनं लेपः...'
        });
      }

      const modernRefs = [];
      if (referenceMap.has('jaim-2016-dhatu-metabolism')) {
        modernRefs.push({
          reference: referenceMap.get('jaim-2016-dhatu-metabolism'),
          correlationSummary: 'Physiological bridging with microvascular perfusion and nutrient delivery kinetics.'
        });
      }
      if (referenceMap.has('ayu-2014-dhatu-sarata')) {
        modernRefs.push({
          reference: referenceMap.get('ayu-2014-dhatu-sarata'),
          correlationSummary: 'Clinical validation of Dhatu Sarata criteria against physical endurance.'
        });
      }

      const dhatuToSave = {
        ...dhatuItem,
        classicalReferences: classicalRefs,
        modernResearchReferences: modernRefs
      };

      const savedDhatu = await Dhatu.findOneAndUpdate(
        { slug: dhatuItem.slug },
        { $set: dhatuToSave },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      dhatuMap.set(savedDhatu.slug, savedDhatu._id);
      logger.info(`  ✓ [Order ${savedDhatu.order}] ${savedDhatu.name} Dhatu (${savedDhatu.sanskritName.devanagari})`);
    }

    // STEP 3: Seed Seven Dhatvagnis
    logger.info('\n[3/8] Seeding Seven Dhatvagnis (Tissue Bio-transformation Agnis)...');
    for (const agniItem of dhatvagniSeedData) {
      const dhatuId = dhatuMap.get(agniItem.dhatuSlug);
      if (!dhatuId) {
        throw new Error(`Referenced Dhatu ${agniItem.dhatuSlug} not found in map`);
      }

      const classicalRefs = (agniItem.sourceAcademicLayer?.referenceSlugs || [])
        .filter((slug) => referenceMap.has(slug))
        .map((slug) => ({
          reference: referenceMap.get(slug),
          context: 'Dhatvagni Paka and transformation principle'
        }));

      const academicRefs = referenceMap.has('ccras-2018-agni-metabolism')
        ? [{ reference: referenceMap.get('ccras-2018-agni-metabolism'), context: 'Standardized institutional taxonomy for Dhatvagni' }]
        : [];

      const agniToSave = {
        ...agniItem,
        dhatu: dhatuId,
        sourceAcademicLayer: {
          ...agniItem.sourceAcademicLayer,
          classicalReferences: classicalRefs,
          academicReferences: academicRefs
        }
      };

      await Dhatvagni.findOneAndUpdate(
        { slug: agniItem.slug },
        { $set: agniToSave },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      logger.info(`  ✓ ${agniItem.name} (${agniItem.sanskritName.devanagari}) -> Linked to ${agniItem.dhatuSlug} Dhatu`);
    }

    // STEP 4: Seed Dhatuposhana Transformation Pathways
    logger.info('\n[4/8] Seeding Dhatuposhana Transformation Pathways...');
    for (const poshanaItem of dhatuposhanaSeedData) {
      const dhatuId = dhatuMap.get(poshanaItem.dhatuSlug);
      const prevDhatuId = poshanaItem.previousDhatuSlug ? dhatuMap.get(poshanaItem.previousDhatuSlug) : null;
      const nextDhatuId = poshanaItem.nextDhatuSlug ? dhatuMap.get(poshanaItem.nextDhatuSlug) : null;

      const classicalRefs = (poshanaItem.sourceAcademicLayer?.referenceSlugs || [])
        .filter((slug) => referenceMap.has(slug))
        .map((slug) => ({
          reference: referenceMap.get(slug),
          context: 'Sequential tissue transformation principle'
        }));

      const academicRefs = referenceMap.has('jaim-2016-dhatu-metabolism')
        ? [{ reference: referenceMap.get('jaim-2016-dhatu-metabolism'), context: 'Contemporary physiological correlates of Dhatuposhana' }]
        : [];

      const poshanaToSave = {
        ...poshanaItem,
        dhatu: dhatuId,
        previousDhatu: prevDhatuId,
        nextDhatu: nextDhatuId,
        sourceAcademicLayer: {
          ...poshanaItem.sourceAcademicLayer,
          classicalReferences: classicalRefs,
          academicReferences: academicRefs
        }
      };

      await Dhatuposhana.findOneAndUpdate(
        { slug: poshanaItem.slug },
        { $set: poshanaToSave },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      logger.info(`  ✓ ${poshanaItem.name}`);
    }

    // STEP 5: Seed Three Nyayas of Dhatuposhana
    logger.info('\n[5/8] Seeding Three Classical Nyayas of Dhatuposhana...');
    for (const nyayaItem of nyayasSeedData) {
      const classicalRefs = (nyayaItem.referenceSlugs || [])
        .filter((slug) => referenceMap.has(slug))
        .map((slug) => ({
          reference: referenceMap.get(slug),
          context: `${nyayaItem.name} classical exposition`
        }));

      const nyayaToSave = {
        ...nyayaItem,
        classicalReferences: classicalRefs
      };

      await Nyaya.findOneAndUpdate(
        { slug: nyayaItem.slug },
        { $set: nyayaToSave },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      logger.info(`  ✓ ${nyayaItem.name} (${nyayaItem.sanskritName.devanagari})`);
    }

    // STEP 6: Seed Foundational Ayurvedic Concepts
    logger.info('\n[6/8] Seeding Foundational Ayurvedic Concepts...');
    for (const conceptItem of conceptsSeedData) {
      const classicalRefs = (conceptItem.referenceSlugs || [])
        .filter((slug) => referenceMap.has(slug))
        .map((slug) => ({
          reference: referenceMap.get(slug),
          context: `${conceptItem.name} classical definition`
        }));

      const conceptToSave = {
        ...conceptItem,
        classicalReferences: classicalRefs
      };

      await Concept.findOneAndUpdate(
        { slug: conceptItem.slug },
        { $set: conceptToSave },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      logger.info(`  ✓ [${conceptItem.category}] ${conceptItem.name} (${conceptItem.sanskritName.devanagari})`);
    }

    // STEP 7: Seed Authentic Sanskrit Glossary
    logger.info('\n[7/8] Seeding Authentic Sanskrit Glossary...');
    for (const termItem of glossarySeedData) {
      const relatedDhatuId = termItem.relatedDhatuSlug ? dhatuMap.get(termItem.relatedDhatuSlug) : null;

      const termToSave = {
        ...termItem,
        relatedDhatu: relatedDhatuId
      };

      await GlossaryTerm.findOneAndUpdate(
        { slug: termItem.slug },
        { $set: termToSave },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    logger.info(`  ✓ Upserted ${glossarySeedData.length} authentic Sanskrit glossary terms.`);

    // STEP 8: Seed Educational Quizzes
    logger.info('\n[8/8] Seeding Educational Quizzes...');
    for (const quizItem of quizzesSeedData) {
      const relatedDhatuId = quizItem.dhatuSlug ? dhatuMap.get(quizItem.dhatuSlug) : null;
      const refId = quizItem.referenceSlug ? referenceMap.get(quizItem.referenceSlug) : null;

      const quizToSave = {
        ...quizItem,
        relatedDhatu: relatedDhatuId,
        classicalReference: refId
      };

      await Quiz.findOneAndUpdate(
        { slug: quizItem.slug },
        { $set: quizToSave },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    logger.info(`  ✓ Upserted ${quizzesSeedData.length} educational quiz questions.`);

    logger.info('\n====================================================');
    logger.info('  🎉 Phase 5 Database Seeding Completed Successfully! ');
    logger.info('====================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('Seeding process failed with error:', error);
    await disconnectDB();
    process.exit(1);
  }
};

// Auto-run if executed directly
if (process.argv[1]?.includes('seed.js')) {
  runSeed();
}

export default runSeed;
