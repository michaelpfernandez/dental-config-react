import { loggingConfig } from '../config/logging';
import { winstonLogger } from './winstonLogger';

const shouldLogHttp = (): boolean => {
  return loggingConfig.enabled && loggingConfig.serverLogging.httpRequests;
};

const shouldLogAuth = (): boolean => {
  return loggingConfig.enabled && loggingConfig.serverLogging.authEvents;
};

const shouldLogDb = (): boolean => {
  return loggingConfig.enabled && loggingConfig.serverLogging.dbOperations;
};

export const serverLogger = {
  debug: (message: string, ...args: any[]): void => {
    winstonLogger.debug(message, ...args);
  },

  info: (message: string, ...args: any[]): void => {
    winstonLogger.info(message, ...args);
  },

  warn: (message: string, ...args: any[]): void => {
    winstonLogger.warn(message, ...args);
  },

  error: (message: string | Error, ...args: any[]): void => {
    const errorMessage = message instanceof Error ? message.message : message;
    winstonLogger.error(errorMessage, ...args);
    if (message instanceof Error && message.stack) {
      winstonLogger.error(message.stack);
    }
  },

  http: (message: string, ...args: any[]): void => {
    if (shouldLogHttp()) {
      winstonLogger.info(`[HTTP] ${message}`, ...args);
    }
  },

  // Special method for API request logging
  request: (req: any, message?: string): void => {
    if (shouldLogHttp()) {
      const msg = `${req.method} ${req.url}${message ? ` - ${message}` : ''}`;
      winstonLogger.info(`[HTTP] ${msg}`);
    }
  },

  // Special method for API response logging
  response: (req: any, res: any, message?: string): void => {
    if (shouldLogHttp()) {
      const msg = `${req.method} ${req.url} - ${res.statusCode}${message ? ` - ${message}` : ''}`;
      winstonLogger.info(`[HTTP] ${msg}`);
    }
  },

  // Database operation logging
  db: (operation: string, collection: string, message?: string): void => {
    if (shouldLogDb()) {
      const msg = `${operation} ${collection}${message ? ` - ${message}` : ''}`;
      winstonLogger.info(`[DB] ${msg}`);
    }
  },

  // Authentication event logging
  auth: (event: string, username: string, message?: string): void => {
    if (shouldLogAuth()) {
      const msg = `${event} - ${username}${message ? ` - ${message}` : ''}`;
      winstonLogger.info(`[AUTH] ${msg}`);
    }
  },
};
