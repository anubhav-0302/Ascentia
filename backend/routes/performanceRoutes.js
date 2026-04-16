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

const router = express.Router();

// Performance Cycles
router.get('/cycles', getPerformanceCycles);
router.post('/cycles', createPerformanceCycle);
router.delete('/cycles/:id', deletePerformanceCycle);

// Performance Goals
router.get('/goals', getPerformanceGoals);
router.post('/goals', createPerformanceGoal);
router.put('/goals/:id', updatePerformanceGoal);

// Performance Reviews
router.get('/reviews', getPerformanceReviews);
router.post('/reviews', createPerformanceReview);
router.post('/reviews/simple', createSimpleReview);
router.get('/reviews/employee/:employeeId', getEmployeeReviews);
router.put('/reviews/:id', updatePerformanceReview);

export default router;
