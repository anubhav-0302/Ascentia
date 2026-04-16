#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = path.join(__dirname, '../backups');
const DB_PATH = path.join(__dirname, '../dev.db');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
}

async function createBackup(description = 'manual') {
  try {
    // Check if database exists
    if (!fs.existsSync(DB_PATH)) {
      console.error('❌ Database file not found:', DB_PATH);
      process.exit(1);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `dev-db-backup-${timestamp}-${description}.db.gz`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    console.log(`📦 Creating backup: ${backupName}`);
    console.log(`📍 Source: ${DB_PATH}`);
    console.log(`📍 Destination: ${backupPath}`);

    // Compress the database
    const readStream = fs.createReadStream(DB_PATH);
    const writeStream = fs.createWriteStream(backupPath);
    const gzip = zlib.createGzip();

    await pipeline(readStream, gzip, writeStream);

    // Get sizes for metadata
    const originalSize = fs.statSync(DB_PATH).size;
    const compressedSize = fs.statSync(backupPath).size;
    const compressionRatio = (1 - compressedSize / originalSize).toFixed(2);

    // Create metadata file
    const metadata = {
      timestamp: new Date().toISOString(),
      description,
      originalSize,
      compressedSize,
      compressionRatio,
      originalSizeKB: (originalSize / 1024).toFixed(2),
      compressedSizeKB: (compressedSize / 1024).toFixed(2),
      createdBy: 'system'
    };

    const metadataPath = backupPath.replace('.db.gz', '.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(`\n✅ Backup created successfully!`);
    console.log(`📊 Original size: ${metadata.originalSizeKB} KB`);
    console.log(`💾 Compressed size: ${metadata.compressedSizeKB} KB`);
    console.log(`📉 Compression ratio: ${compressionRatio * 100}% saved`);
    console.log(`📅 Timestamp: ${metadata.timestamp}`);
    console.log(`📝 Description: ${description}`);
    console.log(`\n📁 Backup file: ${backupName}`);
    console.log(`📁 Metadata file: ${path.basename(metadataPath)}`);
    console.log(`\n✨ Backup is ready for restoration!`);

    return backupPath;
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

// Run the backup
const description = process.argv[2] || 'complete-app-backup-all-data';
createBackup(description);
