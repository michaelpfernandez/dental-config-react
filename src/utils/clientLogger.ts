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

// Creating a mock clientLogger to avoid import errors
export const clientLogger = {
  info: (message: string, data?: any) => console.log(message, data),
};
