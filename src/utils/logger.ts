import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

let configLogger;

if (isProduction) {
  configLogger = pino({ level: 'info' });
} else {
  configLogger = {
    debug: (...args: unknown[]) => !isTest && console.debug(`[DEBUG]`, ...args),
    info: (...args: unknown[]) => !isTest && console.info(`[INFO]`, ...args),
    warn: (...args: unknown[]) => !isTest && console.warn(`[WARN]`, ...args),
    error: (...args: unknown[]) => !isTest && console.error(`[ERROR]`, ...args),
    fatal: (...args: unknown[]) => !isTest && console.error(`[FATAL]`, ...args),
  };
}

export const logger = configLogger;