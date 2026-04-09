import express from 'express';
import { getDashboardStats } from '../dashboardController.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 DASHBOARD ROUTE:", req.method, req.url);
  next();
});

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', getDashboardStats);

export default router;
