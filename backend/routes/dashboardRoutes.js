import express from 'express';
import { getDashboardStats } from '../dashboardController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 DASHBOARD ROUTE:", req.method, req.url);
  next();
});

// GET /api/dashboard/stats - Get dashboard statistics (authenticated users only)
router.get('/stats', requireAuth, getDashboardStats);

export default router;
