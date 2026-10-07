
export const rasaDhatuData = {
  name: 'Rasa',
  slug: 'rasa',
  sanskritName: {
    devanagari: 'रस',
    iast: 'Rasa',
    etymology: 'Rasyate gamyate aharahariti Rasaḥ (that which circulates continuously through channels day and night).'
  },
  order: 1,
  classification: {
    mahabhutaDominance: ['Jala'],
    guna: ['Guru', 'Snigdha', 'Drava', 'Manda', 'Sheeta'],
    doshaAffiliation: 'Kapha Dosha (Ashraya-Ashrayi Bhava)',
    category: 'Sharira Dharana & Poshana Dravya'
  },
  generalDescription: 'Rasa is the first tissue formed from digested food essence (Ahara Rasa). It constitutes circulating plasma, extracellular fluid, and lymph, perpetually irrigating and hydrating every cell and tissue bed in the organism.',
  westernCorrelation: 'Blood plasma, lymph, chyle, and interstitial extracellular fluid carrying dissolved electrolytes, amino acids, and glucose.',
  functions: [
    {
      classicalTerm: 'Prinana',
      meaning: 'Nourishment / Cellular Satiation',
      description: 'Satiates, hydrates, and supplies vital biochemical nutrients to all succeeding tissues (Rakta through Shukra).'
    }
  ],
  dhatuLakshana: [
    {
      characteristic: 'Continuous Uninterrupted Circulation',
      sanskritTerm: 'Aharaha Gamanam',
      explanation: 'Circulates throughout macroscopic and microscopic vascular networks without pause.'
    },
    {
      characteristic: 'Cellular Satiation and Refreshment',
      sanskritTerm: 'Tarpana & Prinana',
      explanation: 'Provides subjective contentment, hydration, and cellular fullness.'
    }
  ],
  location: [
    'Hridaya (Heart - central distribution pump)',
    'Dasha Dhamanis (Ten Great Circulatory Vessels)',
    'Rasavaha Srotas (Microvascular and lymphatic channels)'
  ],
  formation: {
    processDescription: 'Ingested food is digested by Jatharagni in the gastrointestinal tract, yielding Ahara Rasa (Prasada Bhaga). This enters the Rasavaha Srotas where Rasagni completes tissue transformation into mature Rasa Dhatu.',
    precursorDhatu: 'Ahara Rasa (Digested Chyme Essence)',
    transformationDuration: 'Begins absorption immediately; continuous circulatory kinetics across daily biological cycles (Ahoratra).'
  },
  dhatvagni: {
    name: 'Rasagni',
    description: 'Enzymatic metabolic fire localized within Rasavaha Srotas that digests nutrient precursor into mature circulating plasma.',
    prasadaBhaga: 'Sustains circulating plasma volume and seeds the subtle precursor fraction (Poshaka Rakta) for blood formation.',
    kittaBhaga: 'Posha Kapha / Mala Kapha (protective mucosal secretions of respiratory and digestive tracts).'
  },
  upadhatus: [
    {
      name: 'Stanya (Maternal Breast Milk)',
      sanskritName: 'स्तन्य',
      description: 'Accessory tissue synthesized in lactating females from refined Rasa Dhatu.'
    },
    {
      name: 'Artava (Ovulatory / Menstrual Essence)',
      sanskritName: 'आर्तव',
      description: 'Accessory fluid synthesized cyclically in reproductive females from mature Rasa Dhatu.'
    }
  ],
  malas: [
    {
      name: 'Kapha (Physiological Mucus)',
      sanskritName: 'कफ',
      description: 'Metabolic waste mucus excreted into mucosal interfaces during Rasagni transformation.'
    }
  ],
  sarata: [
    {
      featureCategory: 'Tvaksara / Rasasara (Excellence of Skin & Plasma)',
      characteristics: [
        'Unctuous, smooth, lustrous skin and fine, deep-rooted soft hairs',
        'High natural immunity, cheerful disposition, mental clarity, and physical resilience'
      ],
      clinicalSignificance: 'Predicts high physical endurance, longevity, and resistance against dehydration and skin disorders.'
    }
  ],
  clinicalRelevance: {
    kshayaLakshana: [
      {
        symptom: 'Sound intolerance, extreme thirst, dryness of mouth and skin, and rapid fatigue',
        sanskritTerm: 'Ghatte sahate shabdam, trishna, shramo, rukshata',
        clinicalExplanation: 'Reflects hypovolemia, dehydration, and extracellular fluid depletion.'
      }
    ],
    vriddhiLakshana: [
      {
        symptom: 'Nausea, excessive salivation, heaviness of body, and coldness',
        sanskritTerm: 'Hrillasa, praseka, gaurava, shaitya',
        clinicalExplanation: 'Reflects hypervolemia, fluid retention, or excessive mucus congestion.'
      }
    ],
    pradoshajaVikara: [
      {
        diseaseName: 'Aruchi (Anorexia) & Panduta (Pallor)',
        sanskritName: 'अरुचि, पाण्डुता',
        description: 'Loss of appetite, taste impairment, and systemic pallor resulting from vitiation of Rasavaha Srotas.'
      }
    ]
  },
  srotas: {
    name: 'Rasavaha Srotas',
    moolasthana: ['Hridaya (Heart)', 'Dasha Dhamanis (Ten Great Vessels)'],
    vitiationCauses: [
      'Excessive consumption of cold, heavy, unctuous foods and psychological worry/grief (Chintana)'
    ],
    vitiationSymptoms: [
      'Loss of taste, nausea, body heaviness, low-grade malaise, and premature wrinkling'
    ]
  },
  ojasRelationship: {
    description: 'Rasa Dhatu is the foundational nutrient stream whose clean, uninterrupted circulation provides the substrate from which all subsequent Dhatus develop, ultimately culminating in Ojas.',
    classicalContext: 'Charaka emphasizes that unvitiated Rasa ensures optimal longevity and immune vigor.'
  },
  verification: {
    status: 'verified',
    verificationNotes: 'Source verified with Charaka Sutra 28/4, Ashtanga Hridaya Sutra 11/1-5, and Sushruta Sutra 14/10.'
  }
};

export default rasaDhatuData;
