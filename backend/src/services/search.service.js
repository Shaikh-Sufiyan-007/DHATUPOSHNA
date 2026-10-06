

import {
  Dhatu,
  Concept,
  Dhatvagni,
  Dhatuposhana,
  Nyaya,
  GlossaryTerm,
  Quiz,
  Reference
} from '../models/index.js';
import ApiError from '../utils/apiError.js';
import { parsePagination, buildPaginationMetadata } from '../utils/pagination.js';
import { validateSearchQuery } from '../validators/query.validator.js';

export const SEARCHABLE_TYPES = [
  'dhatu',
  'concept',
  'dhatvagni',
  'dhatuposhana',
  'nyaya',
  'glossary',
  'quiz',
  'reference'
];

const createSnippet = (text, maxLength = 160) => {
  if (!text) return '';
  const cleaned = String(text).replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength)}...`;
};

class SearchService {

  async searchKnowledge({ q, type, page, limit }) {
    const query = validateSearchQuery(q, 1);
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    const typesToSearch = type
      ? [type.toLowerCase().trim()]
      : SEARCHABLE_TYPES;

    for (const t of typesToSearch) {
      if (!SEARCHABLE_TYPES.includes(t)) {
        throw ApiError.badRequest(
          `Invalid type filter '${t}'. Allowed types: [${SEARCHABLE_TYPES.join(', ')}]`
        );
      }
    }

    const searchPromises = [];

    // 1. Dhatu search
    if (typesToSearch.includes('dhatu')) {
      searchPromises.push(
        Dhatu.find({
          $or: [
            { name: regex },
            { slug: regex },
            { 'sanskritName.iast': regex },
            { 'sanskritName.devanagari': regex },
            { generalDescription: regex },
            { westernCorrelation: regex }
          ]
        })
          .select('name slug sanskritName generalDescription westernCorrelation')
          .lean()
          .then((items) =>
            items.map((item) => {
              let matchedField = 'name';
              let snippet = item.generalDescription;
              if (regex.test(item['sanskritName']?.iast || '')) {
                matchedField = 'sanskritName.iast';
                snippet = `${item.sanskritName?.devanagari} (${item.sanskritName?.iast})`;
              } else if (regex.test(item.westernCorrelation || '')) {
                matchedField = 'westernCorrelation';
                snippet = item.westernCorrelation;
              }
              return {
                type: 'dhatu',
                id: item._id,
                title: item.name,
                slug: item.slug,
                snippet: createSnippet(snippet || item.name),
                matchedField
              };
            })
          )
      );
    }

    // 2. Concept search
    if (typesToSearch.includes('concept')) {
      searchPromises.push(
        Concept.find({
          $or: [
            { name: regex },
            { slug: regex },
            { category: regex },
            { 'sanskritName.iast': regex },
            { 'sanskritName.devanagari': regex },
            { definition: regex },
            { description: regex },
            { relationshipToDhatus: regex }
          ]
        })
          .select('name slug category sanskritName definition description relationshipToDhatus')
          .lean()
          .then((items) =>
            items.map((item) => {
              let matchedField = 'name';
              let snippet = item.definition || item.description;
              if (regex.test(item.category || '')) {
                matchedField = 'category';
              } else if (regex.test(item['sanskritName']?.iast || '')) {
                matchedField = 'sanskritName.iast';
                snippet = `${item.sanskritName?.devanagari} (${item.sanskritName?.iast})`;
              } else if (regex.test(item.relationshipToDhatus || '')) {
                matchedField = 'relationshipToDhatus';
                snippet = item.relationshipToDhatus;
              }
              return {
                type: 'concept',
                id: item._id,
                title: item.name,
                slug: item.slug,
                snippet: createSnippet(snippet || item.definition),
                matchedField
              };
            })
          )
      );
    }

    // 3. Dhatvagni search
    if (typesToSearch.includes('dhatvagni')) {
      searchPromises.push(
        Dhatvagni.find({
          $or: [
            { name: regex },
            { slug: regex },
            { 'sanskritName.iast': regex },
            { 'sanskritName.devanagari': regex },
            { location: regex },
            { 'userFriendlyLayer.summary': regex },
            { 'userFriendlyLayer.simplifiedExplanation': regex }
          ]
        })
          .select('name slug sanskritName userFriendlyLayer')
          .lean()
          .then((items) =>
            items.map((item) => {
              let matchedField = 'name';
              let snippet = item.userFriendlyLayer?.summary || item.userFriendlyLayer?.simplifiedExplanation;
              if (regex.test(item['sanskritName']?.iast || '')) {
                matchedField = 'sanskritName.iast';
              }
              return {
                type: 'dhatvagni',
                id: item._id,
                title: item.name,
                slug: item.slug,
                snippet: createSnippet(snippet || item.name),
                matchedField
              };
            })
          )
      );
    }

    // 4. Dhatuposhana search
    if (typesToSearch.includes('dhatuposhana')) {
      searchPromises.push(
        Dhatuposhana.find({
          $or: [
            { name: regex },
            { slug: regex },
            { theoryCategory: regex },
            { 'sanskritName.iast': regex },
            { 'sanskritName.devanagari': regex },
            { 'userFriendlyLayer.summary': regex },
            { 'userFriendlyLayer.simplifiedExplanation': regex }
          ]
        })
          .select('name slug theoryCategory sanskritName userFriendlyLayer')
          .lean()
          .then((items) =>
            items.map((item) => {
              let matchedField = 'name';
              let snippet = item.userFriendlyLayer?.summary || item.userFriendlyLayer?.simplifiedExplanation;
              if (regex.test(item.theoryCategory || '')) {
                matchedField = 'theoryCategory';
              }
              return {
                type: 'dhatuposhana',
                id: item._id,
                title: item.name,
                slug: item.slug,
                snippet: createSnippet(snippet || item.name),
                matchedField
              };
            })
          )
      );
    }

    // 5. Nyaya search
    if (typesToSearch.includes('nyaya')) {
      searchPromises.push(
        Nyaya.find({
          $or: [
            { name: regex },
            { slug: regex },
            { 'sanskritName.iast': regex },
            { 'sanskritName.devanagari': regex },
            { literalMeaning: regex },
            { 'analogy.metaphor': regex },
            { physiologicalMechanism: regex }
          ]
        })
          .select('name slug sanskritName literalMeaning physiologicalMechanism analogy')
          .lean()
          .then((items) =>
            items.map((item) => {
              let matchedField = 'name';
              let snippet = item.literalMeaning || item.physiologicalMechanism;
              if (regex.test(item.literalMeaning || '')) {
                matchedField = 'literalMeaning';
              } else if (regex.test(item.physiologicalMechanism || '')) {
                matchedField = 'physiologicalMechanism';
              }
              return {
                type: 'nyaya',
                id: item._id,
                title: item.name,
                slug: item.slug,
                snippet: createSnippet(snippet || item.name),
                matchedField
              };
            })
          )
      );
    }

    // 6. Sanskrit Glossary search
    if (typesToSearch.includes('glossary')) {
      searchPromises.push(
        GlossaryTerm.find({
          $or: [
            { term: regex },
            { slug: regex },
            { category: regex },
            { 'sanskritName.iast': regex },
            { 'sanskritName.devanagari': regex },
            { englishMeaning: regex },
            { simpleExplanation: regex }
          ]
        })
          .select('term slug category sanskritName englishMeaning simpleExplanation')
          .lean()
          .then((items) =>
            items.map((item) => {
              let matchedField = 'term';
              let snippet = `${item.englishMeaning}: ${item.simpleExplanation}`;
              if (regex.test(item.englishMeaning || '')) {
                matchedField = 'englishMeaning';
              } else if (regex.test(item.category || '')) {
                matchedField = 'category';
              }
              return {
                type: 'glossary',
                id: item._id,
                title: item.term,
                slug: item.slug,
                snippet: createSnippet(snippet),
                matchedField
              };
            })
          )
      );
    }

    // 7. Quiz search
    if (typesToSearch.includes('quiz')) {
      searchPromises.push(
        Quiz.find({
          $or: [
            { question: regex },
            { slug: regex },
            { category: regex },
            { explanation: regex }
          ]
        })
          .select('question slug category explanation')
          .lean()
          .then((items) =>
            items.map((item) => {
              let matchedField = 'question';
              if (regex.test(item.category || '')) {
                matchedField = 'category';
              } else if (regex.test(item.explanation || '')) {
                matchedField = 'explanation';
              }
              return {
                type: 'quiz',
                id: item._id,
                title: item.question,
                slug: item.slug,
                snippet: createSnippet(item.explanation || item.question),
                matchedField
              };
            })
          )
      );
    }

    // 8. Reference search
    if (typesToSearch.includes('reference')) {
      searchPromises.push(
        Reference.find({
          $or: [
            { title: regex },
            { slug: regex },
            { 'content.englishTranslation': regex },
            { 'content.originalSanskrit': regex },
            { notes: regex },
            { 'classicalDetails.commentator': regex }
          ]
        })
          .select('title slug content classicalDetails')
          .lean()
          .then((items) =>
            items.map((item) => {
              let matchedField = 'title';
              let snippet = item.content?.englishTranslation || item.title;
              if (regex.test(item.content?.englishTranslation || '')) {
                matchedField = 'content.englishTranslation';
              }
              return {
                type: 'reference',
                id: item._id,
                title: item.title,
                slug: item.slug,
                snippet: createSnippet(snippet),
                matchedField
              };
            })
          )
      );
    }

    const nestedResults = await Promise.all(searchPromises);
    const combinedResults = nestedResults.flat();

    // Rank results: exact title match first, then startsWith, then others
    const lowerQuery = query.toLowerCase();
    combinedResults.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      if (aTitle === lowerQuery && bTitle !== lowerQuery) return -1;
      if (bTitle === lowerQuery && aTitle !== lowerQuery) return 1;
      if (aTitle.startsWith(lowerQuery) && !bTitle.startsWith(lowerQuery)) return -1;
      if (bTitle.startsWith(lowerQuery) && !aTitle.startsWith(lowerQuery)) return 1;
      return a.title.localeCompare(b.title);
    });

    const { page: currentPage, limit: currentLimit, skip } = parsePagination({ page, limit }, 20, 50);
    const paginatedResults = combinedResults.slice(skip, skip + currentLimit);
    const pagination = buildPaginationMetadata(currentPage, currentLimit, combinedResults.length);

    return {
      results: paginatedResults,
      pagination
    };
  }
}

export const searchService = new SearchService();
export default searchService;
