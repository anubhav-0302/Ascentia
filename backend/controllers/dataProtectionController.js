import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
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
}

// Get all backups
export const getBackups = async (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return res.json({
        success: true,
        data: []
      });
    }

    const files = fs.readdirSync(BACKUP_DIR);
    const backups = files
      .filter(file => file.startsWith('dev-db-backup-'))
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        const metadataPath = filePath.replace(/\.(db|db\.gz)$/, '.json');
        
        let metadata = null;
        if (fs.existsSync(metadataPath)) {
          metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        }

        return {
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime,
          metadata
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: backups
    });
  } catch (error) {
    console.error('❌ Error getting backups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get backups',
      error: error.message
    });
  }
};

// Create manual backup
export const createManualBackup = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Backup description is required'
      });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `dev-db-backup-${timestamp}-${description.replace(/\s+/g, '-')}.db.gz`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    // Compress the database
    const readStream = fs.createReadStream(DB_PATH);
    const writeStream = fs.createWriteStream(backupPath);
    const gzip = zlib.createGzip();

    await pipeline(readStream, gzip, writeStream);

    // Get sizes for metadata
    const originalSize = fs.statSync(DB_PATH).size;
    const compressedSize = fs.statSync(backupPath).size;

    // Create metadata file
    const metadata = {
      timestamp: new Date().toISOString(),
      description,
      originalSize,
      compressedSize,
      compressionRatio: (1 - compressedSize / originalSize).toFixed(2),
      createdBy: req.user?.email || 'system'
    };

    const metadataPath = backupPath.replace(/\.db\.gz$/, '.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(`✅ Backup created: ${backupName}`);

    res.json({
      success: true,
      message: 'Backup created successfully',
      data: {
        filename: backupName,
        size: compressedSize,
        createdAt: new Date().toISOString(),
        metadata
      }
    });
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create backup',
      error: error.message
    });
  }
};

// Restore from backup (requires password verification)
export const restoreFromBackup = async (req, res) => {
  try {
    const { filename, password } = req.body;

    if (!filename || !password) {
      return res.status(400).json({
        success: false,
        message: 'Filename and password are required'
      });
    }

    // Verify admin password
    const admin = await prisma.employee.findFirst({
      where: { email: req.user?.email }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Verify backup file exists
    const backupPath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found'
      });
    }

    // Create backup of current database before restoring
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const preRestoreBackup = path.join(BACKUP_DIR, `dev-db-backup-${timestamp}-pre-restore.db.gz`);
    
    const readStream = fs.createReadStream(DB_PATH);
    const writeStream = fs.createWriteStream(preRestoreBackup);
    const gzip = zlib.createGzip();
    await pipeline(readStream, gzip, writeStream);

    // Restore from backup
    if (filename.endsWith('.gz')) {
      // Decompress
      const gunzip = zlib.createGunzip();
      const readBackup = fs.createReadStream(backupPath);
      const writeDb = fs.createWriteStream(DB_PATH);
      await pipeline(readBackup, gunzip, writeDb);
    } else {
      // Copy directly
      fs.copyFileSync(backupPath, DB_PATH);
    }

    console.log(`✅ Database restored from: ${filename}`);

    res.json({
      success: true,
      message: 'Database restored successfully',
      data: {
        restoredFrom: filename,
        preRestoreBackup: path.basename(preRestoreBackup),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error restoring backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore backup',
      error: error.message
    });
  }
};

// Delete employee with password verification
export const deleteEmployeeWithProtection = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, reason } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete an employee'
      });
    }

    // Verify admin password
    const admin = await prisma.employee.findFirst({
      where: { email: req.user?.email }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password - employee not deleted'
      });
    }

    // Get employee to delete
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Create backup before deletion
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const preDeleteBackup = path.join(BACKUP_DIR, `dev-db-backup-${timestamp}-pre-delete-${employee.email}.db.gz`);
    
    const readStream = fs.createReadStream(DB_PATH);
    const writeStream = fs.createWriteStream(preDeleteBackup);
    const gzip = zlib.createGzip();
    await pipeline(readStream, gzip, writeStream);

    // Create deletion log
    const deletionLog = {
      timestamp: new Date().toISOString(),
      deletedEmployee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role
      },
      deletedBy: admin.email,
      reason: reason || 'No reason provided',
      backupCreated: path.basename(preDeleteBackup)
    };

    const logPath = path.join(BACKUP_DIR, `deletion-log-${timestamp}.json`);
    fs.writeFileSync(logPath, JSON.stringify(deletionLog, null, 2));

    // Delete employee
    await prisma.employee.delete({
      where: { id: parseInt(id) }
    });

    console.log(`✅ Employee deleted: ${employee.email} (backup created)`);

    res.json({
      success: true,
      message: 'Employee deleted successfully',
      data: {
        deletedEmployee: employee.email,
        backupCreated: path.basename(preDeleteBackup),
        deletionLogPath: path.basename(logPath)
      }
    });
  } catch (error) {
    console.error('❌ Error deleting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message
    });
  }
};

// Get deletion logs
export const getDeletionLogs = async (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return res.json({
        success: true,
        data: []
      });
    }

    const files = fs.readdirSync(BACKUP_DIR);
    const logs = files
      .filter(file => file.startsWith('deletion-log-'))
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return content;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('❌ Error getting deletion logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get deletion logs',
      error: error.message
    });
  }
};

// Get database statistics
export const getDatabaseStats = async (req, res) => {
  try {
    const employeeCount = await prisma.employee.count();
    const leaveCount = await prisma.leaveRequest.count();
    const timesheetCount = await prisma.timesheet.count();
    const documentCount = await prisma.document.count();

    const dbSize = fs.statSync(DB_PATH).size;
    const backupCount = fs.existsSync(BACKUP_DIR) ? fs.readdirSync(BACKUP_DIR).length : 0;

    res.json({
      success: true,
      data: {
        records: {
          employees: employeeCount,
          leaveRequests: leaveCount,
          timesheets: timesheetCount,
          documents: documentCount
        },
        database: {
          size: dbSize,
          sizeInMB: (dbSize / 1024 / 1024).toFixed(2),
          path: DB_PATH
        },
        backups: {
          count: backupCount,
          location: BACKUP_DIR
        }
      }
    });
  } catch (error) {
    console.error('❌ Error getting database stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get database stats',
      error: error.message
    });
  }
};
