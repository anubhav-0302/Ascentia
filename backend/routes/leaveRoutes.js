import express from 'express';
import { getMyLeaveRequests, getAllLeaveRequests, createLeaveRequest, updateLeaveRequestStatus } from '../leaveController.js';
import { requireAuth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 LEAVE ROUTE:", req.method, req.url);
  next();
});

// GET /api/leave/my - Get my leave requests (authenticated users only)
router.get('/my', requireAuth, getMyLeaveRequests);

// GET /api/leave - Get all leave requests (admin only)
router.get('/', requireAuth, authorize('admin'), getAllLeaveRequests);

// POST /api/leave - Create leave request (authenticated users only)
router.post('/', requireAuth, createLeaveRequest);

// PUT /api/leave/:id - Update leave request status (admin only)
router.put('/:id', requireAuth, authorize('admin'), updateLeaveRequestStatus);

export default router;
