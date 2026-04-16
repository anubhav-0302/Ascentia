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
import { requireAuth, authorize } from '../middleware/auth.js';
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

// GET /api/timesheet/all - Get all timesheets (admin/manager only)
router.get('/all', requireAuth, authorize('admin', 'manager'), generalApiLimiter, getAllTimesheets);

// POST /api/timesheet - Create new timesheet entry (authenticated users)
router.post('/', requireAuth, timesheetSubmissionLimiter, createTimesheetEntry);

// PUT /api/timesheet/:id - Update timesheet entry (authenticated users)
router.put('/', requireAuth, timesheetSubmissionLimiter, updateTimesheetEntry);

// PUT /api/timesheet/:id/approve - Approve/reject timesheet entry (admin/manager only)
router.put('/:id/approve', requireAuth, authorize('admin', 'manager'), timesheetApprovalLimiter, approveTimesheetEntry);

// DELETE /api/timesheet/:id - Delete timesheet entry (authenticated users)
router.delete('/:id', requireAuth, timesheetSubmissionLimiter, deleteTimesheetEntry);

// GET /api/timesheet/history - Get timesheet history for export (admin/manager only)
router.get('/history', requireAuth, authorize('admin', 'manager'), generalApiLimiter, getTimesheetHistory);

// POST /api/timesheet/bulk-approve - Bulk approve/reject timesheet entries (admin/manager only)
router.post('/bulk-approve', requireAuth, authorize('admin', 'manager'), timesheetApprovalLimiter, bulkApproveTimesheets);

export default router;
