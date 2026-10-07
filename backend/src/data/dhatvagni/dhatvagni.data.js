
export const dhatvagniSeedData = [
  {
    name: 'Rasagni',
    slug: 'rasagni',
    dhatuSlug: 'rasa',
    sanskritName: {
      devanagari: 'रसाग्नि',
      iast: 'Rasāgni'
    },
    location: 'Hridaya, Dasha Dhamanis, and Rasavaha Srotas (Microvascular/interstitial interface)',
    functions: [
      {
        term: 'Poshana Paka',
        description: 'Digestive bio-transformation of digested food essence into mature plasma nutrients.'
      },
      {
        term: 'Dvidha Vibhajana',
        description: 'Separation of metabolic products into nutrient essence (Prasada) and waste (Kitta).'
      }
    ],
    metabolicFractions: {
      prasadaBhaga: {
        nourishesSelf: 'Maintains circulating volume, viscosity, and nutrient carrying capacity of Rasa Dhatu.',
        seedsNextDhatu: 'Yields the subtle nutrient fraction (Poshaka Rakta) that is routed to liver/spleen for Rakta formation.',
        upadhatusFormed: ['Stanya (Maternal Milk in lactating females)', 'Artava (Menstrual fluid in reproductive age females)']
      },
      kittaBhaga: {
        wasteProduced: 'Posha Kapha / Mala Kapha',
        description: 'Primary metabolic mucus and moisture lubricating the respiratory and gastrointestinal tract.'
      }
    },
    sourceAcademicLayer: {
      classicalTerminology: ['Rasagni Paka', 'Prasada-Kitta Vibhaga', 'Ahara-Rasa Parinama'],
      scholarlyExplanation: 'Rasagni operates in the Rasavaha Srotas, converting Ahara Rasa into Sthayi Rasa, Upadhatus (Stanya/Artava), and seeding Poshaka Rakta.',
      referenceSlugs: ['charaka-chikitsa-15-15', 'charaka-sutra-28-4']
    },
    userFriendlyLayer: {
      summary: 'Rasagni is the metabolic fire that transforms digested food nutrients into circulating plasma and lymph.',
      simplifiedExplanation: 'Think of Rasagni as cellular enzymatic converters inside your blood and lymph vessels. Once food is digested in the stomach, Rasagni processes the raw nutrients into clean bodily fluids that nourish every cell, produce breast milk during lactation, and generate natural protective mucus.',
      keyTakeaways: [
        'First internal tissue fire in the 7-stage metabolic sequence.',
        'Turns digested food into nutrient-rich plasma fluid.',
        'Produces maternal milk (Stanya) and natural protective mucus (Kapha) as byproducts.'
      ]
    },
    clinicalRelevance: {
      mandagniEffects: 'Low Rasagni causes poor nutrient assimilation, sluggish lymph flow, fatigue, and heaviness (Ama accumulation).',
      tikshnagniEffects: 'Excessive Rasagni depletes fluid volume quickly, causing dehydration, dry skin, and thirst.'
    },
    expertNotes: 'Documented based on classical Kriya Sharir doctrine (Charaka Chikitsa 15).',
    verification: {
      status: 'verified',
      verificationNotes: 'Source verified with Charaka Chikitsa 15/15 and Ayurveda Dipika commentary.'
    }
  },
  {
    name: 'Raktagni',
    slug: 'raktagni',
    dhatuSlug: 'rakta',
    sanskritName: {
      devanagari: 'रक्ताग्नि',
      iast: 'Raktāgni'
    },
    location: 'Yakrit (Liver), Pliha (Spleen), and Raktavaha Srotas (Hepato-splenic microcirculation)',
    functions: [
      {
        term: 'Ranjana Paka',
        description: 'Enzymatic pigmentary synthesis and iron assimilation converting clear plasma precursor into hemoglobin-rich red blood.'
      },
      {
        term: 'Jivana Prasadana',
        description: 'Imparting vitality, oxygenation capacity, and life-supporting qualities to circulating cells.'
      }
    ],
    metabolicFractions: {
      prasadaBhaga: {
        nourishesSelf: 'Maintains erythrocyte integrity, oxygen-carrying capacity, and whole blood volume.',
        seedsNextDhatu: 'Yields the protein-dense nutrient fraction (Poshaka Mamsa) destined for muscle synthesis.',
        upadhatusFormed: ['Kandara (Large Tendons / Tendinous Cords)', 'Sira (Vascular Conduits)']
      },
      kittaBhaga: {
        wasteProduced: 'Pitta Mala (Metabolic Bile Waste)',
        description: 'Excretory bile pigments eliminated via hepatic biliary secretions into the gut.'
      }
    },
    sourceAcademicLayer: {
      classicalTerminology: ['Ranjaka Pitta Paka', 'Rakta Prasada-Kitta Vibhaga', 'Kandara-Sira Utpatti'],
      scholarlyExplanation: 'Raktagni functions in synchrony with Ranjaka Pitta in the liver and spleen to oxygenate and pigment Poshaka Rasa into mature erythrocytes.',
      referenceSlugs: ['charaka-chikitsa-15-15', 'sushruta-sutra-14-10']
    },
    userFriendlyLayer: {
      summary: 'Raktagni is the metabolic fire that transforms plasma nutrients into red blood cells, tendons, and blood vessels.',
      simplifiedExplanation: 'Operating primarily inside your liver and spleen, Raktagni enriches clear bodily fluids with iron, warmth, and vibrant color. This process produces fresh red blood cells to oxygenate your tissues, builds strong tendons and blood vessels, and filters metabolic bile into your digestive tract.',
      keyTakeaways: [
        'Second tissue fire, localized in liver and spleen.',
        'Transforms clear plasma into oxygenating red blood cells.',
        'Builds tendons (Kandara) and vascular walls (Sira).'
      ]
    },
    clinicalRelevance: {
      mandagniEffects: 'Low Raktagni leads to anemia, poor oxygenation, pallor, cold extremities, and flaccid blood vessels.',
      tikshnagniEffects: 'Excessive Raktagni causes acute vascular inflammation, bleeding diathesis (Raktapitta), hypertension, and skin erythema.'
    },
    expertNotes: 'Directly linked with Ranjaka Pitta activity in classical physiology.',
    verification: {
      status: 'verified',
      verificationNotes: 'Source verified with Charaka Chikitsa 15/15 and Sushruta Sutra 14/10.'
    }
  },
  {
    name: 'Mamsagni',
    slug: 'mamsagni',
    dhatuSlug: 'mamsa',
    sanskritName: {
      devanagari: 'मांसाग्नि',
      iast: 'Māṁsāgni'
    },
    location: 'Somatic muscular tissues, peripheral myofibrillar channels, and Mamsavaha Srotas',
    functions: [
      {
        term: 'Samhanana Paka',
        description: 'Solidification and structural condensation of blood precursors into contractile muscle protein fibers.'
      },
      {
        term: 'Lepana Siddhi',
        description: 'Ensuring muscle tissue adequately envelopes bones and cushions vital internal visceral organs.'
      }
    ],
    metabolicFractions: {
      prasadaBhaga: {
        nourishesSelf: 'Maintains tone, mass, and contractile stamina of skeletal and smooth musculature.',
        seedsNextDhatu: 'Yields the unctuous lipid precursor fraction (Poshaka Meda) for adipose tissue.',
        upadhatusFormed: ['Vasa (Intramuscular/interstitial fat)', 'Shat Twacha (The six cutaneous skin layers)']
      },
      kittaBhaga: {
        wasteProduced: 'Kha-Mala (External Orifice Wastes)',
        description: 'Waxy, oily debris accumulating in external body openings (ears, nose, skin pores).'
      }
    },
    sourceAcademicLayer: {
      classicalTerminology: ['Mamsagni Parinama', 'Twak Parinama', 'Peshi Dharana'],
      scholarlyExplanation: 'Mamsagni metabolizes amino acids and iron-rich blood nutrients with Prithvi and Tejas, producing muscular bulk and dermatological layers.',
      referenceSlugs: ['charaka-chikitsa-15-15', 'ashtanga-hridaya-sutra-11-4']
    },
    userFriendlyLayer: {
      summary: 'Mamsagni is the muscle-building metabolic fire that converts blood nutrients into firm muscle tissue and protective skin layers.',
      simplifiedExplanation: 'Mamsagni takes the rich nutrients brought by your blood and weaves them into strong, contractile muscle fibers that cushion your skeleton and allow movement. It also produces natural muscle fat (Vasa) and supports the healthy regeneration of your skin layers.',
      keyTakeaways: [
        'Third tissue fire, responsible for muscle protein synthesis.',
        'Constructs the six anatomical layers of the skin (Shat Twacha).',
        'Expels minor wastes through external orifices (Kha-mala).'
      ]
    },
    clinicalRelevance: {
      mandagniEffects: 'Low Mamsagni causes muscle flaccidity, sarcopenia, loss of tone, and accumulation of sluggish tissue masses (Arbuda).',
      tikshnagniEffects: 'Excessive Mamsagni causes rapid muscular catabolism, wasting, burning sensations, and inflammatory myositis.'
    },
    expertNotes: 'Essential for understanding muscular hypertrophy vs cachexia in classical medicine.',
    verification: {
      status: 'verified',
      verificationNotes: 'Source verified with Charaka Chikitsa 15 and Ashtanga Hridaya Sutra 11.'
    }
  },
  {
    name: 'Medogni',
    slug: 'medogni',
    dhatuSlug: 'meda',
    sanskritName: {
      devanagari: 'मेदोऽग्नि',
      iast: 'Medo\'gni'
    },
    location: 'Udara (Abdomen), Vrikka (Perirenal beds), Vapavahana (Omentum), and Medovaha Srotas',
    functions: [
      {
        term: 'Snehana Paka',
        description: 'Synthesis of dense unctuous lipid molecules for systemic insulation, cushioning, and endocrine support.'
      },
      {
        term: 'Sveda Utpatti',
        description: 'Regulation and generation of perspiration as a primary vehicle for thermo-balance and metabolic excretion.'
      }
    ],
    metabolicFractions: {
      prasadaBhaga: {
        nourishesSelf: 'Maintains healthy adipose reserves, organ cushioning, and joint lubrication.',
        seedsNextDhatu: 'Yields dense mineral-rich precursors (Poshaka Asthi) needed for bone calcification.',
        upadhatusFormed: ['Snayu (Ligaments and fibrous joint capsules)', 'Sandhi-Bandhana (Articular connective tissue)']
      },
      kittaBhaga: {
        wasteProduced: 'Sveda (Perspiration / Sweat)',
        description: 'Aqueous and electrolyte waste eliminated through sweat glands.'
      }
    },
    sourceAcademicLayer: {
      classicalTerminology: ['Medagni Paka', 'Sveda Vibhaga', 'Snayu Utpatti'],
      scholarlyExplanation: 'Medogni governs lipid homeostasis. Its proper functioning prevents both lipodystrophy and obesity, while yielding strong fibrous ligaments.',
      referenceSlugs: ['charaka-chikitsa-15-15', 'charaka-sutra-21']
    },
    userFriendlyLayer: {
      summary: 'Medogni is the lipid metabolic fire that regulates body fat, sweat production, and strong joint ligaments.',
      simplifiedExplanation: 'Medogni acts as your internal lipid manager. It ensures your body has just the right amount of protective fat to cushion vital organs like kidneys, regulates sweat to keep you cool, and builds tough ligaments (Snayu) that keep your joints stable.',
      keyTakeaways: [
        'Fourth tissue fire, governing fat metabolism and body insulation.',
        'Generates sweat (Sveda) to regulate temperature and excrete waste.',
        'Constructs strong ligaments and joint capsules (Snayu).'
      ]
    },
    clinicalRelevance: {
      mandagniEffects: 'Low Medogni results in uncontrolled fat accumulation (Sthaulya / obesity), metabolic syndrome, dyslipidemia, and heavy sweating.',
      tikshnagniEffects: 'Excessive Medogni burns off fat reserves rapidly, leading to dry cracking joints (Sandhishunyata), emaciation, and fatigue.'
    },
    expertNotes: 'Central metabolic focus in the management of Prameha (diabetes) and Sthaulya (obesity).',
    verification: {
      status: 'verified',
      verificationNotes: 'Source verified with Charaka Chikitsa 15 and Charaka Sutra 21.'
    }
  },
  {
    name: 'Asthyagni',
    slug: 'asthyagni',
    dhatuSlug: 'asthi',
    sanskritName: {
      devanagari: 'अस्थ्यग्नि',
      iast: 'Asthyagni'
    },
    location: 'Periosteal vascular interface, osseous canals (Haversian systems), and Asthivaha Srotas',
    functions: [
      {
        term: 'Kathinikarana Paka',
        description: 'Bio-calcification and mineral crystallization consolidating soft lipid precursors into rigid structural bone.'
      },
      {
        term: 'Sushiratva Nirmana',
        description: 'Vayu-mediated formation of internal microscopic porosity and medullary lumens for housing marrow.'
      }
    ],
    metabolicFractions: {
      prasadaBhaga: {
        nourishesSelf: 'Maintains bone mineral density, cortical thickness, and tensile skeletal strength.',
        seedsNextDhatu: 'Yields lipid-rich nutrient fractions (Poshaka Majja) that sink into medullary bone cavities.',
        upadhatusFormed: ['Danta (Teeth - calcified masticatory structures)']
      },
      kittaBhaga: {
        wasteProduced: 'Kesha (Hair), Loma (Body Hair), and Nakha (Nails)',
        description: 'Cornified and keratinized appendages extruded outward as bone metabolic byproducts.'
      }
    },
    sourceAcademicLayer: {
      classicalTerminology: ['Asthyagni Paka', 'Kharatva Nirmana', 'Nakha-Kesha Utpatti'],
      scholarlyExplanation: 'Asthyagni processes nutrient lipids from Meda, utilizing Prithvi and Tejas to mineralize bone while depositing keratinized waste as nails and hair.',
      referenceSlugs: ['charaka-chikitsa-15-15', 'ashtanga-hridaya-sutra-11-4']
    },
    userFriendlyLayer: {
      summary: 'Asthyagni is the bone-forming metabolic fire that hardens nutrients into strong bones, teeth, hair, and nails.',
      simplifiedExplanation: 'Asthyagni acts like a master mineral kiln inside your bones. It takes nutrients from healthy body fats and crystallizes them into dense, rock-solid bones and teeth to support your weight, while pushing out keratin wastes as your hair and nails.',
      keyTakeaways: [
        'Fifth tissue fire, responsible for bone mineralization and density.',
        'Forms teeth (Danta) as an accessory supportive tissue.',
        'Produces hair and nails as natural metabolic byproducts (Malas).'
      ]
    },
    clinicalRelevance: {
      mandagniEffects: 'Low Asthyagni results in defective calcification, soft bones, brittle nails, dental caries, and hair loss.',
      tikshnagniEffects: 'Excessive Asthyagni causes abnormal bony growths, bone spurs (Adhyasthi), extra teeth, and deep osseous burning aches.'
    },
    expertNotes: 'Crucial for clinical strategies addressing osteopenia, osteoporosis, and dental decay.',
    verification: {
      status: 'verified',
      verificationNotes: 'Source verified with Charaka Chikitsa 15 and Sushruta Sutra 15.'
    }
  },
  {
    name: 'Majjagni',
    slug: 'majjagni',
    dhatuSlug: 'majja',
    sanskritName: {
      devanagari: 'मज्जाग्नि',
      iast: 'Majjāgni'
    },
    location: 'Internal medullary canal of long bones, cancellous marrow spaces, and neuro-axial channels',
    functions: [
      {
        term: 'Purana Paka',
        description: 'Metabolic synthesis of high-density unctuous lipids and hematopoietic cells filling internal bone spaces.'
      },
      {
        term: 'Mastulunga Poshana',
        description: 'Nourishment of neuro-axial parenchyma, brain tissue, and myelinated neural sheaths.'
      }
    ],
    metabolicFractions: {
      prasadaBhaga: {
        nourishesSelf: 'Maintains marrow cellularity, neurological transmission, and deep unctuous joint lubrication.',
        seedsNextDhatu: 'Yields the ultra-refined generative precursor (Poshaka Shukra) destined for reproduction.',
        upadhatusFormed: ['Kesha-Snigdhatva (Deep unctuous sheen and softness of hair)']
      },
      kittaBhaga: {
        wasteProduced: 'Netra-Vit-Tvak Sneha (Unctuous Secretions)',
        description: 'Oily rheum in the corners of eyes, unctuous film on healthy stool, and facial sebum.'
      }
    },
    sourceAcademicLayer: {
      classicalTerminology: ['Majjagni Parinama', 'Asthi-Purana', 'Shukra-Bija Srijana'],
      scholarlyExplanation: 'Majjagni operates at the interface of osseous and neural metabolism, synthesizing bone marrow and refining precursors for reproductive essence.',
      referenceSlugs: ['charaka-chikitsa-15-15', 'ashtanga-hridaya-sutra-11-4']
    },
    userFriendlyLayer: {
      summary: 'Majjagni is the deep metabolic fire that creates rich bone marrow, protects your nervous system, and prepares reproductive nutrients.',
      simplifiedExplanation: 'Inside the protected chambers of your bones, Majjagni produces nourishing bone marrow and supports your brain and nerves. It keeps your eyes bright, provides deep mental calmness, and distills the ultra-pure nutrients needed to create reproductive seeds.',
      keyTakeaways: [
        'Sixth tissue fire, located inside bone cavities and the nervous system.',
        'Maintains bone marrow, brain tissue, and nerve transmission.',
        'Distills the immediate precursor for reproductive tissue (Shukra).'
      ]
    },
    clinicalRelevance: {
      mandagniEffects: 'Low Majjagni leads to sluggish nerve conduction, bone hollowness sensation (Asthisaushirya), visual blurriness, and joint crepitus.',
      tikshnagniEffects: 'Excessive Majjagni causes deep neurological burning, insomnia, hyper-excitability, and marrow depletion.'
    },
    expertNotes: 'Represents the vital metabolic bridge connecting hematopoiesis, neuroscience, and reproductive vigor.',
    verification: {
      status: 'verified',
      verificationNotes: 'Source verified with Charaka Chikitsa 15 and Charaka Vimana 8.'
    }
  },
  {
    name: 'Shukragni',
    slug: 'shukragni',
    dhatuSlug: 'shukra',
    sanskritName: {
      devanagari: 'शुक्राग्नि',
      iast: 'Śukrāgni'
    },
    location: 'Omnipresent cellular matrix (Sarva-Sharira) with concentrated functional locus in reproductive organs',
    functions: [
      {
        term: 'Bijotpadana Paka',
        description: 'Synthesis, maturation, and motility maturation of reproductive germ cells (spermatozoa and ova).'
      },
      {
        term: 'Ojas Parinama',
        description: 'Distillation of the supreme immune and vital essence (Ojas) from perfected tissue metabolism.'
      }
    ],
    metabolicFractions: {
      prasadaBhaga: {
        nourishesSelf: 'Maintains fertile, viable reproductive fluid (Shukra) and universal psychological vitality.',
        seedsNextDhatu: 'Distills into Ojas (Supreme Vital Essence / Immune Reserve).',
        upadhatusFormed: ['Ojas (Supreme Vitality / Immunity Essence)']
      },
      kittaBhaga: {
        wasteProduced: 'Nirmala (No Gross Excretory Waste)',
        description: 'Classical authorities state Shukragni produces no gross mala; subtle smegma is glandular.'
      }
    },
    sourceAcademicLayer: {
      classicalTerminology: ['Shukragni Paka', 'Ojas Utpatti', 'Nirmala Siddhi'],
      scholarlyExplanation: 'Shukragni represents the zenith of human bio-transformation. Because its raw material has been filtered across six prior fires, its transformation produces pure essence (Ojas) without gross waste.',
      referenceSlugs: ['charaka-chikitsa-15-15', 'charaka-sutra-17-74']
    },
    userFriendlyLayer: {
      summary: 'Shukragni is the ultimate metabolic fire that creates fertile reproductive cells and distills supreme natural immunity (Ojas).',
      simplifiedExplanation: 'Shukragni is the crown jewel of your metabolism. After nutrients have been purified through all six previous metabolic fires, Shukragni crafts the most precious fluids in the human body: fertile reproductive seed for creating new life, and Ojas—the radiant biological essence that powers your immune defense, courage, and long-term vitality.',
      keyTakeaways: [
        'Seventh and final tissue fire in the metabolic transformation hierarchy.',
        'Creates fertile sperm and ova for reproduction.',
        'Distills Ojas, the body\'s supreme shield of immunity and glowing health.',
        'Produces no gross waste products (Nirmala).'
      ]
    },
    clinicalRelevance: {
      mandagniEffects: 'Low Shukragni causes oligospermia, poor sperm motility, erectile dysfunction, loss of libido, and impaired immunity.',
      tikshnagniEffects: 'Excessive Shukragni causes hyperactive sexual desire, burning ejaculation, priapism, and rapid seminal exhaustion.'
    },
    expertNotes: 'The foundational concept behind Rasayana (rejuvenation) and Vajikarana (reproductive health) therapies.',
    verification: {
      status: 'verified',
      verificationNotes: 'Source verified with Charaka Chikitsa 15/15 and Charaka Sutra 17/74-75.'
    }
  }
];

export default dhatvagniSeedData;
