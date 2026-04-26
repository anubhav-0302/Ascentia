import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';
import { getWorkflows, createWorkflow } from '../controllers/workflowController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/workflows - Get all workflows
router.get('/', checkPermission('workflows', 'read'), getWorkflows);

// POST /api/workflows - Create a new workflow
router.post('/', checkPermission('workflows', 'create'), createWorkflow);

export default router;
