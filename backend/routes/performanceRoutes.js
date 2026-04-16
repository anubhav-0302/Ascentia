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
import { requireAuth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 PERFORMANCE ROUTE:", req.method, req.url);
  next();
});

// Performance Cycles
router.get('/cycles', requireAuth, checkPermission('performance', 'view'), getPerformanceCycles);
router.post('/cycles', requireAuth, checkPermission('performance', 'create'), createPerformanceCycle);
router.delete('/cycles/:id', requireAuth, checkPermission('performance', 'delete'), deletePerformanceCycle);

// Performance Goals
router.get('/goals', requireAuth, checkPermission('performance', 'view'), getPerformanceGoals);
router.post('/goals', requireAuth, checkPermission('performance', 'create'), createPerformanceGoal);
router.put('/goals/:id', requireAuth, checkPermission('performance', 'edit'), updatePerformanceGoal);

// Performance Reviews
router.get('/reviews', requireAuth, checkPermission('performance', 'view'), getPerformanceReviews);
router.post('/reviews', requireAuth, checkPermission('performance', 'create'), createPerformanceReview);
router.post('/reviews/simple', requireAuth, createSimpleReview);
router.get('/reviews/employee/:employeeId', requireAuth, getEmployeeReviews);
router.put('/reviews/:id', requireAuth, checkPermission('performance', 'edit'), updatePerformanceReview);

export default router;
