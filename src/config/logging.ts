interface LogConfig {
  // General logging configuration
  level: 'debug' | 'info' | 'warn' | 'error';
  enabled: boolean;

  // Server-specific configuration
  serverLogging: {
    httpRequests: boolean; // Log HTTP requests
    dbOperations: boolean; // Log database operations
    authEvents: boolean; // Log authentication events
  };

  // Client-specific configuration
  clientLogging: {
    stateChanges: boolean; // Log Redux/state management changes
    apiCalls: boolean; // Log API requests/responses
    userActions: boolean; // Log user interactions
  };
}

// Development configuration
const developmentConfig: LogConfig = {
  level: 'debug',
  enabled: true,
  serverLogging: {
    httpRequests: true,
    dbOperations: true,
    authEvents: true,
  },
  clientLogging: {
    stateChanges: true,
    apiCalls: true,
    userActions: true,
  },
};

// Production configuration
const productionConfig: LogConfig = {
  level: 'warn',
  enabled: true,
  serverLogging: {
    httpRequests: true,
    dbOperations: false,
    authEvents: true,
  },
  clientLogging: {
    stateChanges: false,
    apiCalls: true,
    userActions: false,
  },
};

// Test configuration
const testConfig: LogConfig = {
  level: 'error',
  enabled: false,
  serverLogging: {
    httpRequests: false,
    dbOperations: false,
    authEvents: false,
  },
  clientLogging: {
    stateChanges: false,
    apiCalls: false,
    userActions: false,
  },
};

// Select configuration based on environment
const getLoggingConfig = (): LogConfig => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return productionConfig;
    case 'test':
      return testConfig;
    default:
      return developmentConfig;
  }
};

export const loggingConfig = getLoggingConfig();
