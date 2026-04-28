import express from 'express';
import { 
  getMyTimesheet, 
  getAllTimesheets, 
  createTimesheetEntry, 
  updateTimesheetEntry, 
  approveTimesheetEntry, 
  deleteTimesheetEntry,
  getTimesheetHistory,
  bulkApproveTimesheets,
  bulkCreateTimesheet,
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity
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

// GET /api/timesheet/activities - Get all active activities
router.get('/activities', requireAuth, generalApiLimiter, getActivities);

// POST /api/timesheet/activities - Create new activity (admin/HR only)
router.post('/activities', requireAuth, checkPermission('timesheet', 'create'), generalApiLimiter, createActivity);

// PUT /api/timesheet/activities/:id - Update activity (admin/HR only)
router.put('/activities/:id', requireAuth, checkPermission('timesheet', 'edit'), generalApiLimiter, updateActivity);

// DELETE /api/timesheet/activities/:id - Delete activity (admin/HR only)
router.delete('/activities/:id', requireAuth, checkPermission('timesheet', 'delete'), generalApiLimiter, deleteActivity);

// POST /api/timesheet - Create new timesheet entry
router.post('/', requireAuth, checkPermission('timesheet', 'create'), timesheetSubmissionLimiter, createTimesheetEntry);

// POST /api/timesheet/bulk-create - Bulk create timesheet entries
router.post('/bulk-create', requireAuth, checkPermission('timesheet', 'create'), timesheetSubmissionLimiter, bulkCreateTimesheet);

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
