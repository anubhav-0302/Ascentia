import express from 'express';
import {
  getBackups,
  createManualBackup,
  restoreFromBackup,
  deleteEmployeeWithProtection,
  getDeletionLogs,
  getDatabaseStats
} from '../controllers/dataProtectionController.js';
import { requireAuth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔒 DATA PROTECTION ROUTE:", req.method, req.url);
  next();
});

// GET /api/data-protection/backups - Get all backups (admin only)
router.get('/backups', requireAuth, authorize('admin'), getBackups);

// POST /api/data-protection/backups - Create manual backup (admin only)
router.post('/backups', requireAuth, authorize('admin'), createManualBackup);

// POST /api/data-protection/restore - Restore from backup (admin only, requires password)
router.post('/restore', requireAuth, authorize('admin'), restoreFromBackup);

// DELETE /api/data-protection/employees/:id - Delete employee with password (admin only)
router.delete('/employees/:id', requireAuth, authorize('admin'), deleteEmployeeWithProtection);

// GET /api/data-protection/deletion-logs - Get deletion logs (admin only)
router.get('/deletion-logs', requireAuth, authorize('admin'), getDeletionLogs);

// GET /api/data-protection/stats - Get database statistics (admin only)
router.get('/stats', requireAuth, authorize('admin'), getDatabaseStats);

export default router;
