
export const conceptsSeedData = [
  {
    name: 'Tridosha Framework',
    slug: 'tridosha',
    category: 'Tridosha',
    sanskritName: {
      devanagari: 'त्रिदोष',
      iast: 'Tridoṣa',
      etymology: 'Dushyanti iti Doshah (that which is capable of causing imbalance when vitiated, and maintaining equilibrium when balanced).'
    },
    definition: 'The three fundamental psycho-physiological bio-energies—Vata, Pitta, and Kapha—governing all catabolic, metabolic, and anabolic operations in the human body.',
    description: 'The Tridosha theory forms the primary physiological framework of Ayurveda. Derived from the Pancha Mahabhutas, they animate physical tissues (Dhatus) and regulate waste elimination (Malas). Equilibrium of Doshas represents health (Arogya), whereas disequilibrium precipitates pathology (Roga).',
    characteristics: [
      'Constitutes all biological movements, biotransformations, and structural growth.',
      'Operates across circadian, seasonal, and lifespan chronobiological rhythms.',
      'Exhibits Ashraya-Ashrayi Bhava (inseparable reciprocal relationship) with the Sapta Dhatus.'
    ],
    functions: [
      {
        term: 'Sarva-Sharira Niyantrana',
        meaning: 'Systemic Regulation',
        description: 'Vata regulates neural impulses and kinetics; Pitta governs thermogenesis and enzymatic breakdown; Kapha maintains structural coherence and fluid lubrication.'
      }
    ],
    relationshipToDhatus: 'Doshas reside within specific Dhatus through Ashraya-Ashrayi Bhava: Vata resides in Asthi; Pitta resides in Rakta and Sveda; Kapha resides in Rasa, Mamsa, Meda, Majja, and Shukra. Imbalances in Doshas directly affect their host tissue beds.',
    modernPhysiologicalPerspective: 'Neural kinetics and autonomic communication (Vata), neuro-endocrine and enzymatic metabolic reactions (Pitta), and cellular anabolism, extracellular matrix, and mucosal barrier immunity (Kapha).',
    referenceSlugs: ['charaka-sutra-1-57', 'ashtanga-hridaya-sutra-11-1'],
    learnerSummary: {
      simplifiedExplanation: 'The Three Doshas are the body\'s master biological managers: Vata runs movement and communication, Pitta oversees metabolism and digestion, and Kapha provides structure, stability, and moisture.',
      keyPoints: [
        'Vata = Movement & Nerve signals (Air + Space).',
        'Pitta = Heat, Digestion & Chemical transformation (Fire + Water).',
        'Kapha = Structure, Lubrication & Stability (Water + Earth).',
        'Reside inside specific tissues and directly influence tissue health.'
      ]
    },
    educationalSafetyNotice: 'This overview is for classical physiological study and does not substitute for clinical medical evaluation.'
  },
  {
    name: 'Vata Dosha',
    slug: 'vata-dosha',
    category: 'Tridosha',
    sanskritName: {
      devanagari: 'वात दोष',
      iast: 'Vāta Doṣa',
      etymology: 'Va gati-gandhanayoḥ (that which moves, propels, and conveys sensation).'
    },
    definition: 'The primary kinetic bio-energy composed of Vayu (Air) and Akasha (Space) Mahabhutas.',
    description: 'Vata is the commander of all bodily processes. Without Vata, Pitta, Kapha, Dhatus, and Malas are immobile (Pangu). It governs nerve conduction, respiration, circulation, sensory perception, and voluntary locomotion.',
    characteristics: [
      'Ruksha (Dry)',
      'Laghu (Light)',
      'Sheeta (Cold)',
      'Khara (Rough)',
      'Sukshma (Subtle)',
      'Chala (Mobile)'
    ],
    functions: [
      {
        term: 'Utsaha & Nispanda',
        meaning: 'Enthusiasm and Motor Initiation',
        description: 'Initiates motor action, controls speech, sustains respiration, and propels nutrient streams through vascular channels.'
      }
    ],
    relationshipToDhatus: 'Resides inside Asthi Dhatu through a unique inverted Ashraya-Ashrayi relationship: treatments that reduce Vata nourish Asthi, while Vata aggravation leads to osteoporotic bone hollows (Asthisaushirya).',
    modernPhysiologicalPerspective: 'Central, peripheral, and autonomic nervous system activity, cardiac pacemaker kinetics, and bowel peristalsis.',
    referenceSlugs: ['charaka-sutra-1-57'],
    learnerSummary: {
      simplifiedExplanation: 'Vata is the energy of movement and nerve impulse. It directs circulation, breathing, and thinking, and resides deeply within your bones.',
      keyPoints: [
        'Governs all biological movement and nerve signals.',
        'Cold, light, dry, and mobile in nature.',
        'Resides predominantly in the colon (Pakvashaya) and bones (Asthi).'
      ]
    }
  },
  {
    name: 'Pitta Dosha',
    slug: 'pitta-dosha',
    category: 'Tridosha',
    sanskritName: {
      devanagari: 'पित्त दोष',
      iast: 'Pitta Doṣa',
      etymology: 'Tapa santape (that which generates thermal energy, burns, cooks, and transforms).'
    },
    definition: 'The metabolic and thermogenic bio-energy composed predominantly of Tejas (Fire) and secondary Jala (Water) Mahabhutas.',
    description: 'Pitta governs all catabolic breakdown, cellular enzymatic digestion, vision, body temperature regulation, hunger, thirst, intellectual comprehension, and skin luster.',
    characteristics: [
      'Sasneha (Slightly unctuous)',
      'Ushna (Hot)',
      'Tikshna (Sharp/Penetrating)',
      'Laghu (Light)',
      'Visra (Fleshy odor)',
      'Sara (Flowing)',
      'Drava (Liquid)'
    ],
    functions: [
      {
        term: 'Pakti & Ushma',
        meaning: 'Digestion and Thermogenesis',
        description: 'Digests food, maintains core body temperature, imparts visual perception, and enables intellectual discernment.'
      }
    ],
    relationshipToDhatus: 'Resides inside Rakta Dhatu (blood) and Sveda (sweat). Aggravation of Pitta causes immediate inflammatory disorders of blood and skin (Raktapitta, Visarpa).',
    modernPhysiologicalPerspective: 'Enzymatic hydrolysis, cellular mitochondria, hepatic metabolism, endocrine hormone signaling, and gastric acid secretion.',
    referenceSlugs: ['charaka-sutra-1-57'],
    learnerSummary: {
      simplifiedExplanation: 'Pitta is the metabolic fire of the body, responsible for digesting meals, maintaining body warmth, producing red blood, and powering clear mental focus.',
      keyPoints: [
        'Governs digestion, metabolism, body heat, and visual acuity.',
        'Hot, sharp, light, and slightly oily in nature.',
        'Resides predominantly in the small intestine, liver, spleen, and blood.'
      ]
    }
  },
  {
    name: 'Kapha Dosha',
    slug: 'kapha-dosha',
    category: 'Tridosha',
    sanskritName: {
      devanagari: 'कफ दोष',
      iast: 'Kapha Doṣa',
      etymology: 'Kena jalena phalati iti Kaphah (that which develops and flourishes from the water element).'
    },
    definition: 'The anabolic and cohesive bio-energy composed of Jala (Water) and Prithvi (Earth) Mahabhutas.',
    description: 'Kapha provides the bodily physical matrix, cellular lubrication, joint stability, tissue hydration, immunological resistance, wound healing, and emotional calmness and forgiveness.',
    characteristics: [
      'Snigdha (Unctuous)',
      'Sheeta (Cold)',
      'Guru (Heavy)',
      'Manda (Slow)',
      'Shlakshna (Smooth)',
      'Mritsna (Viscous/Sticky)',
      'Sthira (Stable)'
    ],
    functions: [
      {
        term: 'Sthirata & Bandhana',
        meaning: 'Stability and Cohesion',
        description: 'Glues tissues together, provides joint unctuousness (Shleshaka), lubricates chest and lungs (Avalambaka), and sustains endurance.'
      }
    ],
    relationshipToDhatus: 'Resides inside Rasa, Mamsa, Meda, Majja, and Shukra Dhatus. Kapha provides the physical substance and fluid matrix for these tissues.',
    modernPhysiologicalPerspective: 'Anabolic tissue synthesis, synovial joint lubrication, mucous barrier defense, extracellular collagen matrix, and protective lipid stores.',
    referenceSlugs: ['charaka-sutra-1-57'],
    learnerSummary: {
      simplifiedExplanation: 'Kapha is the structural glue and lubricant of the body, providing firm muscles, cushioned joints, deep hydration, and emotional stability.',
      keyPoints: [
        'Governs bodily mass, moisture, joint lubrication, and physical stamina.',
        'Heavy, slow, cool, oily, and smooth in nature.',
        'Resides predominantly in the stomach, chest, joints, and lymphatic fluids.'
      ]
    }
  },
  {
    name: 'Agni (Biological Digestive & Metabolic Fire)',
    slug: 'agni',
    category: 'Agni',
    sanskritName: {
      devanagari: 'अग्नि',
      iast: 'Agni',
      etymology: 'Agni nayati iti Agnih (that which transforms and moves biological matter forward).'
    },
    definition: 'The universal principle of bio-transformation, enzymatic breakdown, and energy metabolism in living organisms.',
    description: 'Ayurveda recognizes 13 distinct functional Agnis in human physiology: 1 master gastrointestinal fire (Jatharagni), 7 tissue metabolic fires (Dhatvagnis), and 5 elemental bio-enzymatic fires (Bhutagnis: Parthiva, Apya, Taijasa, Vayavya, Nabhasa). Life, complexion, strength, health, enthusiasm, growth, luster, Ojas, Tejas, and Prana all depend on the integrity of Agni.',
    characteristics: [
      'Presents in 4 clinical states: Sama (Balanced), Vishama (Irregular/Vata), Tikshna (Hyperactive/Pitta), and Manda (Hypoactive/Kapha).',
      'Extinction of Agni results in biological death; balanced Agni confers a long, healthy life.'
    ],
    functions: [
      {
        term: 'Ahara Parinama & Dhatu Paka',
        meaning: 'Food Transformation and Tissue Metabolism',
        description: 'Transforms macro-dietary substances into micro-nutrients, separates waste, and synthesizes living bodily tissues.'
      }
    ],
    relationshipToDhatus: 'Jatharagni feeds the 7 Dhatvagnis. If Jatharagni is impaired, all 7 Dhatvagnis suffer, producing deficient tissues and pathogenic Ama across all Dhatu levels.',
    modernPhysiologicalPerspective: 'The totality of gastrointestinal digestive enzymes, hepatic metabolic pathways, cellular oxidative phosphorylation, and mitochondrial ATP synthesis.',
    referenceSlugs: ['charaka-chikitsa-15-15', 'ccras-2018-agni-metabolism'],
    learnerSummary: {
      simplifiedExplanation: 'Agni is your body\'s master metabolic fire. It consists of 13 internal fires: one master stomach fire (Jatharagni), seven tissue fires (Dhatvagnis), and five elemental liver fires (Bhutagnis).',
      keyPoints: [
        'Total of 13 Agnis in Ayurvedic physiology.',
        'Jatharagni in the stomach is the master ruler of all other metabolic fires.',
        'Healthy Agni equals vibrant energy and strong immunity; weak Agni creates toxic Ama.'
      ]
    }
  },
  {
    name: 'Jatharagni (Master Gastrointestinal Fire)',
    slug: 'jatharagni',
    category: 'Agni',
    sanskritName: {
      devanagari: 'जाठराग्नि',
      iast: 'Jāṭharāgni',
      etymology: 'Jathare sthitaḥ agniḥ (the fire residing in the stomach and upper gastrointestinal tract).'
    },
    definition: 'The chief digestive fire located in the Amashaya (stomach) and Grahani (duodenum/small intestine), responsible for primary digestion of food.',
    description: 'Jatharagni (also known as Pachakagni) is the sovereign ruler over all bodily fires. It digests the four varieties of ingested food (chewed, drunk, licked, and swallowed) and separates them into clear nutrient fluid (Ahara Rasa) and gross excretory wastes (Purisha and Mutra).',
    characteristics: [
      'Located in the Grahani (duodenal seat of Agni).',
      'Directly governs the strength or weakness of the seven tissue fires (Dhatvagnis).',
      'Assisted by Prana Vayu, Samana Vayu, Pachaka Pitta, and Kledaka Kapha.'
    ],
    functions: [
      {
        term: 'Prasada-Kitta Vibhaga',
        meaning: 'Essence and Waste Separation',
        description: 'Breaks down gross dietary bolus, extracting clear nourishing plasma precursor (Ahara Rasa) and shunting waste into the colon.'
      }
    ],
    relationshipToDhatus: 'Primary source of raw material for all Sapta Dhatus. Without properly functioning Jatharagni, nutrient plasma cannot be formed, leading to systemic Dhatu depletion.',
    modernPhysiologicalPerspective: 'Gastric acid, pepsin, pancreatic proteases, lipases, amylases, bile salts, and brush-border enterocyte enzymes in the stomach and duodenum.',
    referenceSlugs: ['charaka-sutra-28-4', 'charaka-chikitsa-15-15'],
    learnerSummary: {
      simplifiedExplanation: 'Jatharagni is your main digestive fire located in your stomach and small intestine. It acts as the gatekeeper of all nutrition, turning food into absorbable nutrients and separating out solid waste.',
      keyPoints: [
        'The main stomach fire responsible for digesting meals.',
        'Separates food into pure nutrient fluid (Ahara Rasa) and stool/urine.',
        'Directly supplies fuel and power to all seven tissue fires.'
      ]
    }
  },
  {
    name: 'Mala (Biological Waste Principles)',
    slug: 'mala',
    category: 'Mala',
    sanskritName: {
      devanagari: 'मल',
      iast: 'Mala',
      etymology: 'Mrijyate kshalyate iti Malah (that which must be cleansed, eliminated, or excreted from the body).'
    },
    definition: 'The excretory metabolic byproducts whose timely elimination and balanced retention uphold bodily integrity (Sharira Dharana).',
    description: 'Classical Ayurveda identifies three primary gross body wastes (Trimalas: Purisha / feces, Mutra / urine, and Sveda / sweat) alongside subtle tissue wastes (Dhatu Malas) formed during Dhatvagni paka. Far from being merely useless trash, balanced retention of Malas maintains abdominal tone, fluid equilibrium, and thermoregulation.',
    characteristics: [
      'Purisha (feces) maintains abdominal column stability (Vatastambha).',
      'Mutra (urine) regulates internal fluid and electrolyte levels (Kleda-vahana).',
      'Sveda (sweat) maintains skin hydration and thermoregulation (Kleda-vidhruti).'
    ],
    functions: [
      {
        term: 'Kleda-Nirharana & Sharira Dharana',
        meaning: 'Fluid Elimination and Postural Stability',
        description: 'Excretes toxic metabolic residues while temporary retention provides mechanical visceral support.'
      }
    ],
    relationshipToDhatus: 'Every Dhatu produces a specific Mala during its Dhatvagni transformation: Rasa yields Kapha; Rakta yields Pitta; Mamsa yields Kha-mala; Meda yields Sveda; Asthi yields hair and nails; Majja yields eye/skin sebum.',
    modernPhysiologicalPerspective: 'Excretory physiology: colonic feces and microbiome waste, renal glomerular filtration and urine elimination, and cutaneous eccrine sweat excretion.',
    referenceSlugs: ['ashtanga-hridaya-sutra-11-1', 'charaka-sutra-28-4'],
    learnerSummary: {
      simplifiedExplanation: 'Malas are the body\'s natural metabolic waste products: stool, urine, sweat, and subtle tissue secretions. Their balanced daily elimination keeps channels clean and tissues healthy.',
      keyPoints: [
        'Three primary gross wastes: Purisha (stool), Mutra (urine), and Sveda (sweat).',
        'Each of the seven tissues also produces subtle metabolic wastes during transformation.',
        'Proper elimination prevents toxic buildup in channels.'
      ]
    }
  },
  {
    name: 'Ama (Metabolic Toxins from Impaired Agni)',
    slug: 'ama',
    category: 'Ama',
    sanskritName: {
      devanagari: 'आम',
      iast: 'Āma',
      etymology: 'Amayati rogam janayati iti Amah (that which causes disease, fermentation, and systemic toxicity).'
    },
    definition: 'Unassimilated, undigested, and toxic metabolic byproduct resulting from diminished digestive or tissue fire (Mandagni).',
    description: 'Ama is the primary endogenous pathological factor in classical medicine. When Agni is weak, digested food does not achieve proper transformation; instead, it ferments into a heavy, sticky, foul-smelling substance that clogs channels (Srotorodha), vitiates all Doshas, and triggers systemic chronic inflammatory diseases.',
    characteristics: [
      'Avipakkva (Undigested / Unripe)',
      'Asamyukta (Improperly assimilated)',
      'Durgandha (Foul-smelling)',
      'Picchila (Sticky / Viscous)',
      'Guru (Heavy / Clogging)'
    ],
    functions: [
      {
        term: 'Srotorodha & Balabhramsha',
        meaning: 'Channel Obstruction and Loss of Strength',
        description: 'Blocks micro-vessels, causes fatigue, heaviness, lethargy, coated tongue, loss of taste, and inflammatory disease.'
      }
    ],
    relationshipToDhatus: 'When Ama enters the bloodstream, it binds with tissues (Sama Dhatus), producing chronic disorders such as Amavata (rheumatoid arthritis), Medoroga, and systemic Srotas occlusion.',
    modernPhysiologicalPerspective: 'Endotoxemia, circulating advanced glycation end-products (AGEs), lipopolysaccharide (LPS) leakage from impaired gut barrier, and chronic low-grade systemic inflammation.',
    referenceSlugs: ['ashtanga-hridaya-sutra-13-25'],
    learnerSummary: {
      simplifiedExplanation: 'Ama is toxic, sticky biological waste that forms when your digestive fire is too weak to fully digest a meal. It clogs your channels, causes fatigue, and forms the root cause of chronic illness.',
      keyPoints: [
        'Forms when digestive fire (Agni) is weak or overloaded.',
        'Sticky, heavy, and foul-smelling, leading to a white-coated tongue and fatigue.',
        'Blocks circulation channels and triggers inflammatory conditions.'
      ]
    }
  },
  {
    name: 'Ojas (Supreme Vital Essence & Immunity)',
    slug: 'ojas',
    category: 'Ojas',
    sanskritName: {
      devanagari: 'ओजस्',
      iast: 'Ojas',
      etymology: 'Ojayati bala-vardhayate iti Ojah (that which provides supreme vitality, natural resilience, and radiant health).'
    },
    definition: 'The quintessential biological extract and culmination of the entire Sapta Dhatu metabolic continuum, mediating immunity and vitality.',
    description: 'Ojas is the finest, most refined essence in human biology. Derived from the completed transformation of all seven tissues (especially Shukra), it represents the biological foundation of Vyadhikshamatva (natural disease resistance and immunity), mental serenity, and radiant longevity. Classical texts describe two varieties: Para Ojas (eight drops in the heart essential for life) and Apara Ojas (half Anjali circulating throughout all tissues).',
    characteristics: [
      'Somatmaka (Cool, nurturing, water-dominant nature)',
      'Shukla / Ishat Rakta-Pita (Clear, reddish-yellow or milky in hue)',
      'Madhura (Sweet taste like honey)',
      'Guru, Snigdha, Sheeta, Bahala, Sandra (Unctuous, dense, stable properties)'
    ],
    functions: [
      {
        term: 'Bala & Vyadhikshamatva',
        meaning: 'Strength and Natural Immunity',
        description: 'Empowers cellular immunity, imparts sensory and cognitive brilliance, sustains heart function, and protects against disease.'
      }
    ],
    relationshipToDhatus: 'Direct supreme quintessence (Sara) of all seven Dhatus. Healthy, unhurried Dhatuposhana yields radiant Ojas; conversely, tissue wasting (Dhatukshaya) depletes Ojas.',
    modernPhysiologicalPerspective: 'Innate and adaptive immunological competence, neuro-endocrine homeostasis, cytokine balance, and high heart rate variability (vital reserve).',
    referenceSlugs: ['charaka-sutra-17-74', 'sushruta-sutra-15'],
    learnerSummary: {
      simplifiedExplanation: 'Ojas is your body\'s supreme shield of immunity, energy, and mental radiance. It is the golden prize distilled by your metabolism after nourishing all seven tissues.',
      keyPoints: [
        'The ultimate quintessence of all seven tissues.',
        'Powers natural disease resistance (immunity) and emotional courage.',
        'Consists of Para Ojas (8 drops in the heart) and circulating Apara Ojas.'
      ]
    }
  },
  {
    name: 'Srotas (Micro and Macro Circulatory Channels)',
    slug: 'srotas',
    category: 'Srotas',
    sanskritName: {
      devanagari: 'स्रोतः',
      iast: 'Srotas',
      etymology: 'Sravanat srotamsi (channels through which nutrient fluids and metabolites permeate, circulate, and flow).'
    },
    definition: 'The tubular, porous macroscopic and microscopic vascular and interstitial channels mediating biological circulation and metabolic transformation.',
    description: 'Ayurvedic physiology views the living body as a vast network of interconnected channels (Srotomaya Purusha). Charaka describes 13 internal channel systems (Pranavaha, Udakavaha, Annavaha, the 7 Dhatuvaha channels, and the 3 Malavaha channels), while Sushruta details 11 pairs. Every Srotas has a root anatomical center (Moolasthana), conductive path, and terminal micro-orifices (Srotomukha).',
    characteristics: [
      'Matches the color, shape, and size of the tissue it conveys.',
      'Can be micro-capillary (Sukshma), tubular (Vritta), elongated (Dirgha), or reticular (Pratana).',
      'Pathological states: Atipravritti (excess flow), Sanga (obstruction), Siragranthi (dilation/aneurysm), and Vimargagamana (aberrant flow).'
    ],
    functions: [
      {
        term: 'Vahana & Parinama',
        meaning: 'Conduction and Transformation',
        description: 'Carries precursor nutrients to tissue beds and drains metabolic waste products to excretory outlets.'
      }
    ],
    relationshipToDhatus: 'Each of the Sapta Dhatus has its dedicated channel system: Rasavaha, Raktavaha, Mamsavaha, Medovaha, Asthivaha, Majjavaha, and Shukravaha Srotas. Dhatuposhana cannot occur without healthy, patent Srotamsi.',
    modernPhysiologicalPerspective: 'Arteries, veins, capillary beds, lymphatic channels, microvascular endothelium, interstitial fluid spaces, and nephrons.',
    referenceSlugs: ['charaka-vimana-5-3'],
    learnerSummary: {
      simplifiedExplanation: 'Srotas are the internal highways, canals, and micro-tunnels that circulate blood, nutrients, water, and wastes to every cell in your body.',
      keyPoints: [
        'The body is an interconnected channel network (Srotomaya Purusha).',
        'Each of the seven tissues has its own dedicated circulation channels.',
        'Keeping channels clean and free of obstruction (Ama) is essential for health.'
      ]
    }
  },
  {
    name: 'Prakriti (Constitutional Archetypes)',
    slug: 'prakriti',
    category: 'Prakriti',
    sanskritName: {
      devanagari: 'प्रकृति',
      iast: 'Prakṛti',
      etymology: 'Pra-karoti iti Prakritih (the innate constitutional blueprint established at conception).'
    },
    definition: 'The genetically and epigenetically determined psycho-somatic constitutional baseline of an individual.',
    description: 'Formed at the moment of conception (Shukra-Shonita Samyoga) based on parental genetics, maternal diet/regimen, gestational environment, and seasonal factors, Prakriti remains constant throughout life. The seven constitutional types are Vataja, Pittaja, Kaphaja, Vata-Pittaja, Pitta-Kaphaja, Vata-Kaphaja, and Samadoshaja. Understanding Prakriti explains why different people have naturally different metabolic speeds, structural builds, and tolerances.',
    characteristics: [
      'Remains anatomically and genetically constant throughout an individual\'s lifetime.',
      'Reflects relative baseline dominance of Vata, Pitta, and Kapha without implying disease.',
      'Dictates natural physiological tendencies, digestion speed, sleep habits, and temperature preferences.'
    ],
    functions: [
      {
        term: 'Svasthya-Mula Nirupana',
        meaning: 'Baseline Health Demarcation',
        description: 'Establishes the unique physiological reference point from which disease imbalances (Vikriti) are measured.'
      }
    ],
    relationshipToDhatus: 'An individual\'s Prakriti directly influences baseline Dhatu development: Kaphaja Prakriti naturally tends toward robust Mamsa and Asthi with Pravara Sarata; Vataja Prakriti tends toward lighter bone density and variable muscle mass; Pittaja Prakriti exhibits warm blood flow and high metabolic turnover.',
    modernPhysiologicalPerspective: 'Genomic constitution, epigenetic expression, metabolic phenotypes, neuro-endocrine constitutional profiling, and individual baseline pharmacogenomics.',
    referenceSlugs: ['charaka-vimana-8-102', 'charaka-sutra-1-57'],
    learnerSummary: {
      simplifiedExplanation: 'Prakriti is your unique biological blueprint determined at conception. It explains why each human being has a different natural body type, metabolic speed, and constitutional personality.',
      keyPoints: [
        'Established at conception and remains constant throughout life.',
        'Explains individual variations in body build, digestion, and temperature preferences.',
        'Educational concept for understanding diversity in human physiology.'
      ]
    },
    educationalSafetyNotice: 'This is educational background on the classical concept of human constitutional individuality. It does not provide personalized clinical assessment, diagnostic scoring, or medical prescription.'
  }
];

export default conceptsSeedData;
