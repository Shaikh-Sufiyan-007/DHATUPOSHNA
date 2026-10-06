

import mongoose from 'mongoose';
import verificationSchema from './common/verification.schema.js';
import {
  DHATU_LIST,
  DHATU_ORDER,
  MAHABHUTA_LIST
} from '../constants/dhatu.constants.js';

const dhatuSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: [true, 'Dhatu name is required'],
      unique: true,
      enum: {
        values: DHATU_LIST,
        message: 'Invalid Dhatu name: {VALUE}'
      },
      trim: true
    },

    // Stable URL-friendly identifier for idempotent seeding and routing (e.g. 'rasa', 'rakta')
    slug: {
      type: String,
      required: [true, 'Dhatu slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },


    sanskritName: {
      devanagari: {
        type: String,
        required: [true, 'Devanagari Sanskrit name is required'],
        trim: true
      },
      iast: {
        type: String,
        required: [true, 'IAST transliteration is required'],
        trim: true
      },
      etymology: {
        type: String,
        trim: true,
        description: 'Vyutpatti / Nirukti (e.g., "Rasyate gamyate aharahariti Rasaḥ")'
      }
    },

    // Sequential position in the 7-dhatu physiological transformation chain (1 through 7)
    order: {
      type: Number,
      required: [true, 'Dhatu sequential order is required'],
      unique: true,
      min: [1, 'Order must be between 1 and 7'],
      max: [7, 'Order must be between 1 and 7'],
      index: true
    },

    // Elemental composition and Ayurvedic constitutional properties
    classification: {
      mahabhutaDominance: [
        {
          type: String,
          enum: {
            values: MAHABHUTA_LIST,
            message: 'Invalid Mahabhuta: {VALUE}'
          }
        }
      ],
      guna: [
        {
          type: String,
          trim: true
        }
      ],
      doshaAffiliation: {
        type: String,
        trim: true,
        description: 'Associated Dosha(s) exhibiting Ashraya-Ashrayi Bhava'
      },
      category: {
        type: String,
        trim: true,
        default: 'Sharira Dharana & Poshana Dravya'
      }
    },


    generalDescription: {
      type: String,
      required: [true, 'General description is required'],
      trim: true
    },


    westernCorrelation: {
      type: String,
      trim: true,
      description: 'Modern tissue/fluid parallel (e.g., Plasma/Lymph for Rasa; Blood/Hemoglobin for Rakta)'
    },


    functions: [
      {
        classicalTerm: {
          type: String,
          required: true,
          trim: true,
          description: 'Sanskrit term for primary action (e.g., "Prinana", "Jivana", "Lepana")'
        },
        meaning: {
          type: String,
          required: true,
          trim: true
        },
        description: {
          type: String,
          trim: true
        }
      }
    ],

    // Dhatu Lakshana / Normal Physiological Characteristics
    dhatuLakshana: [
      {
        characteristic: { type: String, required: true, trim: true },
        sanskritTerm: { type: String, trim: true },
        explanation: { type: String, trim: true }
      }
    ],

    // Anatomical location / seats (Sthana)
    location: [
      {
        type: String,
        trim: true
      }
    ],

    // Formation and metabolic transformation mechanism
    formation: {
      processDescription: {
        type: String,
        trim: true
      },
      precursorDhatu: {
        type: String,
        trim: true,
        description: 'Precursor nourishing tissue (Poshaka Dhatu) or Ahara Rasa'
      },
      transformationDuration: {
        type: String,
        trim: true,
        description: 'Classical time period of transformation (Parinama Kala)'
      }
    },


    dhatvagni: {
      name: {
        type: String,
        required: [true, 'Dhatvagni name is required'],
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      prasadaBhaga: {
        type: String,
        trim: true,
        description: 'Nutrient fraction nourishing the self and seeding the next dhatu'
      },
      kittaBhaga: {
        type: String,
        trim: true,
        description: 'Excretory / waste byproduct fraction'
      }
    },

    // Upadhatu: Secondary/accessory tissues derived during Dhatvagni paka
    upadhatus: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },
        sanskritName: {
          type: String,
          trim: true
        },
        description: {
          type: String,
          trim: true
        }
      }
    ],

    // Mala: Metabolic waste products formed during Dhatvagni paka
    malas: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },
        sanskritName: {
          type: String,
          trim: true
        },
        description: {
          type: String,
          trim: true
        }
      }
    ],

    // Dhatu Sarata: Constitutional excellence / qualitative assessment criteria
    sarata: [
      {
        featureCategory: {
          type: String,
          trim: true
        },
        characteristics: [
          {
            type: String,
            trim: true
          }
        ],
        clinicalSignificance: {
          type: String,
          trim: true
        }
      }
    ],

    // Clinical relevance: depletion (Kshaya), hypertrophy (Vriddhi), and vitiation (Pradoshaja)
    clinicalRelevance: {
      kshayaLakshana: [
        {
          symptom: { type: String, required: true, trim: true },
          sanskritTerm: { type: String, trim: true },
          clinicalExplanation: { type: String, trim: true }
        }
      ],
      vriddhiLakshana: [
        {
          symptom: { type: String, required: true, trim: true },
          sanskritTerm: { type: String, trim: true },
          clinicalExplanation: { type: String, trim: true }
        }
      ],
      pradoshajaVikara: [
        {
          diseaseName: { type: String, required: true, trim: true },
          sanskritName: { type: String, trim: true },
          description: { type: String, trim: true }
        }
      ]
    },

    // Associated Srotas (micro and macro circulatory channels of this Dhatu)
    srotas: {
      name: {
        type: String,
        trim: true
      },
      moolasthana: [
        {
          type: String,
          trim: true
        }
      ],
      vitiationCauses: [
        {
          type: String,
          trim: true
        }
      ],
      vitiationSymptoms: [
        {
          type: String,
          trim: true
        }
      ]
    },

    // Relationship with Ojas (Tissue contribution to supreme vitality & immunity)
    ojasRelationship: {
      description: { type: String, trim: true },
      classicalContext: { type: String, trim: true }
    },


    classicalReferences: [
      {
        reference: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Reference',
          required: true
        },
        context: {
          type: String,
          trim: true
        },
        specificVerse: {
          type: String,
          trim: true
        },
        excerpt: {
          type: String,
          trim: true
        }
      }
    ],


    modernResearchReferences: [
      {
        reference: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Reference',
          required: true
        },
        correlationSummary: {
          type: String,
          trim: true
        }
      }
    ],


    verification: {
      type: verificationSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual to determine subsequent Dhatu in sequence
dhatuSchema.virtual('subsequentDhatu').get(function () {
  if (this.order < 7) {
    const nextOrder = this.order + 1;
    const entry = Object.entries(DHATU_ORDER).find(([, val]) => val === nextOrder);
    return entry ? entry[0] : null;
  }
  return 'Ojas (Supreme Essence)';
});

// Text index to support full-text search across Dhatu names and descriptions
dhatuSchema.index({
  name: 'text',
  'sanskritName.iast': 'text',
  generalDescription: 'text',
  westernCorrelation: 'text'
});

export const Dhatu = mongoose.model('Dhatu', dhatuSchema);

export default Dhatu;
