import { winstonLogger } from './winstonLogger';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'http';

interface LoggerConfig {
  level: LogLevel;
  enabled: boolean;
}

const config: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  enabled: process.env.NODE_ENV !== 'production',
};

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  http: 1, // Same priority as info
  warn: 2,
  error: 3,
};

const shouldLog = (messageLevel: LogLevel): boolean => {
  return config.enabled && LEVEL_PRIORITY[messageLevel] >= LEVEL_PRIORITY[config.level];
};

const formatMessage = (level: LogLevel, message: string, ...args: any[]): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
};

export const logger = {
  debug: (message: string, ...args: any[]): void => {
    if (shouldLog('debug')) {
      winstonLogger.debug(formatMessage('debug', message), ...args);
    }
  },

  info: (message: string, ...args: any[]): void => {
    if (shouldLog('info')) {
      winstonLogger.info(formatMessage('info', message), ...args);
    }
  },

  warn: (message: string, ...args: any[]): void => {
    if (shouldLog('warn')) {
      winstonLogger.warn(formatMessage('warn', message), ...args);
    }
  },

  error: (message: string | Error, ...args: any[]): void => {
    if (shouldLog('error')) {
      const errorMessage = message instanceof Error ? message.message : message;
      winstonLogger.error(formatMessage('error', errorMessage), {
        ...args,
        stack: message instanceof Error ? message.stack : undefined,
      });
    }
  },

  // For server-side only
  http: (message: string, ...args: any[]): void => {
    if (shouldLog('info')) {
      winstonLogger.http(formatMessage('http', message), ...args);
    }
  },
};

// Add type safety for development vs production
if (process.env.NODE_ENV === 'development') {
  // Enable all logs in development
  config.level = 'debug';
  config.enabled = true;
} else {
  // Only show warnings and errors in production
  config.level = 'warn';
  config.enabled = true;
}
