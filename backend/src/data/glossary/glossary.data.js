

export const glossarySeedData = [
  {
    term: 'Dhatu',
    slug: 'dhatu',
    sanskritName: {
      devanagari: 'धातु',
      iast: 'Dhātu'
    },
    category: 'Foundational Principle',
    englishMeaning: 'Sustaining Body Tissue / Fundamental Matrix',
    simpleExplanation: 'The seven primary biological tissues that uphold, nourish, and provide physical structure to the human body.',
    detailedDefinition: 'Derived from the verbal root "Dha" (to hold or support), referring specifically to Rasa, Rakta, Mamsa, Meda, Asthi, Majja, and Shukra.',
    relatedConcept: 'Sapta Dhatu'
  },
  {
    term: 'Dhatvagni',
    slug: 'dhatvagni',
    sanskritName: {
      devanagari: 'धात्वाग्नि',
      iast: 'Dhātvagni'
    },
    category: 'Agni & Metabolism',
    englishMeaning: 'Tissue-Level Metabolic / Enzymatic Fire',
    simpleExplanation: 'The internal metabolic and enzymatic fire residing in each of the seven tissues that transforms nutrients into living cellular structures.',
    detailedDefinition: 'Seven specialized fires that process precursor fractions into mature tissue (Prasada) and excretory wastes (Kitta).',
    relatedConcept: 'Agni'
  },
  {
    term: 'Dhatuposhana',
    slug: 'dhatuposhana',
    sanskritName: {
      devanagari: 'धातुपोषण',
      iast: 'Dhātupoṣaṇa'
    },
    category: 'Tissue Transformation',
    englishMeaning: 'Tissue Nourishment and Sequential Metamorphosis',
    simpleExplanation: 'The sequential physiological process by which digested food nutrients transform stage-by-stage through all seven tissues.',
    detailedDefinition: 'Governed by three classical theories (Nyayas) explaining sequential irrigation, selective uptake, and developmental maturation.',
    relatedConcept: 'Nyayas of Dhatuposhana'
  },
  {
    term: 'Ahara Rasa',
    slug: 'ahara-rasa',
    sanskritName: {
      devanagari: 'आहार रस',
      iast: 'Āhāra Rasa'
    },
    category: 'Metabolic Fraction',
    englishMeaning: 'Digested Food Essence / Chyme Nutrient Extract',
    simpleExplanation: 'The pure, clear nutrient fluid absorbed from food in the gastrointestinal tract before it enters the heart and becomes mature blood plasma.',
    detailedDefinition: 'The primary substrate (Prasada Bhaga) extracted by Jatharagni digestion.',
    relatedConcept: 'Jatharagni'
  },
  {
    term: 'Prasada Bhaga',
    slug: 'prasada-bhaga',
    sanskritName: {
      devanagari: 'प्रसाद भाग',
      iast: 'Prasāda Bhāga'
    },
    category: 'Metabolic Fraction',
    englishMeaning: 'Nutrient Essence / Anabolic Fraction',
    simpleExplanation: 'The pure, nourishing portion produced after digestion or tissue transformation that feeds the tissue itself and seeds the next tissue.',
    detailedDefinition: 'The vital anabolic fraction produced by every Agni paka, in contrast to the excretory waste (Kitta Bhaga).',
    relatedConcept: 'Dhatvagni'
  },
  {
    term: 'Kitta Bhaga',
    slug: 'kitta-bhaga',
    sanskritName: {
      devanagari: 'किट्ट भाग',
      iast: 'Kiṭṭa Bhāga'
    },
    category: 'Tissue Waste & Upadhatu',
    englishMeaning: 'Excretory Fraction / Metabolic Byproduct',
    simpleExplanation: 'The waste or excretory portion produced during digestion or tissue metabolic transformation.',
    detailedDefinition: 'Forms gross wastes (feces, urine) in the gut, and subtle tissue wastes (sweat, mucus, hair, nails) at the tissue level.',
    relatedConcept: 'Mala'
  },
  {
    term: 'Prinana',
    slug: 'prinana',
    sanskritName: {
      devanagari: 'प्रीणन',
      iast: 'Prīṇana'
    },
    category: 'Physiological Action',
    englishMeaning: 'Nourishing / Cellular Satiation',
    simpleExplanation: 'The foremost biological function of Rasa Dhatu: providing hydration, contentment, and nutritional satisfaction to every cell.',
    detailedDefinition: 'Classical action ascribed to Rasa in Ashtanga Hridaya Sutrasthana 11/4.',
    relatedDhatuSlug: 'rasa',
    relatedConcept: 'Dhatu Karma'
  },
  {
    term: 'Jivana',
    slug: 'jivana',
    sanskritName: {
      devanagari: 'जीवन',
      iast: 'Jīvana'
    },
    category: 'Physiological Action',
    englishMeaning: 'Enlivening / Sustaining Life',
    simpleExplanation: 'The foremost biological function of Rakta Dhatu: providing oxygenation, vitality, warmth, and consciousness to living tissues.',
    detailedDefinition: 'Classical primary action of Rakta Dhatu.',
    relatedDhatuSlug: 'rakta',
    relatedConcept: 'Dhatu Karma'
  },
  {
    term: 'Lepana',
    slug: 'lepana',
    sanskritName: {
      devanagari: 'लेपन',
      iast: 'Lepana'
    },
    category: 'Physiological Action',
    englishMeaning: 'Plastering / Enveloping & Covering',
    simpleExplanation: 'The foremost biological function of Mamsa Dhatu: covering the skeleton, cushioning vital organs, and giving bodily contour.',
    detailedDefinition: 'Classical primary action of Mamsa Dhatu.',
    relatedDhatuSlug: 'mamsa',
    relatedConcept: 'Dhatu Karma'
  },
  {
    term: 'Snehana',
    slug: 'snehana',
    sanskritName: {
      devanagari: 'स्नेहन',
      iast: 'Snehana'
    },
    category: 'Physiological Action',
    englishMeaning: 'Lubrication / Oleation',
    simpleExplanation: 'The foremost biological function of Meda Dhatu: providing deep internal unctuousness to joints, organs, and channels.',
    detailedDefinition: 'Classical primary action of Meda Dhatu.',
    relatedDhatuSlug: 'meda',
    relatedConcept: 'Dhatu Karma'
  },
  {
    term: 'Dharana',
    slug: 'dharana',
    sanskritName: {
      devanagari: 'धारण',
      iast: 'Dhāraṇa'
    },
    category: 'Physiological Action',
    englishMeaning: 'Supporting / Sustaining Structural Posture',
    simpleExplanation: 'The foremost biological function of Asthi Dhatu: supporting the upright skeleton, bearing weight, and anchoring muscles.',
    detailedDefinition: 'Classical primary action of Asthi Dhatu.',
    relatedDhatuSlug: 'asthi',
    relatedConcept: 'Dhatu Karma'
  },
  {
    term: 'Purana',
    slug: 'purana',
    sanskritName: {
      devanagari: 'पूरण',
      iast: 'Pūraṇa'
    },
    category: 'Physiological Action',
    englishMeaning: 'Filling Hollow Cavities',
    simpleExplanation: 'The foremost biological function of Majja Dhatu: filling the internal medullary lumens of bones and supporting the brain.',
    detailedDefinition: 'Classical primary action of Majja Dhatu.',
    relatedDhatuSlug: 'majja',
    relatedConcept: 'Dhatu Karma'
  },
  {
    term: 'Garbhotpadana',
    slug: 'garbhotpadana',
    sanskritName: {
      devanagari: 'गर्भोत्पाद',
      iast: 'Garbhotpāda'
    },
    category: 'Physiological Action',
    englishMeaning: 'Procreation / Reproduction',
    simpleExplanation: 'The foremost biological function of Shukra Dhatu: fertilization and generation of healthy offspring.',
    detailedDefinition: 'Classical primary action of Shukra Dhatu.',
    relatedDhatuSlug: 'shukra',
    relatedConcept: 'Dhatu Karma'
  },
  {
    term: 'Upadhatu',
    slug: 'upadhatu',
    sanskritName: {
      devanagari: 'उपधातु',
      iast: 'Upadhātu'
    },
    category: 'Tissue Waste & Upadhatu',
    englishMeaning: 'Secondary / Accessory Tissue',
    simpleExplanation: 'Supportive secondary tissues produced during Dhatvagni metabolism that do not produce further subsequent tissues (e.g., breast milk, menstrual fluid, tendons, ligaments).',
    detailedDefinition: 'Accessory structural tissues that uphold the body but lack the full developmental chain of the seven primary Dhatus.',
    relatedConcept: 'Sapta Dhatu'
  },
  {
    term: 'Mala',
    slug: 'mala-term',
    sanskritName: {
      devanagari: 'मल',
      iast: 'Mala'
    },
    category: 'Tissue Waste & Upadhatu',
    englishMeaning: 'Metabolic Waste Products',
    simpleExplanation: 'Biological byproducts whose timely elimination and temporary balanced retention preserve systemic health.',
    detailedDefinition: 'Includes the Trimalas (feces, urine, sweat) and Dhatu-specific Malas (mucus, bile, earwax, nails, hair, eye secretions).',
    relatedConcept: 'Mala'
  },
  {
    term: 'Ojas',
    slug: 'ojas-term',
    sanskritName: {
      devanagari: 'ओजस्',
      iast: 'Ojas'
    },
    category: 'Immunity & Vitality',
    englishMeaning: 'Supreme Biological Essence / Natural Immunity',
    simpleExplanation: 'The refined quintessence of all seven tissues that confers disease resistance, physical vigor, mental radiance, and emotional stability.',
    detailedDefinition: 'The vital essence residing in the heart (Para Ojas) and circulating systemically (Apara Ojas).',
    relatedConcept: 'Ojas'
  },
  {
    term: 'Ama',
    slug: 'ama-term',
    sanskritName: {
      devanagari: 'आम',
      iast: 'Āma'
    },
    category: 'Pathology & Agni',
    englishMeaning: 'Toxic Undigested Metabolic Residue',
    simpleExplanation: 'Sticky, fermenting biological waste resulting from weak digestive fire that clogs body channels and triggers disease.',
    detailedDefinition: 'Unripe, improperly transformed Ahara Rasa that vitiates Doshas and obstructs Srotas.',
    relatedConcept: 'Ama'
  },
  {
    term: 'Srotas',
    slug: 'srotas-term',
    sanskritName: {
      devanagari: 'स्रोतः',
      iast: 'Srotas'
    },
    category: 'Channel & Circulation',
    englishMeaning: 'Circulatory / Microvascular Channels',
    simpleExplanation: 'The internal network of vascular, lymphatic, and interstitial channels through which blood, nutrients, and wastes flow.',
    detailedDefinition: 'Tubular and porous anatomical passages that mediate physiological movement and metabolic transformation.',
    relatedConcept: 'Srotas'
  },
  {
    term: 'Kshira-Dadhi Nyaya',
    slug: 'kshira-dadhi-nyaya-term',
    sanskritName: {
      devanagari: 'क्षीर-दधि न्याय',
      iast: 'Kṣīra-Dadhi Nyāya'
    },
    category: 'Transformation Law',
    englishMeaning: 'Milk-to-Curd Transformation Principle',
    simpleExplanation: 'The classical law of tissue nourishment explaining how nutrient precursors transform directly and sequentially like milk becoming yogurt.',
    detailedDefinition: 'Classical model explaining sequential, chronological maturation of precursor fractions into successor tissues.',
    relatedConcept: 'Nyayas of Dhatuposhana'
  },
  {
    term: 'Kedari-Kulya Nyaya',
    slug: 'kedari-kulya-nyaya-term',
    sanskritName: {
      devanagari: 'केदारी-कुल्या न्याय',
      iast: 'Kedārī-Kulyā Nyāya'
    },
    category: 'Transformation Law',
    englishMeaning: 'Irrigation Canal Principle',
    simpleExplanation: 'The classical law comparing blood circulation to irrigation canals watering crop fields sequentially from closest to furthest.',
    detailedDefinition: 'Explains hemodynamic distribution and microvascular tissue perfusion from a central nutrient pool.',
    relatedConcept: 'Nyayas of Dhatuposhana'
  },
  {
    term: 'Khale-Kapota Nyaya',
    slug: 'khale-kapota-nyaya-term',
    sanskritName: {
      devanagari: 'खले-कपोत न्याय',
      iast: 'Khale-Kapota Nyāya'
    },
    category: 'Transformation Law',
    englishMeaning: 'Pigeons-at-the-Threshing-Floor Principle',
    simpleExplanation: 'The classical law explaining how different tissues selectively absorb only the specific nutrients they need from circulating blood.',
    detailedDefinition: 'Explains receptor-like selective cellular uptake and why different tissues require different time intervals for replenishment.',
    relatedConcept: 'Nyayas of Dhatuposhana'
  },
  {
    term: 'Dhatu Sarata',
    slug: 'dhatu-sarata',
    sanskritName: {
      devanagari: 'धातु सारता',
      iast: 'Dhātu Sāratā'
    },
    category: 'Clinical Assessment',
    englishMeaning: 'Tissue Excellence / Qualitative Constitutional Robustness',
    simpleExplanation: 'The eightfold clinical criteria used to evaluate the true physical and psychological strength of each tissue bed.',
    detailedDefinition: 'Detailed in Charaka Vimana 8 as Tvaksara, Raktasara, Mamsasara, Medasara, Asthisara, Majjasara, Shukrasara, and Satvasara.',
    relatedConcept: 'Sapta Dhatu'
  },
  {
    term: 'Dhatu Kshaya',
    slug: 'dhatu-kshaya',
    sanskritName: {
      devanagari: 'धातु क्षय',
      iast: 'Dhātu Kṣaya'
    },
    category: 'Clinical Assessment',
    englishMeaning: 'Tissue Depletion / Deficiency State',
    simpleExplanation: 'A quantitative or qualitative decrease in a bodily tissue, causing weakness, dryness, or functional impairment.',
    detailedDefinition: 'Clinically assessed through specific classical symptoms indicating under-nourishment or tissue atrophy.',
    relatedConcept: 'Sapta Dhatu'
  },
  {
    term: 'Dhatu Vriddhi',
    slug: 'dhatu-vriddhi',
    sanskritName: {
      devanagari: 'धातु वृद्धि',
      iast: 'Dhātu Vṛddhi'
    },
    category: 'Clinical Assessment',
    englishMeaning: 'Tissue Hypertrophy / Excess State',
    simpleExplanation: 'An abnormal increase in the volume or bulk of a bodily tissue, often causing channel congestion or abnormal growths.',
    detailedDefinition: 'Clinically assessed through symptoms indicating excessive tissue accumulation or metabolic stagnation.',
    relatedConcept: 'Sapta Dhatu'
  },
  {
    term: 'Dhatu Dushti',
    slug: 'dhatu-dushti',
    sanskritName: {
      devanagari: 'धातु दुष्टि',
      iast: 'Dhātu Duṣṭi'
    },
    category: 'Clinical Assessment',
    englishMeaning: 'Tissue Vitiation / Pathological Impairment',
    simpleExplanation: 'The qualitative disturbance of a tissue when invaded by vitiated Doshas or metabolic toxins (Ama).',
    detailedDefinition: 'Results in tissue-specific diseases known as Pradoshaja Vikaras.',
    relatedConcept: 'Sapta Dhatu'
  },
  {
    term: 'Jatharagni',
    slug: 'jatharagni-term',
    sanskritName: {
      devanagari: 'जाठराग्नि',
      iast: 'Jāṭharāgni'
    },
    category: 'Agni & Metabolism',
    englishMeaning: 'Chief Gastrointestinal Digestive Fire',
    simpleExplanation: 'The master fire residing in the stomach and small intestine that digests food and fuels all other bodily fires.',
    detailedDefinition: 'The sovereign Agni located in the Grahani responsible for primary digestion.',
    relatedConcept: 'Agni'
  },
  {
    term: 'Prakriti',
    slug: 'prakriti-term',
    sanskritName: {
      devanagari: 'प्रकृति',
      iast: 'Prakṛti'
    },
    category: 'Constitutional Principle',
    englishMeaning: 'Individual Psycho-Somatic Constitution',
    simpleExplanation: 'The unique physical and mental blueprint formed at conception based on the balance of the three Doshas.',
    detailedDefinition: 'An individual\'s lifelong constitutional baseline that explains natural differences in body build, digestion, and traits.',
    relatedConcept: 'Prakriti'
  },
  {
    term: 'Ashraya-Ashrayi Bhava',
    slug: 'ashraya-ashrayi-bhava',
    sanskritName: {
      devanagari: 'आश्रय-आश्रयी भाव',
      iast: 'Āśraya-Āśrayī Bhāva'
    },
    category: 'Foundational Principle',
    englishMeaning: 'Host-and-Resident Interrelationship',
    simpleExplanation: 'The classical physiological doctrine explaining the intimate biological connection between Doshas (residents) and Dhatus (hosts).',
    detailedDefinition: 'Describes how Vata resides in bone, Pitta in blood/sweat, and Kapha in plasma, muscle, fat, marrow, and reproductive tissue.',
    relatedConcept: 'Tridosha Framework'
  }
];

export default glossarySeedData;
