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
import {
  timesheetSubmissionLimiter,
  timesheetApprovalLimiter,
  generalApiLimiter
} from '../middleware/rateLimiter.js';

const router = express.Router();

// GET /api/timesheet - Get current user's timesheet
router.get('/', generalApiLimiter, getMyTimesheet);

// GET /api/timesheet/all - Get all timesheets (admin only)
router.get('/all', generalApiLimiter, getAllTimesheets);

// POST /api/timesheet - Create new timesheet entry
router.post('/', timesheetSubmissionLimiter, createTimesheetEntry);

// PUT /api/timesheet/:id - Update timesheet entry
router.put('/', timesheetSubmissionLimiter, updateTimesheetEntry);

// PUT /api/timesheet/:id/approve - Approve/reject timesheet entry
router.put('/:id/approve', timesheetApprovalLimiter, approveTimesheetEntry);

// DELETE /api/timesheet/:id - Delete timesheet entry
router.delete('/:id', timesheetSubmissionLimiter, deleteTimesheetEntry);

// GET /api/timesheet/history - Get timesheet history for export
router.get('/history', generalApiLimiter, getTimesheetHistory);

// POST /api/timesheet/bulk-approve - Bulk approve/reject timesheet entries
router.post('/bulk-approve', timesheetApprovalLimiter, bulkApproveTimesheets);

export default router;
