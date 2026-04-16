import express from 'express';
import { 
  getPerformanceCycles, 
  createPerformanceCycle,
  deletePerformanceCycle,
  getPerformanceGoals, 
  createPerformanceGoal, 
  updatePerformanceGoal,
  getPerformanceReviews, 
  createPerformanceReview, 
  createSimpleReview,
  getEmployeeReviews,
  updatePerformanceReview
} from '../performanceController.js';
import { requireAuth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 PERFORMANCE ROUTE:", req.method, req.url);
  next();
});

// Performance Cycles - Admin/Manager only
router.get('/cycles', requireAuth, getPerformanceCycles);
router.post('/cycles', requireAuth, authorize('admin', 'manager'), createPerformanceCycle);
router.delete('/cycles/:id', requireAuth, authorize('admin', 'manager'), deletePerformanceCycle);

// Performance Goals - Admin/Manager can create, employees view own
router.get('/goals', requireAuth, getPerformanceGoals);
router.post('/goals', requireAuth, authorize('admin', 'manager'), createPerformanceGoal);
router.put('/goals/:id', requireAuth, authorize('admin', 'manager'), updatePerformanceGoal);

// Performance Reviews - Authenticated users
router.get('/reviews', requireAuth, getPerformanceReviews);
router.post('/reviews', requireAuth, authorize('admin', 'manager'), createPerformanceReview);
router.post('/reviews/simple', requireAuth, createSimpleReview);
router.get('/reviews/employee/:employeeId', requireAuth, getEmployeeReviews);
router.put('/reviews/:id', requireAuth, authorize('admin', 'manager'), updatePerformanceReview);

export default router;
