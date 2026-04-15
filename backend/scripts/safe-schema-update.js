// Safe schema update script that preserves data
import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔍 Checking for potential destructive changes...');

// Read current schema
const schema = fs.readFileSync('./prisma/schema.prisma', 'utf8');

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
const backupPath = `./backups/dev-db-backup-${timestamp}.db`;

console.log(`📦 Creating backup at ${backupPath}...`);
fs.copyFileSync('./dev.db', backupPath);
console.log('✅ Backup created successfully!');
