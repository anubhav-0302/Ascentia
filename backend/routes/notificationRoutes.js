import express from 'express';
import {
  getUserNotificationsController,
  getUnreadCountController,
  markAsReadController,
  markAllAsReadController,
  clearNotificationsController
} from '../notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 NOTIFICATION ROUTE:", req.method, req.url);
  next();
});

// GET /api/notifications - Get user notifications (authenticated users only)
router.get('/', requireAuth, getUserNotificationsController);

// GET /api/notifications/unread-count - Get unread notification count (authenticated users only)
router.get('/unread-count', requireAuth, getUnreadCountController);

// PUT /api/notifications/:id/read - Mark notification as read (authenticated users only)
router.put('/:id/read', requireAuth, markAsReadController);

// PUT /api/notifications/read-all - Mark all notifications as read (authenticated users only)
router.put('/read-all', requireAuth, markAllAsReadController);

// DELETE /api/notifications - Clear all notifications (authenticated users only)
router.delete('/', requireAuth, clearNotificationsController);

export default router;
