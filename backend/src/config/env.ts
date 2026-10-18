import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  GAME_TITLE: process.env.GAME_TITLE || 'SPACE SHOOTER ODYSSEY',
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'odyssey_jwt_secret_dev_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY || 'admin_master_secret_odyssey_2026',
  VELOOP_MODE: (process.env.VELOOP_MODE || 'development_mock') as 'development_mock' | 'sandbox' | 'production',
  VELOOP_API_KEY: process.env.VELOOP_API_KEY || 'mock-veloop-api-key-internal',
  VELOOP_REWARDS_ENABLED: process.env.VELOOP_REWARDS_ENABLED !== 'false',
  VELOOP_MAX_DAILY_COINS: Number(process.env.VELOOP_MAX_DAILY_COINS) || 500,
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 500
};
