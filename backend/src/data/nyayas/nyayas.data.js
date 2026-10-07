
export const nyayasSeedData = [
  {
    name: 'Kshira-Dadhi Nyaya',
    slug: 'kshira-dadhi-nyaya',
    sanskritName: {
      devanagari: 'क्षीर-दधि न्याय',
      iast: 'Kṣīra-Dadhi Nyāya'
    },
    literalMeaning: 'Law of Transformation like Milk Turning into Curd (Direct Sequential Metamorphosis)',
    analogy: {
      metaphor: 'Milk coagulating and completely transforming into yogurt/curd upon fermentation.',
      classicalDescription: 'Just as whole milk, when subjected to starter culture and warmth, undergoes total conversion into curd without leaving milk behind, precursor tissue substance is systematically transformed into successor tissue.',
      modernAnalogy: 'Sequential biochemical polymerization or developmental cell lineage maturation where precursor stem/progenitor cells differentiate directly into mature specialized daughter cells.'
    },
    physiologicalMechanism: 'According to this model, the preceding tissue (Poshaka Bhaga) transforms directly and chronologically into the successor tissue through the action of tissue-specific Dhatvagnis (e.g., Rasa directly yielding Rakta, Rakta yielding Mamsa, etc.). Classical commentators clarify that it is not the structural tissue (Sthayi Dhatu) that disappears wholly into the next, but rather the circulating mobile nutrient fraction (Poshaka Dhatu) that undergoes this conversion.',
    scopeAndApplicability: 'Explains the strict chronological hierarchy of tissue synthesis and developmental progression from primary digestion to ultimate reproductive essence. Its classical limitation is that if all of Rasa became Rakta, Rasa would cease to exist; hence classical masters combined it with Kedari-Kulya and Khale-Kapota to provide a complete biological framework.',
    scholarlyCommentary: [
      {
        commentator: 'Chakrapanidatta',
        work: 'Ayurveda Dipika on Charaka Chikitsa 15/15',
        interpretation: 'Clarifies that Kshira-Dadhi Nyaya applies specifically to the Poshaka (nutrient precursor) fraction of each Dhatu, thereby ensuring the Sthayi (established tissue bed) remains intact while feeding the next stage.'
      },
      {
        commentator: 'Dalhana',
        work: 'Nibandha Samgraha on Sushruta Sutra 14/10',
        interpretation: 'Notes that milk-to-curd metamorphosis reflects the chronological maturation time (Parinama Kala) required for complex tissue synthesis.'
      }
    ],
    referenceSlugs: ['charaka-chikitsa-15-15', 'sushruta-sutra-14-10'],
    learnerSummary: {
      simplifiedExplanation: 'The Milk-into-Yogurt principle explains how the nutrients in your body step through a chronological transformation chain, with each tissue refining raw materials to birth the next tissue in line.',
      keyTakeaways: [
        'Explains the sequential chronological order of tissue development (Rasa -> Rakta -> Mamsa, etc.).',
        'Applies to mobile nutrient fractions, ensuring existing tissues are not consumed during transformation.',
        'Emphasizes that deep tissue health depends directly on the quality of preceding tissue stages.'
      ]
    },
    verification: {
      status: 'verified',
      verificationNotes: 'Source verified with Chakrapanidatta commentary on Charaka Chikitsa 15/15 and Dalhana on Sushruta Sutra 14/10.'
    }
  },
  {
    name: 'Kedari-Kulya Nyaya',
    slug: 'kedari-kulya-nyaya',
    sanskritName: {
      devanagari: 'केदारी-कुल्या न्याय',
      iast: 'Kedārī-Kulyā Nyāya'
    },
    literalMeaning: 'Law of Irrigation Channels Watering Sequential Fields (Channel Transmission & Perfusion)',
    analogy: {
      metaphor: 'Irrigation water traveling from a main canal through smaller ditches to nourish agricultural fields sequentially.',
      classicalDescription: 'Just as irrigation water flowing through a main canal is diverted into secondary ditches (Kulyas) to flood and water nearby agricultural fields (Kedaris) first, before traveling onwards to irrigate distant fields, circulating nutrient plasma travels through micro-channels (Srotamsi) to nourish proximal tissues first and distal tissues sequentially.',
      modernAnalogy: 'Cardiovascular hemodynamics and systemic microvascular capillary perfusion where arterial branching delivers oxygen and dissolved nutrients to sequential organ beds based on perfusion gradients.'
    },
    physiologicalMechanism: 'Ahara Rasa propelled from the heart by Vyana Vayu circulates through the great vessels and capillary beds (Dhamanis and Srotamsi). As this nutrient stream passes each tissue bed, local channels absorb their required fluid fraction to sustain ongoing metabolic turnover, while remaining nutrients continue downstream to supply subsequent tissue beds.',
    scopeAndApplicability: 'Explains the physical transportation, circulatory mechanics, and anatomical distribution of nutrients throughout macroscopic and microscopic vascular networks. It explains why circulatory impairment or channel obstruction (Srotorodha) starves distal tissues.',
    scholarlyCommentary: [
      {
        commentator: 'Chakrapanidatta',
        work: 'Ayurveda Dipika on Charaka Chikitsa 15/15',
        interpretation: 'Highlights that without unobstructed Srotas channels (Kulya), nutrient irrigation cannot reach deeper tissue beds, leading to selective tissue starvation (Dhatukshaya).'
      },
      {
        commentator: 'Arunadatta',
        work: 'Sarvanga Sundara on Ashtanga Hridaya Sharira 3',
        interpretation: 'Emphasizes that irrigation occurs continuously throughout life, driven by the rhythmic pump of the heart and circulating Vata.'
      }
    ],
    referenceSlugs: ['charaka-chikitsa-15-15', 'charaka-vimana-5-3', 'jaim-2016-dhatu-metabolism'],
    learnerSummary: {
      simplifiedExplanation: 'The Irrigation Canal principle explains how your heart pumps a nutrient-rich stream through vascular ditches to water every tissue field in your body from nearest to farthest.',
      keyTakeaways: [
        'Explains nutrient circulation and microvascular distribution.',
        'Compares blood vessels to irrigation canals watering crop fields.',
        'Demonstrates why clear, unblocked channels (Srotas) are vital for nourishing deep tissues like bone and marrow.'
      ]
    },
    verification: {
      status: 'verified',
      verificationNotes: 'Source verified with Chakrapanidatta on Charaka Chikitsa 15/15 and Charaka Vimana 5/3.'
    }
  },
  {
    name: 'Khale-Kapota Nyaya',
    slug: 'khale-kapota-nyaya',
    sanskritName: {
      devanagari: 'खले-कपोत न्याय',
      iast: 'Khale-Kapota Nyāya'
    },
    literalMeaning: 'Law of Pigeons Selecting Grains from a Threshing Floor (Selective Cellular Uptake)',
    analogy: {
      metaphor: 'Different pigeons flying from various distances to a threshing floor to selectively pick up specific grains.',
      classicalDescription: 'Just as pigeons of different breeds fly to a common communal threshing floor (Khale), each selecting the exact grains suitable for its needs and carrying them back to its nest by different routes taking varying amounts of time, each tissue selectively extracts its specific nutrient molecules from circulating blood via its receptive channel orifices (Srotomukha).',
      modernAnalogy: 'Cellular receptor-mediated endocytosis, selective membrane transport proteins, and organ-specific metabolic tropism where specific cells extract specific circulating hormones, minerals, and amino acids via ligand-receptor specificity.'
    },
    physiologicalMechanism: 'Nutrient-rich plasma contains an array of elemental building blocks. Each tissue organ bed is equipped with specialized micro-orifices (Srotomukha) with selective affinities. The bone channels absorb calcium and dense earth minerals; the muscle channels absorb protein building blocks; and the marrow channels absorb lipid components. Distant and highly refined tissues (like Shukra) take longer to gather their subtle requirements than proximal tissues.',
    scopeAndApplicability: 'Explains biological selectivity, tissue specificity, and differential nourishment rates. Resolves how all tissues can simultaneously derive nutrition from a common circulating blood pool without interfering with one another.',
    scholarlyCommentary: [
      {
        commentator: 'Chakrapanidatta',
        work: 'Ayurveda Dipika on Charaka Chikitsa 15/15',
        interpretation: 'Resolves the timing problem of Dhatuposhana: explains why dense tissues like Asthi and refined tissues like Shukra require distinct metabolic timeframes to selectively accumulate their specialized constituents.'
      },
      {
        commentator: 'Shivadansen',
        work: 'Tattva Chandrika Commentary',
        interpretation: 'Emphasizes that selective uptake relies on healthy channel openings (Srotomukha Vivarana) that allow tissue-specific attraction (Swabhava).'
      }
    ],
    referenceSlugs: ['charaka-chikitsa-15-15', 'sushruta-sutra-14-10', 'jaim-2016-dhatu-metabolism'],
    learnerSummary: {
      simplifiedExplanation: 'The Pigeons at the Threshing Floor principle explains how different tissues act like smart pigeons, landing at the common nutrient pool to selectively pick only the specific vitamins, minerals, and building blocks they need.',
      keyTakeaways: [
        'Explains selective cellular absorption from a common bloodstream.',
        'Shows why different tissues take different amounts of time to nourish and repair.',
        'Parallels modern receptor-mediated uptake and tissue-specific nutrient absorption.'
      ]
    },
    verification: {
      status: 'verified',
      verificationNotes: 'Source verified with Chakrapanidatta on Charaka Chikitsa 15/15 and peer-reviewed analysis in J-AIM (2016).'
    }
  }
];

export default nyayasSeedData;
