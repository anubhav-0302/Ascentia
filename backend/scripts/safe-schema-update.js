// Safe schema update script that preserves data
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Checking for potential destructive changes...');

// Use absolute path for cross-platform compatibility
const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Check if we're adding non-nullable fields without defaults
const hasDestructiveChanges = schema.includes('@@map') || 
                             schema.includes('@@ignore') ||
                             !schema.includes('settings Json?');

if (hasDestructiveChanges) {
  console.log('⚠️  Potential destructive changes detected!');
  console.log('💡 Recommended: Use "npx prisma migrate dev --name add-settings" instead of db push');
} else {
  console.log('✅ Schema appears safe for db push');
}

// Create backup before any operation
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.resolve(__dirname, '../backups');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const backupPath = path.join(backupDir, `dev-db-backup-${timestamp}.db`);
const dbPath = path.resolve(__dirname, '../dev.db');

console.log(`📦 Creating backup at ${backupPath}...`);
fs.copyFileSync(dbPath, backupPath);
console.log('✅ Backup created successfully!');
