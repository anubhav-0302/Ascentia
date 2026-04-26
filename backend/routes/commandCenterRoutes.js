import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';
import { getSystemMetrics, getIntegrations, getRecentActivities } from '../controllers/commandCenterController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/command-center/metrics - Get system metrics
router.get('/metrics', checkPermission('command_center', 'read'), getSystemMetrics);

// GET /api/command-center/integrations - Get integrations
router.get('/integrations', checkPermission('command_center', 'read'), getIntegrations);

// GET /api/command-center/activities - Get recent activities
router.get('/activities', checkPermission('command_center', 'read'), getRecentActivities);

export default router;
