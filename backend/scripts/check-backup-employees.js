#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import zlib from 'zlib';
import { createReadStream, createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_FILE = path.join(__dirname, '../backups/dev-db-backup-2026-04-16T17-51-42-170Z-complete-app-backup-all-data.db.gz');
const TEMP_DB = path.join(__dirname, '../temp-backup-check.db');

async function checkBackupEmployees() {
  try {
    console.log(`\n📦 BACKUP FILE - EMPLOYEE COUNT\n`);
    console.log(`Backup File: dev-db-backup-2026-04-16T17-51-42-170Z-complete-app-backup-all-data.db.gz`);
    console.log(`Location: backend/backups/\n`);

    // Check if backup file exists
    if (!fs.existsSync(BACKUP_FILE)) {
      console.error('❌ Backup file not found:', BACKUP_FILE);
      process.exit(1);
    }

    console.log('📂 Decompressing backup file...');

    // Decompress the backup
    await new Promise((resolve, reject) => {
      const gunzip = zlib.createGunzip();
      const source = createReadStream(BACKUP_FILE);
      const destination = createWriteStream(TEMP_DB);

      source
        .pipe(gunzip)
        .pipe(destination)
        .on('finish', resolve)
        .on('error', reject);

      source.on('error', reject);
      gunzip.on('error', reject);
    });

    console.log('✅ Backup decompressed successfully\n');

    // Connect to the temporary backup database
    const adapter = new PrismaBetterSqlite3({ url: `file:${TEMP_DB}` });
    const prisma = new PrismaClient({ adapter });

    // Count employees in backup
    const count = await prisma.employee.count();
    console.log(`Total Employees in Backup: ${count}\n`);

    // Get employee list from backup
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true
      },
      orderBy: { id: 'asc' }
    });

    console.log('Employee List in Backup:');
    console.log('─'.repeat(80));
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.name.padEnd(20)} | ${emp.email.padEnd(30)} | ${emp.role.padEnd(10)} | ${emp.status}`);
    });
    console.log('─'.repeat(80));
    console.log(`\n✅ Total in Backup: ${count} employees\n`);

    await prisma.$disconnect();

    // Clean up temporary file
    fs.unlinkSync(TEMP_DB);
    console.log('🧹 Temporary file cleaned up\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    // Clean up on error
    if (fs.existsSync(TEMP_DB)) {
      fs.unlinkSync(TEMP_DB);
    }
    process.exit(1);
  }
}

checkBackupEmployees();
