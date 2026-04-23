// ============================================================
// Centralized Environment Configuration
// ============================================================
// Single source of truth for all environment variables.
// - Loads .env from an absolute path (works from any CWD).
// - Auto-bootstraps .env from .env.example on first dev run.
// - Fails fast in production if JWT_SECRET is missing / weak.
// - Exports a frozen `env` object; never read process.env elsewhere.
// ============================================================

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const BACKEND_ROOT = path.resolve(__dirname, '..');
const ENV_PATH     = path.join(BACKEND_ROOT, '.env');
const EXAMPLE_PATH = path.join(BACKEND_ROOT, '.env.example');

const NODE_ENV = (process.env.NODE_ENV || 'development').toLowerCase();
const IS_PROD  = NODE_ENV === 'production';

// --- 1. Locate / bootstrap .env --------------------------------------------
if (!fs.existsSync(ENV_PATH)) {
  if (IS_PROD) {
    throw new Error(
      `[config/env] .env file not found at ${ENV_PATH}\n` +
      `Production boot refused. Create a .env file with at minimum JWT_SECRET set.`
    );
  }
  if (fs.existsSync(EXAMPLE_PATH)) {
    fs.copyFileSync(EXAMPLE_PATH, ENV_PATH);
    console.warn(
      `\n⚠️  [config/env] No .env found — copied from .env.example.\n` +
      `    Edit ${ENV_PATH} before deploying to production.\n`
    );
  } else {
    throw new Error(
      `[config/env] Neither .env nor .env.example found in ${BACKEND_ROOT}.\n` +
      `Cannot bootstrap configuration. Please create a .env file.`
    );
  }
}

dotenv.config({ path: ENV_PATH });

// --- 2. Required keys ------------------------------------------------------
const REQUIRED = ['JWT_SECRET'];
const missing  = REQUIRED.filter((k) => !process.env[k] || process.env[k].trim() === '');
if (missing.length) {
  throw new Error(
    `[config/env] Missing required environment variable(s): ${missing.join(', ')}\n` +
    `Set them in ${ENV_PATH}.`
  );
}

// --- 3. Production hardening ----------------------------------------------
const KNOWN_WEAK_SECRETS = new Set([
  'secret',
  'secret123',
  'changeme',
  'password',
  'your-secret-key',
  'your-super-secret-jwt-key',
  'your-super-secret-jwt-key-change-in-production-2024',
]);

const jwt = process.env.JWT_SECRET.trim();

if (IS_PROD) {
  if (KNOWN_WEAK_SECRETS.has(jwt)) {
    throw new Error(
      `[config/env] JWT_SECRET is set to a known-weak / demo value.\n` +
      `Production boot refused. Generate a strong secret, e.g.:\n` +
      `  node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`
    );
  }
  if (jwt.length < 32) {
    throw new Error(
      `[config/env] JWT_SECRET is too short (${jwt.length} chars). ` +
      `Must be at least 32 characters in production.`
    );
  }

  // Warn on demo seed passwords in prod (soft-fail, not hard-throw)
  const demoSeedPwds = ['admin123', 'superadmin123', '123456', 'password'];
  for (const [key, val] of [
    ['ADMIN_PASSWORD', process.env.ADMIN_PASSWORD],
    ['SUPERADMIN_PASSWORD', process.env.SUPERADMIN_PASSWORD],
    ['EMPLOYEE_PASSWORD', process.env.EMPLOYEE_PASSWORD],
  ]) {
    if (val && demoSeedPwds.includes(val)) {
      console.warn(
        `⚠️  [config/env] ${key} is set to a demo default in production. ` +
        `Override it in .env before deploying.`
      );
    }
  }
}

// --- 4. Helpers ------------------------------------------------------------
const asInt = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};
const asBool = (v, d) => {
  if (v === undefined || v === null || v === '') return d;
  return ['true', '1', 'yes', 'on'].includes(String(v).toLowerCase());
};

// --- 5. Build frozen env object -------------------------------------------
export const env = Object.freeze({
  NODE_ENV,
  IS_PROD,

  // Server
  PORT:         asInt(process.env.PORT, 5000),
  CORS_ORIGIN:  process.env.CORS_ORIGIN || '*',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',

  // Auth
  JWT_SECRET:          jwt,
  JWT_EXPIRES_IN:      process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_SALT_ROUNDS:  asInt(process.env.BCRYPT_SALT_ROUNDS, 10),

  // Seed: Super Admin (platform owner, no organization)
  SUPERADMIN_NAME:     process.env.SUPERADMIN_NAME     || 'Super Admin',
  SUPERADMIN_EMAIL:    process.env.SUPERADMIN_EMAIL    || 'superadmin@ascentia.com',
  SUPERADMIN_PASSWORD: process.env.SUPERADMIN_PASSWORD || 'superadmin123',

  // Seed: Default organization admin
  ADMIN_NAME:     process.env.ADMIN_NAME     || 'Admin User',
  ADMIN_EMAIL:    process.env.ADMIN_EMAIL    || 'admin@ascentia.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',

  // Seed: Demo employee
  EMPLOYEE_NAME:     process.env.EMPLOYEE_NAME     || 'John Doe',
  EMPLOYEE_EMAIL:    process.env.EMPLOYEE_EMAIL    || 'employee@ascentia.com',
  EMPLOYEE_PASSWORD: process.env.EMPLOYEE_PASSWORD || '123456',

  // Default organization
  DEFAULT_ORG_NAME: process.env.DEFAULT_ORG_NAME || 'Default Organization',
  DEFAULT_ORG_PLAN: process.env.DEFAULT_ORG_PLAN || 'free',

  // Backup & data protection
  BACKUP_DIR:            process.env.BACKUP_DIR            || './backups',
  MAX_BACKUPS:           asInt(process.env.MAX_BACKUPS, 30),
  BACKUP_SCHEDULE_CRON:  process.env.BACKUP_SCHEDULE_CRON  || '0 2 * * *',
  BACKUP_COMPRESS:       asBool(process.env.BACKUP_COMPRESS, true),

  // Uploads
  UPLOAD_DIR:         process.env.UPLOAD_DIR || './uploads',
  MAX_UPLOAD_SIZE_MB: asInt(process.env.MAX_UPLOAD_SIZE_MB, 10),

  // Logging
  LOG_DIR:   process.env.LOG_DIR   || './logs',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
});

// --- 6. Startup banner (safe: never logs the secret) -----------------------
const jwtFingerprint = crypto.createHash('sha256').update(env.JWT_SECRET).digest('hex').slice(0, 8);
console.log(
  `✅ [config/env] loaded (NODE_ENV=${env.NODE_ENV}, PORT=${env.PORT}, ` +
  `JWT fingerprint=${jwtFingerprint})`
);

if (!IS_PROD && KNOWN_WEAK_SECRETS.has(env.JWT_SECRET)) {
  console.warn(
    `⚠️  [config/env] Using demo JWT_SECRET — OK for dev, MUST change before production.`
  );
}

export default env;
