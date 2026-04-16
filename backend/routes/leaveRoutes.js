import express from 'express';
import { getMyLeaveRequests, getAllLeaveRequests, createLeaveRequest, updateLeaveRequestStatus, cancelLeaveRequest } from '../leaveController.js';
import { requireAuth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 LEAVE ROUTE:", req.method, req.url);
  next();
});

// GET /api/leave/my - Get my leave requests (authenticated users only)
router.get('/my', requireAuth, getMyLeaveRequests);

// GET /api/leave - Get all leave requests
router.get('/', requireAuth, checkPermission('leave', 'view'), getAllLeaveRequests);

// POST /api/leave - Create leave request (authenticated users only)
router.post('/', requireAuth, createLeaveRequest);

// PUT /api/leave/:id - Update leave request status (approve action)
router.put('/:id', requireAuth, checkPermission('leave', 'approve'), updateLeaveRequestStatus);

// DELETE /api/leave/:id - Cancel leave request (employee only, pending only)
router.delete('/:id', requireAuth, cancelLeaveRequest);

export default router;
