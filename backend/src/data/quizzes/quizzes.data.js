
export const quizzesSeedData = [
  {
    slug: 'quiz-dhatu-sequence-first',
    question: 'According to classical Ayurveda, which of the following is the first tissue (Dhatu) formed from digested food essence (Ahara Rasa)?',
    questionType: 'multiple_choice',
    options: [
      { optionId: 'A', text: 'Rakta Dhatu (Blood)' },
      { optionId: 'B', text: 'Rasa Dhatu (Nutrient Plasma)' },
      { optionId: 'C', text: 'Mamsa Dhatu (Muscle)' },
      { optionId: 'D', text: 'Asthi Dhatu (Bone)' }
    ],
    correctOptionId: 'B',
    explanation: 'Rasa Dhatu is the first tissue in the chronological Sapta Dhatu sequence, formed directly from digested food essence (Ahara Rasa) in the gastrointestinal tract and circulated from the heart.',
    difficulty: 'beginner',
    category: 'Sapta Dhatu Sequence',
    dhatuSlug: 'rasa',
    relatedConcept: 'Sapta Dhatu Sequence',
    referenceSlug: 'charaka-sutra-28-4'
  },
  {
    slug: 'quiz-primary-function-rasa',
    question: 'What is the classical foremost function (Karma) assigned to Rasa Dhatu in Ashtanga Hridaya Sutrasthana 11?',
    questionType: 'multiple_choice',
    options: [
      { optionId: 'A', text: 'Jivana (Enlivening)' },
      { optionId: 'B', text: 'Lepana (Covering)' },
      { optionId: 'C', text: 'Prinana (Nourishment and cellular satiation)' },
      { optionId: 'D', text: 'Dharana (Supporting posture)' }
    ],
    correctOptionId: 'C',
    explanation: 'Ashtanga Hridaya Sutra 11/4 declares: "Prinanam jivanam lepa sneho dharanapurane | garbhotpadascha dhatunam shreshtham karma kramat smritam." Prinana (nourishment/satiation) is the foremost function of Rasa Dhatu.',
    difficulty: 'beginner',
    category: 'Dhatu Functions',
    dhatuSlug: 'rasa',
    relatedConcept: 'Dhatu Karma',
    referenceSlug: 'ashtanga-hridaya-sutra-11-4'
  },
  {
    slug: 'quiz-primary-function-rakta',
    question: 'Which Dhatu has the primary classical function of "Jivana" (sustaining life, oxygenation, and consciousness)?',
    questionType: 'multiple_choice',
    options: [
      { optionId: 'A', text: 'Meda Dhatu' },
      { optionId: 'B', text: 'Rakta Dhatu' },
      { optionId: 'C', text: 'Majja Dhatu' },
      { optionId: 'D', text: 'Shukra Dhatu' }
    ],
    correctOptionId: 'B',
    explanation: 'Rakta Dhatu carries Prana (life-force) and bodily warmth to all organs; its foremost classical action is Jivana (vitalizing and enlivening the entire organism).',
    difficulty: 'beginner',
    category: 'Dhatu Functions',
    dhatuSlug: 'rakta',
    relatedConcept: 'Dhatu Karma',
    referenceSlug: 'ashtanga-hridaya-sutra-11-4'
  },
  {
    slug: 'quiz-dhatvagni-count',
    question: 'How many dedicated tissue-level metabolic fires (Dhatvagnis) operate in classical Ayurvedic physiology?',
    questionType: 'multiple_choice',
    options: [
      { optionId: 'A', text: '3 Dhatvagnis' },
      { optionId: 'B', text: '5 Dhatvagnis' },
      { optionId: 'C', text: '7 Dhatvagnis' },
      { optionId: 'D', text: '13 Dhatvagnis' }
    ],
    correctOptionId: 'C',
    explanation: 'There are 7 Dhatvagnis—one for each of the Sapta Dhatus: Rasagni, Raktagni, Mamsagni, Medogni, Asthyagni, Majjagni, and Shukragni. Together with 1 Jatharagni and 5 Bhutagnis, they make 13 total bodily Agnis.',
    difficulty: 'beginner',
    category: 'Dhatvagni',
    relatedConcept: 'Agni',
    referenceSlug: 'charaka-chikitsa-15-15'
  },
  {
    slug: 'quiz-dhatvagni-fractions',
    question: 'During Dhatvagni metabolic transformation, into which two primary biological fractions is precursor substance divided?',
    questionType: 'multiple_choice',
    options: [
      { optionId: 'A', text: 'Vata and Kapha fractions' },
      { optionId: 'B', text: 'Prasada Bhaga (Nutrient Essence) and Kitta Bhaga (Metabolic Waste)' },
      { optionId: 'C', text: 'Ojas and Ama fractions' },
      { optionId: 'D', text: 'Acidic and Alkaline fractions' }
    ],
    correctOptionId: 'B',
    explanation: 'Charaka Chikitsa 15/15 states: "Yathasvamagnibhih pakam yanti kittaprasadavat." Each Dhatvagni divides nutrients into Prasada (nutrient essence nourishing self and seeding next tissue) and Kitta (excretory waste).',
    difficulty: 'intermediate',
    category: 'Dhatvagni',
    relatedConcept: 'Dhatvagni Paka',
    referenceSlug: 'charaka-chikitsa-15-15'
  },
  {
    slug: 'quiz-three-nyayas-irrigation',
    question: 'Which of the Three Dhatuposhana Nyayas compares nutrient circulation to irrigation water flowing through canals to water agricultural fields?',
    questionType: 'multiple_choice',
    options: [
      { optionId: 'A', text: 'Kshira-Dadhi Nyaya' },
      { optionId: 'B', text: 'Kedari-Kulya Nyaya' },
      { optionId: 'C', text: 'Khale-Kapota Nyaya' },
      { optionId: 'D', text: 'Arundhati Nyaya' }
    ],
    correctOptionId: 'B',
    explanation: 'Kedari-Kulya Nyaya (Law of Field Irrigation) compares blood vessels to irrigation ditches (Kulyas) conveying nutrient water from a central reservoir to consecutive tissue fields (Kedaris).',
    difficulty: 'intermediate',
    category: 'Three Nyayas',
    relatedConcept: 'Kedari-Kulya Nyaya',
    referenceSlug: 'charaka-chikitsa-15-15'
  },
  {
    slug: 'quiz-three-nyayas-selective-uptake',
    question: 'Which classical law explains how different tissues selectively absorb only their required nutrient molecules from the common bloodstream, like birds picking grains from a threshing floor?',
    questionType: 'multiple_choice',
    options: [
      { optionId: 'A', text: 'Khale-Kapota Nyaya' },
      { optionId: 'B', text: 'Kedari-Kulya Nyaya' },
      { optionId: 'C', text: 'Kshira-Dadhi Nyaya' },
      { optionId: 'D', text: 'Bija-Vriksha Nyaya' }
    ],
    correctOptionId: 'A',
    explanation: 'Khale-Kapota Nyaya (Law of Pigeons at the Threshing Floor) explains receptor-like selective cellular uptake, where specific tissue channels attract and absorb specific molecules from circulating blood.',
    difficulty: 'intermediate',
    category: 'Three Nyayas',
    relatedConcept: 'Khale-Kapota Nyaya',
    referenceSlug: 'charaka-chikitsa-15-15'
  },
  {
    slug: 'quiz-ojas-precursor',
    question: 'Ojas is the quintessential culmination of the entire Sapta Dhatu chain. Which tissue serves as its immediate preceding physical parent?',
    questionType: 'multiple_choice',
    options: [
      { optionId: 'A', text: 'Rasa Dhatu' },
      { optionId: 'B', text: 'Meda Dhatu' },
      { optionId: 'C', text: 'Majja Dhatu' },
      { optionId: 'D', text: 'Shukra Dhatu' }
    ],
    correctOptionId: 'D',
    explanation: 'Charaka Sutra 17/74 states: "Ojastu tejo dhatunam shukrantanam param smritam." Ojas is the supreme essence of all tissues ending with Shukra Dhatu, with Shukra serving as its immediate precursor.',
    difficulty: 'intermediate',
    category: 'Ojas',
    dhatuSlug: 'shukra',
    relatedConcept: 'Ojas',
    referenceSlug: 'charaka-sutra-17-74'
  },
  {
    slug: 'quiz-asthi-vata-relationship',
    question: 'What is unique about the Ashraya-Ashrayi relationship between Vata Dosha and Asthi Dhatu (bone tissue)?',
    questionType: 'multiple_choice',
    options: [
      { optionId: 'A', text: 'When Vata increases, Asthi increases proportionally' },
      { optionId: 'B', text: 'When Vata increases, Asthi decreases (an inverted/inverse relationship)' },
      { optionId: 'C', text: 'Vata has no relationship with Asthi Dhatu' },
      { optionId: 'D', text: 'Asthi produces Vata Dosha as its metabolic waste' }
    ],
    correctOptionId: 'B',
    explanation: 'Unlike other Dosha-Dhatu pairs where Dosha increase causes tissue increase, Vata and Asthi exhibit an inverse relationship: aggravation of dry, rough Vata causes depletion/porosity of bone (Asthisaushirya).',
    difficulty: 'advanced',
    category: 'Tridosha & Dhatus',
    dhatuSlug: 'asthi',
    relatedConcept: 'Ashraya-Ashrayi Bhava',
    referenceSlug: 'ashtanga-hridaya-sutra-11-1'
  },
  {
    slug: 'quiz-upadhatu-definition',
    question: 'What distinguishes an Upadhatu (accessory tissue) from a primary Dhatu in classical Ayurvedic physiology?',
    questionType: 'multiple_choice',
    options: [
      { optionId: 'A', text: 'Upadhatus are toxic and must be excreted immediately' },
      { optionId: 'B', text: 'Upadhatus support the body but do not nourish or produce a subsequent tissue in the metabolic chain' },
      { optionId: 'C', text: 'Upadhatus exist only in infancy and disappear in adults' },
      { optionId: 'D', text: 'Upadhatus have no classical references in Samhitas' }
    ],
    correctOptionId: 'B',
    explanation: 'Primary Dhatus both support (Dharana) and nourish subsequent tissues (Poshana). Upadhatus (like breast milk, menstrual fluid, tendons, and ligaments) uphold the body but do not feed a subsequent tissue stage.',
    difficulty: 'intermediate',
    category: 'Terminology',
    relatedConcept: 'Upadhatu',
    referenceSlug: 'charaka-chikitsa-15-15'
  },
  {
    slug: 'quiz-mala-of-meda',
    question: 'Which bodily excretion is classically recognized as the metabolic waste product (Mala) of Meda Dhatu (adipose tissue)?',
    questionType: 'multiple_choice',
    options: [
      { optionId: 'A', text: 'Purisha (Feces)' },
      { optionId: 'B', text: 'Mutra (Urine)' },
      { optionId: 'C', text: 'Sveda (Sweat / Perspiration)' },
      { optionId: 'D', text: 'Kesha (Hair)' }
    ],
    correctOptionId: 'C',
    explanation: 'Charaka and Ashtanga Hridaya declare that Sveda (sweat) is the specific metabolic waste (Mala) produced during the transformation of Meda Dhatu by Medogni.',
    difficulty: 'beginner',
    category: 'Dhatu Mala',
    dhatuSlug: 'meda',
    relatedConcept: 'Mala',
    referenceSlug: 'ashtanga-hridaya-sutra-11-1'
  },
  {
    slug: 'quiz-sushruta-duration',
    question: 'According to Sushruta Samhita Sutrasthana 14, approximately how long does it take for a single Dhatu transformation to complete (in Kalas)?',
    questionType: 'multiple_choice',
    options: [
      { optionId: 'A', text: '100 Kalas (~2 hours)' },
      { optionId: 'B', text: '1000 Kalas (~1 day)' },
      { optionId: 'C', text: '3015 Kalas (~5 days per Dhatu, totaling ~30 days for complete cycle)' },
      { optionId: 'D', text: '10,000 Kalas (~1 year)' }
    ],
    correctOptionId: 'C',
    explanation: 'Sushruta and commentator Dalhana explain that nutrient essence remains in each Dhatu for 3015 Kalas (roughly 5 days), taking approximately 30 to 31 days to complete the full journey from food to mature Shukra.',
    difficulty: 'advanced',
    category: 'Dhatuposhana Timeline',
    relatedConcept: 'Sequential Transformation Process',
    referenceSlug: 'sushruta-sutra-14-10'
  },
  {
    slug: 'quiz-ama-definition',
    question: 'According to Ashtanga Hridaya Sutrasthana 13/25, what causes the formation of Ama in the human body?',
    questionType: 'multiple_choice',
    options: [
      { optionId: 'A', text: 'Excessive physical exercise and running' },
      { optionId: 'B', text: 'Weakness or deficiency of internal digestive fire (Ushmano\'lpabalatvena / Mandagni)' },
      { optionId: 'C', text: 'Consuming hot water after meals' },
      { optionId: 'D', text: 'Sleeping on a firm mattress' }
    ],
    correctOptionId: 'B',
    explanation: 'Ashtanga Hridaya Sutra 13/25 explicitly states that due to the diminished strength of internal Agni (Ushmano\'lpabalatvena), the initial nutrient essence remains unassimilated and undigested, forming toxic Ama.',
    difficulty: 'intermediate',
    category: 'Foundational Concepts',
    relatedConcept: 'Ama',
    referenceSlug: 'ashtanga-hridaya-sutra-13-25'
  },
  {
    slug: 'quiz-shukra-mala-status',
    question: 'What is the classical status of excretory waste (Mala) produced by Shukra Dhatu during Shukragni transformation?',
    questionType: 'multiple_choice',
    options: [
      { optionId: 'A', text: 'It produces abundant gross waste expelled through the kidneys' },
      { optionId: 'B', text: 'It produces hair and nails' },
      { optionId: 'C', text: 'It is classically designated as Nirmala (producing no gross excretory waste)' },
      { optionId: 'D', text: 'It produces bile' }
    ],
    correctOptionId: 'C',
    explanation: 'Because Shukra represents the ultimate biological refinement after six prior stages of metabolic filtering, classical authorities state "Shukre Malabhavah"—Shukra produces no gross excretory waste (Nirmala).',
    difficulty: 'advanced',
    category: 'Dhatu Mala',
    dhatuSlug: 'shukra',
    relatedConcept: 'Mala',
    referenceSlug: 'charaka-chikitsa-15-15'
  },
  {
    slug: 'quiz-srotas-definition',
    question: 'What is the root meaning of the term "Srotas" in Charaka Vimanasthana 5?',
    questionType: 'multiple_choice',
    options: [
      { optionId: 'A', text: 'Solid bones that support the skull' },
      { optionId: 'B', text: 'Channels through which nutrient fluids and metabolites permeate and circulate (Sravanat Srotamsi)' },
      { optionId: 'C', text: 'Digestive enzymes secreted by the pancreas' },
      { optionId: 'D', text: 'External sense organs' }
    ],
    correctOptionId: 'B',
    explanation: 'Charaka Vimana 5 defines Srotas with the etymological aphorism "Sravanat Srotamsi"—channels through which biological fluids, nutrients, and metabolites permeate, circulate, and undergo transformation.',
    difficulty: 'intermediate',
    category: 'Srotas',
    relatedConcept: 'Srotas',
    referenceSlug: 'charaka-vimana-5-3'
  }
];

export default quizzesSeedData;
