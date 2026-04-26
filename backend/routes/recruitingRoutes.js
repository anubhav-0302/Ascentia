import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';
import { getJobPositions, getCandidates, getRecruitingMetrics } from '../controllers/recruitingController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/recruiting/positions - Get all job positions
router.get('/positions', checkPermission('recruiting', 'read'), getJobPositions);

// GET /api/recruiting/candidates - Get all candidates
router.get('/candidates', checkPermission('recruiting', 'read'), getCandidates);

// GET /api/recruiting/metrics - Get recruiting metrics
router.get('/metrics', checkPermission('recruiting', 'read'), getRecruitingMetrics);

export default router;
