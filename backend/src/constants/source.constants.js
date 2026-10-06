
export const SOURCE_TYPES = Object.freeze({
  CLASSICAL_TEXT: 'classical_text',                     // Primary Samhitas (Charaka, Sushruta, Vagbhata)
  COMMENTARY: 'commentary',                             // Classical commentaries (Chakrapani, Dalhana, Arunadatta)
  TRANSLATION: 'translation',                           // Authorized scholarly translations
  RESEARCH_PAPER: 'research_paper',                     // Modern indexed peer-reviewed journal papers
  ACADEMIC_SOURCE: 'academic_source',                   // Academic textbooks, university monographs
  ACADEMIC_BOOK: 'academic_book',                       // Synonym for academic textbooks
  UNIVERSITY_SOURCE: 'university_source',               // University dissertations, institutional curriculum publications
  INSTITUTIONAL_PUBLICATION: 'institutional_publication', // CCRAS, WHO, Ministry of AYUSH publications
  EXPERT_REVIEW: 'expert_review'                        // Formal peer review by faculty/Ayurveda subject matter expert
});

export const SOURCE_TYPE_LIST = Object.freeze(Object.values(SOURCE_TYPES));

/**
 * The Brihat Trayi (Great Trio) and Laghu Trayi (Lesser Trio) canonical Ayurvedic treatises.
 */
export const CLASSICAL_TEXTS = Object.freeze({
  CHARAKA_SAMHITA: 'Charaka Samhita',
  SUSHRUTA_SAMHITA: 'Sushruta Samhita',
  ASHTANGA_HRIDAYA: 'Ashtanga Hridaya',
  ASHTANGA_SAMGRAHA: 'Ashtanga Samgraha',
  SHARANGADHARA_SAMHITA: 'Sharangadhara Samhita',
  BHAVA_PRAKASHA: 'Bhava Prakasha',
  MADHAVA_NIDANA: 'Madhava Nidana'
});

export const CLASSICAL_TEXT_LIST = Object.freeze(Object.values(CLASSICAL_TEXTS));

/**
 * Classical sections (Sthanas) standard in Samhita literature.
 */
export const SAMHITA_STHANAS = Object.freeze({
  SUTRA_STHANA: 'Sutra Sthana',
  NIDANA_STHANA: 'Nidana Sthana',
  VIMANA_STHANA: 'Vimana Sthana',
  SHARIRA_STHANA: 'Sharira Sthana',
  INDRIYA_STHANA: 'Indriya Sthana',
  CHIKITSA_STHANA: 'Chikitsa Sthana',
  KALPA_STHANA: 'Kalpa Sthana',
  SIDDHI_STHANA: 'Siddhi Sthana',
  UTTARA_TANTRA: 'Uttara Tantra / Sthana'
});

export const SAMHITA_STHANA_LIST = Object.freeze(Object.values(SAMHITA_STHANAS));
