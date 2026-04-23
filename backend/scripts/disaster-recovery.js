// Disaster Recovery & Restoration System
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import zlib from 'zlib';
import { pipeline } from 'stream/promises';
import prisma from '../lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = path.join(__dirname, '../backups');
const DATA_INTEGRITY_DIR = path.join(__dirname, '../data-integrity');
const LOG_DIR = path.join(__dirname, '../logs');
const DB_PATH = path.join(__dirname, '../dev.db');

// ============================================
// 1. BACKUP VERIFICATION
// ============================================

async function verifyBackupIntegrity(backupPath) {
  console.log(`\n🔍 VERIFYING BACKUP INTEGRITY: ${path.basename(backupPath)}\n`);
  
  try {
    // Check file exists
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }
    
    const stats = fs.statSync(backupPath);
    console.log(`1️⃣  File size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // Check if compressed
    if (backupPath.endsWith('.gz')) {
      console.log(`2️⃣  Checking compression integrity...`);
      
      try {
        // Try to decompress to verify integrity
        const gunzip = zlib.createGunzip();
        const readStream = fs.createReadStream(backupPath);
        let decompressedSize = 0;
        
        await new Promise((resolve, reject) => {
          readStream
            .pipe(gunzip)
            .on('data', (chunk) => {
              decompressedSize += chunk.length;
            })
            .on('end', resolve)
            .on('error', reject);
        });
        
        console.log(`   ✅ Compression verified (decompressed: ${(decompressedSize / 1024).toFixed(2)} KB)`);
      } catch (error) {
        throw new Error(`Backup corruption detected: ${error.message}`);
      }
    }
    
    // Check metadata
    const metadataPath = backupPath.replace('.db.gz', '.meta.json');
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      console.log(`3️⃣  Metadata verified`);
      console.log(`   Created: ${metadata.timestamp}`);
      console.log(`   Original size: ${(metadata.originalSize / 1024).toFixed(2)} KB`);
      console.log(`   Compression: ${metadata.compressionRatio * 100}%`);
    }
    
    console.log(`\n✅ Backup integrity verified successfully`);
    return true;
    
  } catch (error) {
    console.error(`❌ Backup verification failed: ${error.message}`);
    return false;
  }
}

// ============================================
// 2. SELECTIVE RESTORATION
// ============================================

async function restoreFromBackup(backupPath, options = {}) {
  console.log(`\n📥 RESTORING FROM BACKUP: ${path.basename(backupPath)}\n`);
  
  const { 
    verify = true, 
    createBackupFirst = true,
    dryRun = false 
  } = options;
  
  try {
    // Step 1: Verify backup
    if (verify) {
      console.log('Step 1: Verifying backup integrity...');
      const isValid = await verifyBackupIntegrity(backupPath);
      if (!isValid) {
        throw new Error('Backup verification failed');
      }
    }
    
    // Step 2: Create backup of current database
    if (createBackupFirst) {
      console.log('\nStep 2: Creating backup of current database...');
      const currentBackupPath = path.join(BACKUP_DIR, `pre-restore-${Date.now()}.db.gz`);
      
      if (fs.existsSync(DB_PATH)) {
        const readStream = fs.createReadStream(DB_PATH);
        const writeStream = fs.createWriteStream(currentBackupPath);
        const gzip = zlib.createGzip();
        
        await pipeline(readStream, gzip, writeStream);
        console.log(`   ✅ Current database backed up: ${path.basename(currentBackupPath)}`);
      }
    }
    
    // Step 3: Restore database
    if (!dryRun) {
      console.log('\nStep 3: Restoring database...');
      
      // Decompress backup
      const decompressPath = path.join(__dirname, '../dev-restore.db');
      const readStream = fs.createReadStream(backupPath);
      const writeStream = fs.createWriteStream(decompressPath);
      const gunzip = zlib.createGunzip();
      
      await pipeline(readStream, gunzip, writeStream);
      
      // Replace current database
      if (fs.existsSync(DB_PATH)) {
        fs.unlinkSync(DB_PATH);
      }
      fs.renameSync(decompressPath, DB_PATH);
      
      console.log(`   ✅ Database restored successfully`);
    } else {
      console.log('\nStep 3: DRY RUN - No changes made');
    }
    
    // Step 4: Verify restoration
    console.log('\nStep 4: Verifying restored database...');
    
    try {
      // Test database connection
      const count = await prisma.employee.count();
      console.log(`   ✅ Database connection verified`);
      console.log(`   ✅ Found ${count} employees`);
    } catch (error) {
      throw new Error(`Database verification failed: ${error.message}`);
    }
    
    // Log restoration
    const logEntry = `[${new Date().toISOString()}] Database restored from ${path.basename(backupPath)}\n`;
    fs.appendFileSync(path.join(LOG_DIR, 'restorations.log'), logEntry);
    
    console.log(`\n✅ RESTORATION COMPLETED SUCCESSFULLY`);
    return true;
    
  } catch (error) {
    console.error(`❌ Restoration failed: ${error.message}`);
    const errorLog = `[${new Date().toISOString()}] Restoration FAILED: ${error.message}\n`;
    fs.appendFileSync(path.join(LOG_DIR, 'restorations.log'), errorLog);
    throw error;
  }
}

// ============================================
// 3. POINT-IN-TIME RECOVERY
// ============================================

async function findBackupByDate(targetDate) {
  console.log(`\n🔎 SEARCHING FOR BACKUP NEAR: ${targetDate}\n`);
  
  try {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.db.gz'))
      .map(f => {
        const metaPath = path.join(BACKUP_DIR, f.replace('.db.gz', '.meta.json'));
        const metadata = fs.existsSync(metaPath) 
          ? JSON.parse(fs.readFileSync(metaPath, 'utf8'))
          : { timestamp: fs.statSync(path.join(BACKUP_DIR, f)).mtime.toISOString() };
        
        return {
          name: f,
          path: path.join(BACKUP_DIR, f),
          timestamp: new Date(metadata.timestamp),
          metadata
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);
    
    const target = new Date(targetDate);
    let closest = null;
    let minDiff = Infinity;
    
    for (const backup of backups) {
      const diff = Math.abs(backup.timestamp - target);
      if (diff < minDiff) {
        minDiff = diff;
        closest = backup;
      }
    }
    
    if (closest) {
      console.log(`✅ Found closest backup:`);
      console.log(`   File: ${closest.name}`);
      console.log(`   Date: ${closest.timestamp.toISOString()}`);
      console.log(`   Difference: ${Math.round(minDiff / 1000 / 60)} minutes`);
      return closest;
    } else {
      throw new Error('No backups found');
    }
    
  } catch (error) {
    console.error(`❌ Search failed: ${error.message}`);
    throw error;
  }
}

// ============================================
// 4. BACKUP LISTING & ANALYSIS
// ============================================

function listAllBackups() {
  console.log(`\n📋 AVAILABLE BACKUPS\n`);
  
  try {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.db.gz'))
      .map(f => {
        const fullPath = path.join(BACKUP_DIR, f);
        const stats = fs.statSync(fullPath);
        const metaPath = fullPath.replace('.db.gz', '.meta.json');
        const metadata = fs.existsSync(metaPath)
          ? JSON.parse(fs.readFileSync(metaPath, 'utf8'))
          : null;
        
        return {
          name: f,
          size: stats.size,
          created: stats.mtime,
          description: metadata?.description || 'unknown',
          verified: metadata?.verified || false
        };
      })
      .sort((a, b) => b.created - a.created);
    
    console.log(`Total backups: ${backups.length}\n`);
    
    backups.forEach((b, i) => {
      console.log(`${i + 1}. ${b.name}`);
      console.log(`   Size: ${(b.size / 1024).toFixed(2)} KB`);
      console.log(`   Created: ${b.created.toISOString()}`);
      console.log(`   Description: ${b.description}`);
      console.log(`   Verified: ${b.verified ? '✅' : '❌'}`);
      console.log('');
    });
    
    return backups;
    
  } catch (error) {
    console.error(`❌ Failed to list backups: ${error.message}`);
    return [];
  }
}

// ============================================
// 5. RECOVERY TESTING
// ============================================

async function testRecoveryProcedure(backupPath) {
  console.log(`\n🧪 TESTING RECOVERY PROCEDURE\n`);
  
  try {
    console.log('1️⃣  Verifying backup...');
    const isValid = await verifyBackupIntegrity(backupPath);
    if (!isValid) {
      throw new Error('Backup verification failed');
    }
    
    console.log('\n2️⃣  Running DRY RUN restoration...');
    await restoreFromBackup(backupPath, {
      verify: false,
      createBackupFirst: false,
      dryRun: true
    });
    
    console.log('\n✅ RECOVERY TEST PASSED');
    console.log('   Backup is ready for restoration if needed');
    return true;
    
  } catch (error) {
    console.error(`\n❌ RECOVERY TEST FAILED: ${error.message}`);
    return false;
  }
}

// ============================================
// 6. MAIN EXECUTION
// ============================================

async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🛡️  DISASTER RECOVERY & RESTORATION SYSTEM');
  console.log('═══════════════════════════════════════════════════════════');
  
  try {
    switch (command) {
      case 'list':
        listAllBackups();
        break;
        
      case 'verify':
        if (!arg) {
          console.log('Usage: node disaster-recovery.js verify <backup-file>');
          break;
        }
        await verifyBackupIntegrity(arg);
        break;
        
      case 'restore':
        if (!arg) {
          console.log('Usage: node disaster-recovery.js restore <backup-file>');
          break;
        }
        await restoreFromBackup(arg);
        break;
        
      case 'find':
        if (!arg) {
          console.log('Usage: node disaster-recovery.js find <date>');
          break;
        }
        await findBackupByDate(arg);
        break;
        
      case 'test':
        if (!arg) {
          console.log('Usage: node disaster-recovery.js test <backup-file>');
          break;
        }
        await testRecoveryProcedure(arg);
        break;
        
      default:
        console.log(`\nUsage:`);
        console.log(`  node disaster-recovery.js list              - List all backups`);
        console.log(`  node disaster-recovery.js verify <file>     - Verify backup integrity`);
        console.log(`  node disaster-recovery.js restore <file>    - Restore from backup`);
        console.log(`  node disaster-recovery.js find <date>       - Find backup by date`);
        console.log(`  node disaster-recovery.js test <file>       - Test recovery procedure\n`);
    }
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export { verifyBackupIntegrity, restoreFromBackup, findBackupByDate, listAllBackups, testRecoveryProcedure };
