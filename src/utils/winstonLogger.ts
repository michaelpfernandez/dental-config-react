import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { loggingConfig } from '../config/logging';

// Define custom log levels and colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to Winston
winston.addColors(colors);

// Custom format for log messages
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

// JSON format for file logging
const jsonFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

// Create log directory if it doesn't exist
const logDir = 'logs';

// Define transports array with proper type
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: logFormat,
    level: loggingConfig.level,
  }),
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  // Separate files for different log levels
  const fileTransport = new DailyRotateFile({
    dirname: path.join(logDir, 'combined'),
    filename: 'dental-plan-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
    maxSize: '20m',
    format: jsonFormat,
    level: 'info',
  }) as unknown as winston.transport;

  const errorTransport = new DailyRotateFile({
    dirname: path.join(logDir, 'error'),
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
    maxSize: '20m',
    format: jsonFormat,
    level: 'error',
  }) as unknown as winston.transport;

  transports.push(fileTransport, errorTransport);
}

// Create Winston logger instance
export const winstonLogger = winston.createLogger({
  levels,
  format: logFormat,
  transports,
  // Don't exit on uncaught errors
  exitOnError: false,
});

// Create a stream object for Morgan integration
export const stream = {
  write: (message: string) => {
    winstonLogger.http(message.trim());
  },
};
