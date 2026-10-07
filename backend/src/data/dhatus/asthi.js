
export const asthiDhatuData = {
  name: 'Asthi',
  slug: 'asthi',
  sanskritName: {
    devanagari: 'अस्थि',
    iast: 'Asthi',
    etymology: 'Asyati tishthati deho\'smin iti Asthi (that upon which the entire bodily structure stands erect and firm).'
  },
  order: 5,
  classification: {
    mahabhutaDominance: ['Prithvi', 'Vayu', 'Tejas'],
    guna: ['Khara', 'Kathina', 'Guru', 'Sthira'],
    doshaAffiliation: 'Vata Dosha (Special Inverted Ashraya-Ashrayi Bhava: Vata increase causes Asthi decrease)',
    category: 'Sharira Dharana & Poshana Dravya'
  },
  generalDescription: 'Asthi Dhatu comprises the rigid osseous framework (bones and cartilage) of the body. It confers erect posture, sustains mechanical weight, protects delicate internal organs (brain, heart, lungs), and houses marrow inside its cavities.',
  westernCorrelation: 'Osseous tissue, cortical and trabecular bone, skeletal mineral matrix (calcium hydroxyapatite), and teeth.',
  functions: [
    {
      classicalTerm: 'Dharana',
      meaning: 'Structural Support / Sustaining Posture',
      description: 'Maintains upright physical posture, bears mechanical loads, anchors muscles and ligaments, and encloses central vital organs.'
    }
  ],
  dhatuLakshana: [
    {
      characteristic: 'Hard Osseous Matrix with Microscopic Porosity',
      sanskritTerm: 'Kathinatva & Sushiratva',
      explanation: 'Dense, hard outer mineral shell with interior micro-channels formed by Vayu and solid Prithvi.'
    },
    {
      characteristic: 'Marrow Protection',
      sanskritTerm: 'Majja-Adhara',
      explanation: 'Forms secure hollow internal cavities (Nalaka Asthi) preserving bone marrow.'
    }
  ],
  location: [
    'Skeletal framework (Kapala, Ruchaka, Taruna, Valaya, Nalaka Asthis)',
    'Danta (Teeth - modified osseous tissue)',
    'Asthivaha Srotas'
  ],
  formation: {
    processDescription: 'The nutrient fraction derived from Meda Dhatu is metabolized by Asthyagni; Prithvi and Tejas solidify the mineral matrix while Vayu introduces internal micro-cavities (Sushiratva).',
    precursorDhatu: 'Poshaka Meda Dhatu',
    transformationDuration: 'Progression in sequential model (~5 days per tissue bed), demonstrating slower cellular turnover than soft tissues.'
  },
  dhatvagni: {
    name: 'Asthyagni',
    description: 'Enzymatic metabolic fire operating in osseous and periosteal channels calcifying precursor nutrients into bone.',
    prasadaBhaga: 'Nourishes dense bone matrix and yields lipid-rich precursors (Poshaka Majja) for the marrow.',
    kittaBhaga: 'Kesha (scalp hair), Loma (body hair), and Nakha (nails).'
  },
  upadhatus: [
    {
      name: 'Danta (Teeth)',
      sanskritName: 'दन्त',
      description: 'Calcified masticatory structures considered in classical Ayurveda as specialized Upadhatu or modified bone.'
    }
  ],
  malas: [
    {
      name: 'Kesha, Loma & Nakha (Hair & Nails)',
      sanskritName: 'केश, लोम, नख',
      description: 'Keratinized metabolic waste tissues extruded from bone metabolism.'
    }
  ],
  sarata: [
    {
      featureCategory: 'Asthisara (Excellence of Bone Tissue)',
      characteristics: [
        'Robust head, prominent chin, large, strong, regular teeth, broad cheekbones, prominent joints, and dense heels',
        'Exceptional physical fortitude, endurance under hardship, steadfast resolution, and long lifespan'
      ],
      clinicalSignificance: 'Predicts high bone mineral density, resistance to fractures and osteoporosis, and structural longevity.'
    }
  ],
  clinicalRelevance: {
    kshayaLakshana: [
      {
        symptom: 'Bone aches, brittle nails and teeth, hair loss, joint laxity, and exhaustion',
        sanskritTerm: 'Asthitoda, danta-nakha-bhangura, keshaprapata, sandhi-shaithilya',
        clinicalExplanation: 'Corresponds clinically to osteopenia, osteoporosis, pathological fracture vulnerability, and nail brittleness.'
      }
    ],
    vriddhiLakshana: [
      {
        symptom: 'Bony exostoses, bone spurs, extra teeth (supernumerary teeth), and deep bone pain',
        sanskritTerm: 'Adhyasthi, adhidanta, asthi-shula',
        clinicalExplanation: 'Corresponds to osteophytes, bone spurs, hyperostosis, and dentition anomalies.'
      }
    ],
    pradoshajaVikara: [
      {
        diseaseName: 'Asthibheda (Spontaneous Fractures) & Danta-Vaidurya (Dental Decay)',
        sanskritName: 'अस्थिभेद, दन्तशूल',
        description: 'Deep osseous pains, caries, discoloration, and structural bone degeneration due to vitiated Asthivaha Srotas.'
      }
    ]
  },
  srotas: {
    name: 'Asthivaha Srotas',
    moolasthana: ['Medas (Adipose tissue)', 'Jaghana (Pelvic girdle / iliac crests)'],
    vitiationCauses: [
      'Excessive physical strain, direct trauma to bones, over-consumption of Vata-aggravating dry, rough, bitter foods'
    ],
    vitiationSymptoms: [
      'Bone aches, spontaneous fractures, hair loss, brittle nails, and dental caries'
    ]
  },
  ojasRelationship: {
    description: 'Asthi Dhatu provides the rigid protective sanctuary for Majja Dhatu, which generates the deeper reproductive and immunological reserves feeding Ojas.',
    classicalContext: 'Charaka emphasizes that unvitiated Asthi ensures the mechanical integrity essential for general bodily resistance.'
  },
  verification: {
    status: 'verified',
    verificationNotes: 'Source verified with Ashtanga Hridaya Sutra 11/1-5, Charaka Sutra 17, and Sushruta Sutra 15.'
  }
};

export default asthiDhatuData;
