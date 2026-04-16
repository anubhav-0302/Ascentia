import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 ANALYTICS ROUTE:", req.method, req.url);
  next();
});

// GET /api/analytics - Get advanced analytics (role-based)
router.get('/', requireAuth, checkPermission('reports', 'view'), getAnalytics);

export default router;
