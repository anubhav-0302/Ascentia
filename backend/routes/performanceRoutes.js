import express from 'express';
import { 
  getPerformanceCycles, 
  createPerformanceCycle,
  getPerformanceGoals, 
  createPerformanceGoal, 
  updatePerformanceGoal,
  getPerformanceReviews, 
  createPerformanceReview, 
  updatePerformanceReview
} from '../performanceController.js';

const router = express.Router();

// Performance Cycles
router.get('/cycles', getPerformanceCycles);
router.post('/cycles', createPerformanceCycle);

// Performance Goals
router.get('/goals', getPerformanceGoals);
router.post('/goals', createPerformanceGoal);
router.put('/goals/:id', updatePerformanceGoal);

// Performance Reviews
router.get('/reviews', getPerformanceReviews);
router.post('/reviews', createPerformanceReview);
router.put('/reviews/:id', updatePerformanceReview);

export default router;
