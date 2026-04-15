import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import cron from 'node-cron';
import zlib from 'zlib';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = path.join(__dirname, '../backups');
const DB_PATH = path.join(__dirname, '../dev.db');
const MAX_BACKUPS = 30; // Keep last 30 backups

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create a backup with timestamp (compressed to save space)
async function createBackup(description = 'manual', compress = true) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `dev-db-backup-${timestamp}-${description}${compress ? '.db.gz' : '.db'}`;
  const backupPath = path.join(BACKUP_DIR, backupName);
  
  try {
    if (compress) {
      // Compress the database
      const readStream = fs.createReadStream(DB_PATH);
      const writeStream = fs.createWriteStream(backupPath);
      const gzip = zlib.createGzip();
      
      await pipeline(readStream, gzip, writeStream);
    } else {
      // Copy database file without compression
      fs.copyFileSync(DB_PATH, backupPath);
    }
    
    // Get original size for metadata
    const originalSize = fs.statSync(DB_PATH).size;
    const compressedSize = compress ? fs.statSync(backupPath).size : originalSize;
    
    // Create metadata file
    const metadata = {
      timestamp: new Date().toISOString(),
      description,
      originalSize,
      compressedSize,
      compressionRatio: compress ? (1 - compressedSize / originalSize).toFixed(2) : null,
      employeeCount: getEmployeeCount()
    };
    
    fs.writeFileSync(
      backupPath.replace(compress ? '.db.gz' : '.db', '.meta.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log(`✅ Backup created: ${backupName}`);
    console.log(`📊 Employees in backup: ${metadata.employeeCount}`);
    if (compress) {
      console.log(`💾 Compression: ${(originalSize / 1024).toFixed(2)} KB → ${(compressedSize / 1024).toFixed(2)} KB (${metadata.compressionRatio * 100}% saved)`);
    }
    
    // Clean up old backups
    cleanupOldBackups();
    
    return backupPath;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

// Get current employee count
function getEmployeeCount() {
  try {
    const result = execSync('node -e "import prisma from \'./lib/prisma.js\'; prisma.employee.count().then(c => { console.log(c); prisma.$disconnect(); })"', 
      { encoding: 'utf8', cwd: path.dirname(__dirname) });
    return parseInt(result.trim());
  } catch {
    return 0;
  }
}

// Clean up old backups (keep only MAX_BACKUPS)
function cleanupOldBackups() {
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.db'))
    .map(f => ({
      name: f,
      path: path.join(BACKUP_DIR, f),
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtime
    }))
    .sort((a, b) => b.time - a.time);
  
  if (backups.length > MAX_BACKUPS) {
    const toDelete = backups.slice(MAX_BACKUPS);
    toDelete.forEach(backup => {
      fs.unlinkSync(backup.path);
      // Also delete metadata file
      const metaPath = backup.path.replace('.db', '.meta.json');
      if (fs.existsSync(metaPath)) {
        fs.unlinkSync(metaPath);
      }
      console.log(`🗑️  Deleted old backup: ${backup.name}`);
    });
  }
}

// List all backups
function listBackups() {
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.db'))
    .map(f => {
      const metaPath = path.join(BACKUP_DIR, f.replace('.db', '.meta.json'));
      const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf8')) : null;
      return {
        name: f,
        timestamp: meta?.timestamp || fs.statSync(path.join(BACKUP_DIR, f)).mtime.toISOString(),
        description: meta?.description || 'unknown',
        size: meta?.size || fs.statSync(path.join(BACKUP_DIR, f)).size,
        employeeCount: meta?.employeeCount || 'unknown'
      };
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  console.log('\n📦 Available Backups:');
  backups.forEach((b, i) => {
    console.log(`${i + 1}. ${b.name}`);
    console.log(`   📅 ${new Date(b.timestamp).toLocaleString()}`);
    console.log(`   📝 ${b.description}`);
    console.log(`   👥 ${b.employeeCount} employees`);
    console.log(`   💾 ${(b.size / 1024 / 1024).toFixed(2)} MB\n`);
  });
  
  return backups;
}

// Restore from backup
function restoreFromBackup(backupName) {
  const backupPath = path.join(BACKUP_DIR, backupName);
  
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Backup not found: ${backupName}`);
    return false;
  }
  
  // Create a backup before restoring
  createBackup('pre-restore');
  
  try {
    // Stop any running processes that might be using the DB
    console.log('⚠️  Make sure the server is stopped before restoring...');
    
    // Copy backup to main database
    fs.copyFileSync(backupPath, DB_PATH);
    
    console.log(`✅ Restored from: ${backupName}`);
    return true;
  } catch (error) {
    console.error('❌ Restore failed:', error);
    return false;
  }
}

// Setup automatic daily backups
function setupScheduledBackups() {
  // Run every day at 2 AM
  cron.schedule('0 2 * * *', () => {
    console.log('🔄 Creating scheduled daily backup...');
    createBackup('daily-auto');
  });
  
  console.log('⏰ Scheduled daily backups at 2:00 AM');
}

// Export functions
export {
  createBackup,
  listBackups,
  restoreFromBackup,
  setupScheduledBackups,
  cleanupOldBackups
};

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const param = process.argv[3];
  
  switch (command) {
    case 'create':
      createBackup(param || 'manual');
      break;
    case 'list':
      listBackups();
      break;
    case 'restore':
      if (!param) {
        console.error('❌ Please specify backup name to restore');
        process.exit(1);
      }
      restoreFromBackup(param);
      break;
    case 'schedule':
      setupScheduledBackups();
      break;
    default:
      console.log(`
Usage: node backup-system.js <command> [parameter]

Commands:
  create [description]  - Create a new backup
  list                  - List all backups
  restore <backup>      - Restore from backup
  schedule              - Start scheduled backups
      `);
  }
}
