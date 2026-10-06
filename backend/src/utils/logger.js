
const levels = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
};

const formatMessage = (level, message, meta = null) => {
  const timestamp = new Date().toISOString();
  const metaString = meta ? ` | ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
  return `[${timestamp}] [${level}] ${message}${metaString}`;
};

export const logger = {
  info: (message, meta) => {
    console.log(formatMessage(levels.INFO, message, meta));
  },
  warn: (message, meta) => {
    console.warn(formatMessage(levels.WARN, message, meta));
  },
  error: (message, meta) => {
    console.error(formatMessage(levels.ERROR, message, meta));
  },
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatMessage(levels.DEBUG, message, meta));
    }
  }
};

export default logger;
