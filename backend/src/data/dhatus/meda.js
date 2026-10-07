

export const medaDhatuData = {
  name: 'Meda',
  slug: 'meda',
  sanskritName: {
    devanagari: 'मेद',
    iast: 'Meda',
    etymology: 'Midyati snihyati iti Medaḥ (that which provides deep lubrication, oleation, and unctuous protection).'
  },
  order: 4,
  classification: {
    mahabhutaDominance: ['Jala', 'Prithvi'],
    guna: ['Snigdha', 'Guru', 'Manda', 'Sandra', 'Mridu', 'Sheeta'],
    doshaAffiliation: 'Kapha Dosha',
    category: 'Sharira Dharana & Poshana Dravya'
  },
  generalDescription: 'Meda Dhatu constitutes adipose tissue and subcutaneous lipid reserves. It provides profound internal lubrication, insulates against temperature fluctuations, protects vital organs, and serves as fuel for bone tissue nourishment.',
  westernCorrelation: 'Adipose tissue, triglycerides, subcutaneous fat, visceral omental fat, and endocrine lipid signaling.',
  functions: [
    {
      classicalTerm: 'Snehana & Svedana',
      meaning: 'Lubrication / Oleation & Sweating',
      description: 'Provides deep unctuousness to internal channels, lubricates joints, facilitates natural perspiration, and nourishes Asthi Dhatu.'
    }
  ],
  dhatuLakshana: [
    {
      characteristic: 'Unctuous Cushioning',
      sanskritTerm: 'Snigdha-Gaurava',
      explanation: 'Soft, yellowish lipid accumulation cushioning kidneys, abdomen, and subcutaneous spaces.'
    },
    {
      characteristic: 'Thermoregulation and Insulation',
      sanskritTerm: 'Sharira-Ushma Rakshana',
      explanation: 'Preserves bodily warmth and prevents rapid dissipation of internal metabolic heat.'
    }
  ],
  location: [
    'Udara (Abdominal cavity and subcutaneous abdominal wall)',
    'Vrikka (Perirenal adipose tissue)',
    'Vapavahana (Greater omentum / peritoneal fat)',
    'Medovaha Srotas'
  ],
  formation: {
    processDescription: 'The nutrient fraction derived from Mamsa Dhatu enters Medovaha Srotas where Medogni transforms lipid precursors into mature adipose tissue while generating sweat as metabolic waste.',
    precursorDhatu: 'Poshaka Mamsa Dhatu',
    transformationDuration: 'Progression in sequential model (~5 days per tissue bed), influenced strongly by dietary caloric intake and physical exercise.'
  },
  dhatvagni: {
    name: 'Medogni',
    description: 'Enzymatic metabolic fire localized within adipose tissue and renal channels governing lipid synthesis and breakdown.',
    prasadaBhaga: 'Nourishes structural adipose tissue and yields dense mineral-rich precursors (Poshaka Asthi) for bone synthesis.',
    kittaBhaga: 'Sveda (perspiration / metabolic sweat carrying water and dissolved salts).'
  },
  upadhatus: [
    {
      name: 'Snayu (Ligaments and Fibrous Connective Tissues)',
      sanskritName: 'स्नायु',
      description: 'Strong cord-like ligaments and articular capsules binding joints together.'
    },
    {
      name: 'Sandhi-Bandhana (Articular Fibrous Bands)',
      sanskritName: 'सन्धिबन्धन',
      description: 'Supportive joint capsules derived from refined Meda tissue metabolism.'
    }
  ],
  malas: [
    {
      name: 'Sveda (Sweat / Perspiration)',
      sanskritName: 'स्वेद',
      description: 'Metabolic water, salts, and unctuous waste eliminated via sweat glands.'
    }
  ],
  sarata: [
    {
      featureCategory: 'Medasara (Excellence of Adipose Tissue)',
      characteristics: [
        'Unctuous, clear, and melodious voice, radiant unctuous eyes, hair, teeth, nails, urine, and stool',
        'Balanced, harmonious physique, tolerance to hunger and thirst, and compassionate disposition'
      ],
      clinicalSignificance: 'Predicts high structural joint lubrication, resistance to degenerative arthritis, and stable metabolic reserve.'
    }
  ],
  clinicalRelevance: {
    kshayaLakshana: [
      {
        symptom: 'Sensation of emptiness/cracking in joints, splenic enlargement sensation, emaciation of abdomen, and craving for fatty foods',
        sanskritTerm: 'Sandhi-shunyata, plihavridhi, krishangata, mamsaprarthana',
        clinicalExplanation: 'Corresponds clinically to severe lipodystrophy, joint crepitus, and deficiency of essential fatty acids.'
      }
    ],
    vriddhiLakshana: [
      {
        symptom: 'Obesity, dyspnea on slight exertion, offensive body odor from excess perspiration, and intense hunger',
        sanskritTerm: 'Sthaulya, shvasa, daurgandhya, kshudhadhikya',
        clinicalExplanation: 'Corresponds to metabolic syndrome, adiposity, hyperhidrosis, and lipid dysregulation.'
      }
    ],
    pradoshajaVikara: [
      {
        diseaseName: 'Prameha (Metabolic Disorders / Diabetes) & Medoroga (Obesity)',
        sanskritName: 'प्रमेह, मेदोरोग',
        description: 'Impaired carbohydrate and lipid metabolism resulting from vitiation of Medovaha Srotas.'
      }
    ]
  },
  srotas: {
    name: 'Medovaha Srotas',
    moolasthana: ['Vrikka (Kidneys)', 'Vapavahana (Omentum / Peritoneal Fat)'],
    vitiationCauses: [
      'Lack of physical exercise, sleeping during daytime, excessive consumption of sweet, oily foods, and alcohol'
    ],
    vitiationSymptoms: [
      'Pre-diabetic polyuria (Prameha purvarupa), lipomas (Granthi), excessive perspiration, and body odor'
    ]
  },
  ojasRelationship: {
    description: 'Properly metabolized Meda provides internal oleation (Sneha) that protects tissues from friction and Vata dryness, shielding Ojas from depletion.',
    classicalContext: 'Charaka emphasizes that excessive Meda blocks channels and starves subsequent Dhatus, impairing Ojas, whereas balanced Meda sustains vitality.'
  },
  verification: {
    status: 'verified',
    verificationNotes: 'Source verified with Charaka Sutra 21, Ashtanga Hridaya Sutra 11/1-5, and Sushruta Sutra 15.'
  }
};

export default medaDhatuData;
