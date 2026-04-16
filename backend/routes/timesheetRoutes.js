import express from 'express';
import { 
  getMyTimesheet, 
  getAllTimesheets, 
  createTimesheetEntry, 
  updateTimesheetEntry, 
  approveTimesheetEntry, 
  deleteTimesheetEntry,
  getTimesheetHistory,
  bulkApproveTimesheets
} from '../timesheetController.js';
import { requireAuth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';
import {
  timesheetSubmissionLimiter,
  timesheetApprovalLimiter,
  generalApiLimiter
} from '../middleware/rateLimiter.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 TIMESHEET ROUTE:", req.method, req.url);
  next();
});

// GET /api/timesheet - Get current user's timesheet
router.get('/', requireAuth, generalApiLimiter, getMyTimesheet);

// GET /api/timesheet/all - Get all timesheets
router.get('/all', requireAuth, checkPermission('timesheet', 'view'), generalApiLimiter, getAllTimesheets);

// POST /api/timesheet - Create new timesheet entry
router.post('/', requireAuth, checkPermission('timesheet', 'create'), timesheetSubmissionLimiter, createTimesheetEntry);

// PUT /api/timesheet/:id - Update timesheet entry
router.put('/', requireAuth, checkPermission('timesheet', 'edit'), timesheetSubmissionLimiter, updateTimesheetEntry);

// PUT /api/timesheet/:id/approve - Approve/reject timesheet entry
router.put('/:id/approve', requireAuth, checkPermission('timesheet', 'approve'), timesheetApprovalLimiter, approveTimesheetEntry);

// DELETE /api/timesheet/:id - Delete timesheet entry
router.delete('/:id', requireAuth, checkPermission('timesheet', 'delete'), timesheetSubmissionLimiter, deleteTimesheetEntry);

// GET /api/timesheet/history - Get timesheet history for export
router.get('/history', requireAuth, checkPermission('timesheet', 'view'), generalApiLimiter, getTimesheetHistory);

// POST /api/timesheet/bulk-approve - Bulk approve/reject timesheet entries
router.post('/bulk-approve', requireAuth, checkPermission('timesheet', 'approve'), timesheetApprovalLimiter, bulkApproveTimesheets);

export default router;
