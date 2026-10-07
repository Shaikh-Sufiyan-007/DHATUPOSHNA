
export const dhatuposhanaSeedData = [
  {
    name: 'Ahara Rasa to Rasa Poshana Transformation',
    slug: 'ahara-rasa-to-rasa',
    dhatuSlug: 'rasa',
    previousDhatuSlug: null,
    nextDhatuSlug: 'rakta',
    sanskritName: {
      devanagari: 'आहार रस-रस पोषण प्रक्रिया',
      iast: 'Āhāra Rasa-Rasa Poṣaṇa Prakriyā'
    },
    theoryCategory: 'Sequential Transformation Process',
    precursorSubstance: 'Digested Food Chyme Essence (Ahara Rasa / Prasada Bhaga)',
    classicalAnalogy: {
      metaphor: 'Filtration and Separation of Clear Essence from Gross Slag',
      explanation: 'Just as sugarcane juice is crushed and clarified into liquid syrup while fibers are expelled, gastrointestinal digestion isolates clear nutrient fluid from gross fecal waste.'
    },
    scholarlyInterpretations: [
      {
        authorOrSchool: 'Charaka Samhita (Chakrapanidatta)',
        interpretation: 'Digested food separates in the Mahasrotas into nutrient essence (Prasada) and excretory waste (Kitta). The Prasada fraction is propelled into the heart by Samana and Vyana Vayu, entering circulation as Rasa.',
        timeframeOrDuration: 'Primary digestion occurs within hours; circulation initiates immediately (Ahoratra).'
      },
      {
        authorOrSchool: 'Sushruta Samhita (Dalhana)',
        interpretation: 'Ahara Rasa absorbs from the Amashaya and Pakvashaya through mesenteric vessels and gathers in the heart before systemic propulsion.',
        timeframeOrDuration: 'Continuous influx coinciding with meal digestion intervals.'
      }
    ],
    modernPhysiologicalParallel: 'Gastrointestinal enzymatic hydrolysis of carbohydrates, proteins, and lipids followed by enterocyte absorption into mesenteric venous circulation and thoracic lymphatic duct.',
    sourceAcademicLayer: {
      classicalTerminology: ['Ahara-Parinama', 'Prasada-Kitta Vibhaga', 'Rasavaha Srotomukha'],
      scholarlyExplanation: 'Jatharagni digests ingested food; the subtle Prasada fraction passes into Rasavaha Srotas where Rasagni completes cellular assimilation.',
      referenceSlugs: ['charaka-sutra-28-4', 'charaka-chikitsa-15-15']
    },
    userFriendlyLayer: {
      summary: 'The initial biological process of converting eaten food into clean circulating nutrient plasma.',
      simplifiedExplanation: 'When your digestive system finishes breaking down a meal, it divides the contents into two streams: waste to be expelled, and a pure, nutrient-rich liquid (Ahara Rasa). This liquid travels to your heart and fills your blood vessels, providing instant cellular hydration and raw nutrients to the entire body.',
      keyTakeaways: [
        'Connects the food you eat directly to circulating blood fluids.',
        'Primary digestion creates clean nutrient essence and separates waste.',
        'The heart serves as the central distribution hub for the newly absorbed nutrients.'
      ]
    },
    expertNotes: 'Documented under classical Kriya Sharir doctrine (Charaka Sutra 28 and Chikitsa 15).',
    verification: {
      status: 'verified',
      verificationNotes: 'Source verified with Charaka Sutra 28/4 and Chikitsa 15/15.'
    }
  },
  {
    name: 'Rasa to Rakta Poshana Transformation',
    slug: 'rasa-to-rakta',
    dhatuSlug: 'rakta',
    previousDhatuSlug: 'rasa',
    nextDhatuSlug: 'mamsa',
    sanskritName: {
      devanagari: 'रस-रक्त पोषण प्रक्रिया',
      iast: 'Rasa-Rakta Poṣaṇa Prakriyā'
    },
    theoryCategory: 'Sequential Transformation Process',
    precursorSubstance: 'Poshaka Rasa Dhatu',
    classicalAnalogy: {
      metaphor: 'Irrigation of Fields (Kedari-Kulya) and Dyeing of Clear Cloth (Ranjana)',
      explanation: 'Nutrient plasma flows like clear irrigation water through channels to liver and spleen fields where Ranjaka Pitta acts like natural dye, turning clear liquid into radiant red blood.'
    },
    scholarlyInterpretations: [
      {
        authorOrSchool: 'Charaka Samhita',
        interpretation: 'Rasa continuously transforms into Rakta throughout day and night (Ahoratra) without pause, sustaining blood volume and vital oxygenation dynamically.',
        timeframeOrDuration: 'Continuous circulatory exchange.'
      },
      {
        authorOrSchool: 'Sushruta Samhita',
        interpretation: 'Rasa dwells in its specific tissue matrix for 3015 Kalas (approximately 5 days) before fully differentiating into mature Rakta Dhatu.',
        timeframeOrDuration: '3015 Kalas (~5 days per tissue bed).'
      }
    ],
    modernPhysiologicalParallel: 'Intestinal absorption of iron, folate, and amino acids entering the portal venous circulation, hepatic transit, and subsequent erythropoiesis in bone marrow stimulated by erythropoietin.',
    sourceAcademicLayer: {
      classicalTerminology: ['Ranjaka Pitta Paka', 'Rakta Prasada-Kitta Vibhaga', 'Kandara-Sira Utpatti'],
      scholarlyExplanation: 'Poshaka Rasa enters Raktavaha Srotas where hepatic and splenic enzymes (Ranjaka Pitta + Raktagni) impart coloration (Raga) and vitalizing capacity (Jivana).',
      referenceSlugs: ['charaka-chikitsa-15-15', 'sushruta-sutra-14-10']
    },
    userFriendlyLayer: {
      summary: 'How clear nutrient fluid from food is enriched with color and vitality to become healthy red blood.',
      simplifiedExplanation: 'Once nutrient-rich fluid enters your circulation, it travels through your liver and spleen. Specialized metabolic enzymes enrich this fluid with iron, warmth, and vibrant red coloration, producing fresh blood cells that carry oxygen and energy to keep you awake, energized, and alive.',
      keyTakeaways: [
        'Transforms clear plasma into oxygenating red blood cells.',
        'Liver and spleen are the central metabolic factories for blood formation.',
        'Produces tendons and blood vessels as accessory tissues.'
      ]
    },
    expertNotes: 'Preserves both Charaka continuous cycle and Sushruta discrete duration perspectives.',
    verification: {
      status: 'verified',
      verificationNotes: 'Source verified with Sushruta Sutra 14/10 and Charaka Chikitsa 15/15.'
    }
  },
  {
    name: 'Rakta to Mamsa Poshana Transformation',
    slug: 'rakta-to-mamsa',
    dhatuSlug: 'mamsa',
    previousDhatuSlug: 'rakta',
    nextDhatuSlug: 'meda',
    sanskritName: {
      devanagari: 'रक्त-मांस पोषण प्रक्रिया',
      iast: 'Rakta-Māṁsa Poṣaṇa Prakriyā'
    },
    theoryCategory: 'Sequential Transformation Process',
    precursorSubstance: 'Poshaka Rakta Dhatu',
    classicalAnalogy: {
      metaphor: 'Baking and Hardening of Clay / Plastering of a Wall',
      explanation: 'Liquid blood rich in elemental earth and water is coagulated and solidified by bodily heat (Mamsagni and Vayu), just as soft wet clay is fired into firm durable bricks.'
    },
    scholarlyInterpretations: [
      {
        authorOrSchool: 'Charaka Samhita',
        interpretation: 'Blood delivers amino nutrients through vascular conduits to muscle fibers where local Mamsagni continuously replaces catabolized proteins.',
        timeframeOrDuration: 'Continuous dynamic equilibrium.'
      },
      {
        authorOrSchool: 'Sushruta Samhita',
        interpretation: 'Blood precursor matures over 3015 Kalas (~5 days), consolidating into organized muscle fascicles and supporting the six layers of skin.',
        timeframeOrDuration: '3015 Kalas (~5 days).'
      }
    ],
    modernPhysiologicalParallel: 'Capillary delivery of essential amino acids and oxygen to myocytes, driving myofibrillar protein synthesis (actin and myosin) and muscular repair.',
    sourceAcademicLayer: {
      classicalTerminology: ['Mamsagni Paka', 'Samhanana Nirmana', 'Shat Twacha Utpatti'],
      scholarlyExplanation: 'Mamsagni metabolizes Poshaka Rakta components into contractile myofibrillar bundles, generating Vasa and skin layers as accessory byproducts.',
      referenceSlugs: ['charaka-chikitsa-15-15', 'ashtanga-hridaya-sutra-11-4']
    },
    userFriendlyLayer: {
      summary: 'How blood nutrients are converted into firm, strong muscle tissue to support movement and posture.',
      simplifiedExplanation: 'Your blood delivers protein and oxygen directly into your muscle beds. Tissue enzymes weave these liquid nutrients into solid, flexible muscle fibers that wrap around your bones, power your movements, and rebuild the protective layers of your skin.',
      keyTakeaways: [
        'Converts liquid blood nutrients into solid muscle tissue.',
        'Forms natural muscle lubricating fat (Vasa) and healthy skin layers.',
        'Provides bodily strength, protective contour, and locomotion.'
      ]
    },
    expertNotes: 'Classical foundation for muscle anabolism and tissue maintenance.',
    verification: {
      status: 'verified',
      verificationNotes: 'Source verified with Charaka Chikitsa 15 and Ashtanga Hridaya Sutra 11.'
    }
  },
  {
    name: 'Mamsa to Meda Poshana Transformation',
    slug: 'mamsa-to-meda',
    dhatuSlug: 'meda',
    previousDhatuSlug: 'mamsa',
    nextDhatuSlug: 'asthi',
    sanskritName: {
      devanagari: 'मांस-मेद पोषण प्रक्रिया',
      iast: 'Māṁsa-Meda Poṣaṇa Prakriyā'
    },
    theoryCategory: 'Sequential Transformation Process',
    precursorSubstance: 'Poshaka Mamsa Dhatu',
    classicalAnalogy: {
      metaphor: 'Condensation of Ghee / Separation of Oil from Paste',
      explanation: 'Under gentle metabolic heating, pure unctuous lipid essence filters out from rich muscle tissue, gathering in adipose depots.'
    },
    scholarlyInterpretations: [
      {
        authorOrSchool: 'Charaka Samhita',
        interpretation: 'Muscle tissue yields unctuous precursors that are conducted into Medovaha Srotas (kidneys and omentum) to replenish adipose cushioning.',
        timeframeOrDuration: 'Balanced by dietary intake and physical movement.'
      },
      {
        authorOrSchool: 'Sushruta Samhita',
        interpretation: 'Transits through an additional 3015 Kalas (~5 days), maturing into structural fat and yielding sweat as metabolic waste.',
        timeframeOrDuration: '3015 Kalas (~5 days).'
      }
    ],
    modernPhysiologicalParallel: 'Conversion of excess circulating macronutrients into triglycerides and storage within white adipose tissue, coupled with adipokine endocrine signaling.',
    sourceAcademicLayer: {
      classicalTerminology: ['Medogni Paka', 'Sveda Vibhaga', 'Snayu Nirmana'],
      scholarlyExplanation: 'Medogni transforms lipid precursors into storage adipose, synthesizes fibrous ligaments (Snayu), and excretes sweat (Sveda).',
      referenceSlugs: ['charaka-chikitsa-15-15', 'charaka-sutra-21']
    },
    userFriendlyLayer: {
      summary: 'The conversion of muscle-derived nutrients into protective fat tissue and durable joint ligaments.',
      simplifiedExplanation: 'Nutrients passing through muscle tissue are refined into smooth, protective body fat that cushions vital organs like the kidneys and abdomen. This step also constructs tough ligaments that stabilize your joints and produces sweat to keep your body cool.',
      keyTakeaways: [
        'Creates healthy adipose reserves for organ protection and internal lubrication.',
        'Builds joint-stabilizing ligaments (Snayu).',
        'Produces sweat (Sveda) for natural body temperature control.'
      ]
    },
    expertNotes: 'Central metabolic stage governing weight balance, metabolic health, and joint integrity.',
    verification: {
      status: 'verified',
      verificationNotes: 'Source verified with Charaka Sutra 21 and Chikitsa 15.'
    }
  },
  {
    name: 'Meda to Asthi Poshana Transformation',
    slug: 'meda-to-asthi',
    dhatuSlug: 'asthi',
    previousDhatuSlug: 'meda',
    nextDhatuSlug: 'majja',
    sanskritName: {
      devanagari: 'मेद-अस्थि पोषण प्रक्रिया',
      iast: 'Meda-Asthi Poṣaṇa Prakriyā'
    },
    theoryCategory: 'Sequential Transformation Process',
    precursorSubstance: 'Poshaka Meda Dhatu',
    classicalAnalogy: {
      metaphor: 'Baking Pottery in a Kiln / Calcification of Minerals',
      explanation: 'Intense metabolic heat (Asthyagni) and cosmic wind (Vayu) dry and harden fatty nutrient precursors into rigid osseous bone, carving internal porous tunnels.'
    },
    scholarlyInterpretations: [
      {
        authorOrSchool: 'Charaka Samhita',
        interpretation: 'Vayu and Tejas act on nutrient lipids, precipitating dense mineralized bone while pushing waste out as hair and nails.',
        timeframeOrDuration: 'Slower physiological turnover than soft tissues.'
      },
      {
        authorOrSchool: 'Sushruta Samhita',
        interpretation: 'Requires 3015 Kalas (~5 days) to consolidate calcified osseous matrix and hollow out medullary chambers.',
        timeframeOrDuration: '3015 Kalas (~5 days).'
      }
    ],
    modernPhysiologicalParallel: 'Osteoblastic bone formation, hydroxyapatite mineralization of osteoid collagen matrix, and remodeling regulated by parathyroid hormone and Vitamin D.',
    sourceAcademicLayer: {
      classicalTerminology: ['Asthyagni Paka', 'Sushiratva Nirmana', 'Nakha-Kesha Vibhaga'],
      scholarlyExplanation: 'Asthyagni processes nutrient lipids, solidifying them into load-bearing bone and teeth, while depositing keratinized waste as nails and hair.',
      referenceSlugs: ['charaka-chikitsa-15-15', 'ashtanga-hridaya-sutra-11-4']
    },
    userFriendlyLayer: {
      summary: 'How fat-soluble nutrients and minerals are hardened into rock-solid bones, teeth, hair, and nails.',
      simplifiedExplanation: 'Deep inside your skeletal channels, special bone-building enzymes take mineral nutrients from your body fats and bake them into hard, resilient bones that hold you upright. Teeth develop as an accessory tissue, while hair and nails grow outward as natural byproducts.',
      keyTakeaways: [
        'Hardens nutrient minerals into structural bone tissue.',
        'Develops teeth (Danta) as strong calcified accessory structures.',
        'Produces hair and nails as natural metabolic wastes.'
      ]
    },
    expertNotes: 'Explains the unique inverted Vata-Asthi relationship where excess dryness depletes bone density.',
    verification: {
      status: 'verified',
      verificationNotes: 'Source verified with Charaka Chikitsa 15 and Sushruta Sutra 15.'
    }
  },
  {
    name: 'Asthi to Majja Poshana Transformation',
    slug: 'asthi-to-majja',
    dhatuSlug: 'majja',
    previousDhatuSlug: 'asthi',
    nextDhatuSlug: 'shukra',
    sanskritName: {
      devanagari: 'अस्थि-मज्जा पोषण प्रक्रिया',
      iast: 'Asthi-Majjā Poṣaṇa Prakriyā'
    },
    theoryCategory: 'Sequential Transformation Process',
    precursorSubstance: 'Poshaka Asthi Dhatu',
    classicalAnalogy: {
      metaphor: 'Water Filtering into Underground Caverns',
      explanation: 'Nutrient essence flows through porous channels of bones, settling into central hollow chambers to create rich, soft, life-sustaining marrow.'
    },
    scholarlyInterpretations: [
      {
        authorOrSchool: 'Charaka Samhita',
        interpretation: 'Nutrients pass through porous bone micro-channels into the central cavity where Majjagni synthesizes fatty marrow and neural substance.',
        timeframeOrDuration: 'Continuous medullary turnover.'
      },
      {
        authorOrSchool: 'Sushruta Samhita',
        interpretation: 'Consolidates over 3015 Kalas (~5 days), nourishing both long bone marrow and the cranial encephalon (Mastulunga).',
        timeframeOrDuration: '3015 Kalas (~5 days).'
      }
    ],
    modernPhysiologicalParallel: 'Nutrient delivery through Haversian and nutrient canals to medullary sinuses, sustaining hematopoietic stem cell niches and neural myelin homeostasis.',
    sourceAcademicLayer: {
      classicalTerminology: ['Majjagni Paka', 'Asthi-Purana', 'Mastulunga Poshana'],
      scholarlyExplanation: 'Majjagni transforms mineral-protected precursors into hematopoietic bone marrow, brain tissue, and neural lipid sheaths.',
      referenceSlugs: ['charaka-chikitsa-15-15', 'ashtanga-hridaya-sutra-11-4']
    },
    userFriendlyLayer: {
      summary: 'The creation of nourishing bone marrow and brain tissue inside the protective cavities of your skeleton.',
      simplifiedExplanation: 'Inside the secure, hollow chambers of your bones, rich nutrients settle to form soft bone marrow and nourish your nervous system. This tissue gives your eyes sparkle, keeps your nerves calm, and prepares the ultra-pure raw materials needed to generate reproductive vitality.',
      keyTakeaways: [
        'Fills hollow bone cavities with nourishing marrow.',
        'Sustains the brain, nervous system, and sensory lucidity.',
        'Prepares the direct precursor for reproductive essence.'
      ]
    },
    expertNotes: 'Connects skeletal integrity directly with neurological stamina and reproductive health.',
    verification: {
      status: 'verified',
      verificationNotes: 'Source verified with Charaka Chikitsa 15 and Sushruta Sharira 4.'
    }
  },
  {
    name: 'Majja to Shukra Poshana Transformation',
    slug: 'majja-to-shukra',
    dhatuSlug: 'shukra',
    previousDhatuSlug: 'majja',
    nextDhatuSlug: null,
    sanskritName: {
      devanagari: 'मज्जा-शुक्र पोषण प्रक्रिया',
      iast: 'Majjā-Śukra Poṣaṇa Prakriyā'
    },
    theoryCategory: 'Sequential Transformation Process',
    precursorSubstance: 'Poshaka Majja Dhatu',
    classicalAnalogy: {
      metaphor: 'Churning Milk into Butter / Extracting Essential Oil from Seeds',
      explanation: 'Just as thousands of drops of milk yield a single ounce of golden butter through persistent churning, thirty days of biological refining distill the ultimate generative seed from bone marrow.'
    },
    scholarlyInterpretations: [
      {
        authorOrSchool: 'Charaka Samhita',
        interpretation: 'Shukra pervades every living cell like ghee hidden in fresh milk, expressing outwardly through sexual tissues and inwardly distilling into supreme Ojas.',
        timeframeOrDuration: 'Omnipresent and continuously distilled.'
      },
      {
        authorOrSchool: 'Sushruta Samhita',
        interpretation: 'Final stage of thirty days of sequential metabolic distillation (3015 Kalas in the final tissue bed, completing ~30-31 days total).',
        timeframeOrDuration: 'Culmination of ~30 days total transformation cycle.'
      }
    ],
    modernPhysiologicalParallel: 'Final stages of spermatogenesis in seminiferous tubules, oocyte maturation, sex steroid hormone synthesis, and neuro-endocrine immune vitality axis.',
    sourceAcademicLayer: {
      classicalTerminology: ['Shukragni Paka', 'Ojas Utpatti', 'Sarva-Sharira Vyapitva'],
      scholarlyExplanation: 'Shukragni conducts the ultimate cellular distillation, generating fertile reproductive seed and culminating in the supreme essence of immunity (Ojas).',
      referenceSlugs: ['charaka-chikitsa-15-15', 'charaka-sutra-17-74', 'sushruta-sutra-14-10']
    },
    userFriendlyLayer: {
      summary: 'The ultimate stage of metabolism: creating fertile reproductive seeds and supreme natural immunity (Ojas).',
      simplifiedExplanation: 'After a month-long journey of purification through all your bodily tissues, the finest biological essence reaches its pinnacle. Here, Shukragni creates fertile reproductive cells capable of conceiving new life, while distilling Ojas—the radiant shield that fuels your immune resistance, confidence, and vibrant longevity.',
      keyTakeaways: [
        'The final, most refined product of your entire metabolism.',
        'Creates fertile sperm and ova for healthy procreation.',
        'Distills Ojas, the body\'s supreme shield of immunity and vibrant vitality.'
      ]
    },
    expertNotes: 'Core biological rationale behind classical Rasayana and Vajikarana medical sciences.',
    verification: {
      status: 'verified',
      verificationNotes: 'Source verified with Charaka Sutra 17/74-75, Sushruta Sutra 14/10, and Ashtanga Hridaya Sutra 11/1-5.'
    }
  }
];

export default dhatuposhanaSeedData;
