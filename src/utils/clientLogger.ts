import * as log from 'loglevel';
import { loggingConfig } from '../config/logging';

// Initialize logger with production settings
log.setLevel(process.env.NODE_ENV === 'production' ? log.levels.WARN : log.levels.DEBUG);

// Enable/disable based on config
if (!loggingConfig.enabled) {
  log.setLevel(log.levels.SILENT);
}

// Creating a mock clientLogger to avoid import errors
export const clientLogger = {
  info: (message: string, data?: any) => {},
};
