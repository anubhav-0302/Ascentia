import express from 'express';
import {
  getUserNotificationsController,
  getUnreadCountController,
  markAsReadController,
  markAllAsReadController,
  clearNotificationsController
} from '../notificationController.js';

const router = express.Router();

// GET /api/notifications - Get user notifications
router.get('/', getUserNotificationsController);

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', getUnreadCountController);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', markAsReadController);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', markAllAsReadController);

// DELETE /api/notifications - Clear all notifications
router.delete('/', clearNotificationsController);

export default router;
