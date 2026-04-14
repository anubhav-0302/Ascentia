import express from 'express';
import { 
  getMyTimesheet, 
  getAllTimesheets, 
  createTimesheetEntry, 
  updateTimesheetEntry, 
  approveTimesheetEntry, 
  deleteTimesheetEntry,
  getTimesheetHistory
} from '../timesheetController.js';

const router = express.Router();

// GET /api/timesheet - Get current user's timesheet
router.get('/', getMyTimesheet);

// GET /api/timesheet/all - Get all timesheets (admin only)
router.get('/all', getAllTimesheets);

// POST /api/timesheet - Create new timesheet entry
router.post('/', createTimesheetEntry);

// PUT /api/timesheet/:id - Update timesheet entry
router.put('/:id', updateTimesheetEntry);

// PUT /api/timesheet/:id/approve - Approve/reject timesheet entry
router.put('/:id/approve', approveTimesheetEntry);

// DELETE /api/timesheet/:id - Delete timesheet entry
router.delete('/:id', deleteTimesheetEntry);

// GET /api/timesheet/history - Get timesheet history for export
router.get('/history', getTimesheetHistory);

export default router;
