
export const DHATU_NAMES = Object.freeze({
  RASA: 'Rasa',
  RAKTA: 'Rakta',
  MAMSA: 'Mamsa',
  MEDA: 'Meda',
  ASTHI: 'Asthi',
  MAJJA: 'Majja',
  SHUKRA: 'Shukra'
});

export const DHATU_LIST = Object.freeze(Object.values(DHATU_NAMES));

export const DHATU_ORDER = Object.freeze({
  [DHATU_NAMES.RASA]: 1,
  [DHATU_NAMES.RAKTA]: 2,
  [DHATU_NAMES.MAMSA]: 3,
  [DHATU_NAMES.MEDA]: 4,
  [DHATU_NAMES.ASTHI]: 5,
  [DHATU_NAMES.MAJJA]: 6,
  [DHATU_NAMES.SHUKRA]: 7
});

export const MAHABHUTAS = Object.freeze({
  PRITHVI: 'Prithvi', // Earth
  JALA: 'Jala',       // Water (Ap)
  TEJAS: 'Tejas',     // Fire (Agni)
  VAYU: 'Vayu',       // Air
  AKASHA: 'Akasha'    // Space / Ether
});

export const MAHABHUTA_LIST = Object.freeze(Object.values(MAHABHUTAS));


export const DHATUPOSHANA_NYAYAS = Object.freeze({
  KSHIRA_DADHI: 'Kshira-Dadhi Nyaya',   // Law of direct transformation (milk to curd)
  KEDARI_KULYA: 'Kedari-Kulya Nyaya',   // Law of transmission/irrigation (sequential irrigation channels)
  KHALE_KAPOTA: 'Khale-Kapota Nyaya'    // Law of selective uptake (pigeons selecting grains)
});

export const DHATUPOSHANA_NYAYA_LIST = Object.freeze(Object.values(DHATUPOSHANA_NYAYAS));

/**
 * Classical Dhatu Sarata (Tissue Excellence) assessment categories.
 */
export const SARATA_STATUS = Object.freeze({
  PRAVARA: 'Pravara',   // Superior quality / High excellence
  MADHYAMA: 'Madhyama', // Moderate quality
  AVARA: 'Avara'        // Deficient quality / Poor excellence
});
