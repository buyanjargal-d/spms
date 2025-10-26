import { config } from 'dotenv';

// Load environment variables
config();

export const ENV = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  API_PREFIX: process.env.API_PREFIX || '/api/v1',

  // Database
  DATABASE_URL: process.env.DATABASE_URL!,
  DIRECT_URL: process.env.DIRECT_URL!,

  // JWT
  JWT: {
    SECRET: process.env.JWT_SECRET!,
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // DAN Authentication
  DAN: {
    CLIENT_ID: process.env.DAN_CLIENT_ID,
    CLIENT_SECRET: process.env.DAN_CLIENT_SECRET,
    API_URL: process.env.DAN_API_URL || 'https://dan.gov.mn/api',
    REDIRECT_URI: process.env.DAN_REDIRECT_URI,
    USE_MOCK: process.env.USE_MOCK_DAN === 'true',
  },

  // Firebase
  FCM: {
    PROJECT_ID: process.env.FCM_PROJECT_ID,
    PRIVATE_KEY: process.env.FCM_PRIVATE_KEY,
    CLIENT_EMAIL: process.env.FCM_CLIENT_EMAIL,
    DATABASE_URL: process.env.FCM_DATABASE_URL,
  },

  // Google Maps
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,

  // School Settings
  SCHOOL: {
    NAME: process.env.SCHOOL_NAME || 'School',
    LATITUDE: parseFloat(process.env.SCHOOL_LATITUDE || '47.9186'),
    LONGITUDE: parseFloat(process.env.SCHOOL_LONGITUDE || '106.9178'),
    RADIUS_METERS: parseInt(process.env.SCHOOL_RADIUS_METERS || '150', 10),
  },

  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // CORS
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || './logs',

  // SMS
  SMS: {
    PROVIDER: process.env.SMS_PROVIDER || 'mock',
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  },

  // Helper methods
  isDevelopment: () => process.env.NODE_ENV === 'development',
  isProduction: () => process.env.NODE_ENV === 'production',
  isTest: () => process.env.NODE_ENV === 'test',
};

// Validate required environment variables
export function validateEnv(): void {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const missing = required.filter((key) => {
    const keys = key.split('.');
    let value: any = process.env;
    for (const k of keys) {
      value = value?.[k];
    }
    return !value;
  });

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  console.log('✅ Environment variables validated');
}

export default ENV;
