import * as log from 'loglevel';
import { loggingConfig } from '../config/logging';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Initialize logger with production settings
log.setLevel(process.env.NODE_ENV === 'production' ? log.levels.WARN : log.levels.DEBUG);

// Enable/disable based on config
if (!loggingConfig.enabled) {
  log.setLevel(log.levels.SILENT);
}

// Format messages with timestamp and level
// Format messages with timestamp and level for dental plan operations
const formatMessage = (level: LogLevel, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
};

// Logging control based on configuration
const shouldLogState = (): boolean => {
  return loggingConfig.enabled && loggingConfig.clientLogging.stateChanges;
};

const shouldLogApi = (): boolean => {
  return loggingConfig.enabled && loggingConfig.clientLogging.apiCalls;
};

const shouldLogUser = (): boolean => {
  return loggingConfig.enabled && loggingConfig.clientLogging.userActions;
};

export const clientLogger = {
  debug: (message: string, ...args: any[]): void => {
    log.debug(formatMessage('debug', message), ...args);
  },

  info: (message: string, ...args: any[]): void => {
    log.info(formatMessage('info', message), ...args);
  },

  warn: (message: string, ...args: any[]): void => {
    log.warn(formatMessage('warn', message), ...args);
  },

  error: (message: string | Error, ...args: any[]): void => {
    const errorMessage = message instanceof Error ? message.message : message;
    const errorData = {
      ...args,
      stack: message instanceof Error ? message.stack : undefined,
    };
    log.error(formatMessage('error', errorMessage), errorData);
  },

  // State management logging
  state: (action: string, data?: any): void => {
    if (shouldLogState()) {
      log.info(formatMessage('info', `[STATE] ${action}`), data);
    }
  },

  // API call logging for dental plan operations
  api: (method: string, endpoint: string, message?: string): void => {
    if (shouldLogApi()) {
      const msg = `${method} ${endpoint}${message ? ` - ${message}` : ''}`;
      log.info(formatMessage('info', `[API] ${msg}`));
    }
  },

  // User action logging for dental plan configuration
  user: (action: string, details?: any): void => {
    if (shouldLogUser()) {
      log.info(formatMessage('info', `[USER] ${action}`), details);
    }
  },
};
