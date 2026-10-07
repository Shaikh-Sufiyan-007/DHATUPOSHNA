
export const raktaDhatuData = {
  name: 'Rakta',
  slug: 'rakta',
  sanskritName: {
    devanagari: 'रक्त',
    iast: 'Rakta',
    etymology: 'Ranjeti iti Raktam (that which imparts red coloration and enlivens the entire body).'
  },
  order: 2,
  classification: {
    mahabhutaDominance: ['Tejas', 'Jala'],
    guna: ['Ushna', 'Drava', 'Sara', 'Snigdha', 'Vishra'],
    doshaAffiliation: 'Pitta Dosha (Ashraya-Ashrayi Bhava)',
    category: 'Sharira Dharana & Poshana Dravya'
  },
  generalDescription: 'Rakta is the vital red blood tissue carrying Prana (life-force) and bodily warmth. Formed by the enzymatic coloration of nutrient plasma in the liver and spleen, it enlivens consciousness and oxygenates tissues.',
  westernCorrelation: 'Erythrocytes (red blood cells), hemoglobin, whole blood volume, and vascular perfusion systems.',
  functions: [
    {
      classicalTerm: 'Jivana',
      meaning: 'Sustaining Life / Enlivening',
      description: 'Preserves vital biological consciousness, cellular respiration, and tissue oxygenation.'
    }
  ],
  dhatuLakshana: [
    {
      characteristic: 'Indragopa Color & Viscosity',
      sanskritTerm: 'Padmotpala-sannibha, asamhata',
      explanation: 'Vibrant ruby red like lotus petals, neither excessively coagulated nor excessively watery, possessing a characteristic metallic scent.'
    },
    {
      characteristic: 'Vitalization of Senses',
      sanskritTerm: 'Dhatu-prasadana & Varna-prasadana',
      explanation: 'Imparts healthy pinkish complexion and keenness to sensory organs.'
    }
  ],
  location: [
    'Yakrit (Liver - primary site of Ranjana)',
    'Pliha (Spleen - organ of storage and filtration)',
    'Raktavaha Srotas and peripheral vascular beds'
  ],
  formation: {
    processDescription: 'The subtle precursor fraction of Rasa Dhatu (Poshaka Rasa) enters the liver and spleen where Ranjaka Pitta and Raktagni impart red coloration, transforming it into mature Rakta Dhatu.',
    precursorDhatu: 'Poshaka Rasa Dhatu',
    transformationDuration: 'Classically detailed by Sushruta as taking roughly 5 days (3015 Kalas) in sequential transformation, or continuous daily exchange per Charaka.'
  },
  dhatvagni: {
    name: 'Raktagni',
    description: 'Metabolic fire operating in hepatic, splenic, and vascular channels converting clear plasma precursor into mature red blood cells.',
    prasadaBhaga: 'Nourishes circulating blood volume and yields precursor molecules (Poshaka Mamsa) for muscle tissue.',
    kittaBhaga: 'Pitta Mala (metabolic waste bile pigments excreted into digestive tract).'
  },
  upadhatus: [
    {
      name: 'Kandara (Large Tendons / Tendinous Cords)',
      sanskritName: 'कण्डरा',
      description: 'Thick, strong fibrous cords derived during Raktagni metabolism that anchor muscles to bone.'
    },
    {
      name: 'Sira (Blood Vessels / Vascular Conduits)',
      sanskritName: 'सिरा',
      description: 'Arterial and venous conduits maintaining circulatory continuity.'
    }
  ],
  malas: [
    {
      name: 'Pitta Mala (Metabolic Bile)',
      sanskritName: 'पित्त मल',
      description: 'Metabolic bile byproducts produced during hepatic blood transformation.'
    }
  ],
  sarata: [
    {
      featureCategory: 'Raktasara (Excellence of Blood Tissue)',
      characteristics: [
        'Lustrous, unctuous, copper-red ears, eyes, nose, mouth, tongue, lips, palms, soles, and nails',
        'Radiant warm complexion, clarity of mind, moderate physical strength, and emotional warmth'
      ],
      clinicalSignificance: 'Predicts high cardiovascular health, excellent microcirculation, and resistance to cold and pallor.'
    }
  ],
  clinicalRelevance: {
    kshayaLakshana: [
      {
        symptom: 'Craving for sour and cold foods, loss of vascular tone, pallor, and dry skin',
        sanskritTerm: 'Amla-shishira-prarthana, sira-shaithilya, rukshata',
        clinicalExplanation: 'Corresponds clinically to anemia, hypovolemia, and vascular flaccidity.'
      }
    ],
    vriddhiLakshana: [
      {
        symptom: 'Erythema of eyes and skin, vascular engorgement, bleeding tendencies, and skin eruptions',
        sanskritTerm: 'Raktanga, sirapurnata, kushtha, visarpa, asrapitta',
        clinicalExplanation: 'Corresponds to polycythemia, hypertension, inflammatory vascular conditions, and purpura.'
      }
    ],
    pradoshajaVikara: [
      {
        diseaseName: 'Raktapitta (Bleeding Diathesis) & Visarpa (Erysipelas)',
        sanskritName: 'रक्तपित्त, विसर्प',
        description: 'Severe hemorrhagic conditions and acute spreading cellulitic skin inflammations due to vitiated blood.'
      }
    ]
  },
  srotas: {
    name: 'Raktavaha Srotas',
    moolasthana: ['Yakrit (Liver)', 'Pliha (Spleen)', 'Raktavahi Dhamanis (Arterial Trunks)'],
    vitiationCauses: [
      'Excessive intake of spicy, salty, sour, fermented, and heating foods, coupled with anger and sun exposure'
    ],
    vitiationSymptoms: [
      'Skin diseases (Kushtha), epistaxis, hematuria, stomatitis, jaundice, and splenomegaly'
    ]
  },
  ojasRelationship: {
    description: 'Rakta Dhatu carries Prana Vayu and oxygenation throughout tissues; without adequate healthy Rakta, Ojas cannot be distributed to sustain immune defense.',
    classicalContext: 'Sushruta explicitly links pure Rakta with unhindered longevity and vitality.'
  },
  verification: {
    status: 'verified',
    verificationNotes: 'Source verified with Sushruta Sutra 14/10, Ashtanga Hridaya Sutra 11/1-5, and Charaka Sutra 24.'
  }
};

export default raktaDhatuData;
