import { execSync } from 'child_process';
import { createBackup } from './backup-system.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Safe Migration System\n');

// Check what type of migration is being requested
const command = process.argv[2];
const params = process.argv.slice(3);

async function safeMigrate() {
  // Always create backup before any migration
  console.log('📦 Creating pre-migration backup...');
  const backupPath = createBackup('pre-migration');
  console.log(`✅ Backup saved to: ${path.basename(backupPath)}\n`);
  
  // Check if this is a destructive operation
  const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Warn about potential issues
  if (command === 'push') {
    console.log('⚠️  WARNING: Using "db push" can cause data loss!');
    console.log('💡 Consider using "migrate dev" instead for safer migrations\n');
    
    // Check for destructive changes
    const hasNewRequiredFields = schema.includes('@@map') || 
                                schema.match(/\w+\s+\w+[^?]/g)?.length > 0;
    
    if (hasNewRequiredFields) {
      console.log('🚨 DETECTED: Schema has changes that might cause data loss');
      console.log('📝 Recommended: Use "npx prisma migrate dev --name <migration-name>"\n');
      
      const proceed = process.argv.includes('--force') || 
                     process.argv.includes('-f');
      
      if (!proceed) {
        console.log('❌ Migration cancelled. Use --force to proceed anyway.');
        console.log('💡 Or run: node safe-migrate.js dev --name add-settings');
        process.exit(1);
      }
    }
  }
  
  // Execute the migration
  try {
    const fullCommand = `npx prisma ${command} ${params.join(' ')}`;
    console.log(`🔄 Running: ${fullCommand}\n`);
    
    execSync(fullCommand, { stdio: 'inherit', cwd: path.dirname(__dirname) });
    
    console.log('\n✅ Migration completed successfully!');
    console.log('💾 Your data is backed up if anything went wrong');
    
  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('📦 Your pre-migration backup is safe at:', path.basename(backupPath));
    console.error('\nTo restore:');
    console.error(`  node scripts/backup-system.js restore ${path.basename(backupPath)}`);
    process.exit(1);
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  if (!command) {
    console.log(`
Safe Migration Tool - Always backs up before migrating

Usage: node safe-migrate.js <command> [options]

Commands:
  dev --name <name>     - Create and apply migration (SAFEST)
  push [--force]        - Push schema changes (RISKY - requires --force for destructive changes)
  studio                 - Open Prisma Studio
  generate               - Generate Prisma Client
  status                 - Check migration status

Examples:
  node safe-migrate.js dev --name add-settings-column
  node safe-migrate.js push --force  # Only if you know what you're doing!
    `);
    process.exit(0);
  }
  
  safeMigrate();
}
