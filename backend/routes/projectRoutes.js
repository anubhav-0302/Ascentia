import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  assignEmployees,
  removeEmployee,
  getMyProjects,
  getProjectMembers,
  getAvailableEmployees
} from '../controllers/projectController.js';
import { requireAuth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 PROJECT ROUTE:", req.method, req.url);
  next();
});

// Specific routes BEFORE dynamic :id routes
// GET /api/projects/my - Get current user's projects
router.get('/my', requireAuth, getMyProjects);

// GET /api/projects/available-employees - Get employees for assignment dropdown
router.get('/available-employees', requireAuth, getAvailableEmployees);

// Project CRUD routes
router.get('/', requireAuth, checkPermission('projects', 'view'), getProjects);
router.post('/', requireAuth, checkPermission('projects', 'create'), createProject);

// Dynamic :id routes AFTER specific routes
router.get('/:id', requireAuth, checkPermission('projects', 'view'), getProject);
router.put('/:id', requireAuth, checkPermission('projects', 'edit'), updateProject);
router.delete('/:id', requireAuth, checkPermission('projects', 'delete'), deleteProject);

// Project members route
router.get('/:id/members', requireAuth, getProjectMembers);

// Employee assignment routes
router.post('/:id/assign', requireAuth, checkPermission('projects', 'edit'), assignEmployees);
router.delete('/:id/assign/:employeeId', requireAuth, checkPermission('projects', 'edit'), removeEmployee);

export default router;
