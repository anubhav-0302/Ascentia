import express from 'express';
import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getAvailableOrganizations,
  switchOrganization,
  getAssignedOrganization
} from '../controllers/orgController.js';
import {
  assignOrgAdmin,
  getOrgAdmins
} from '../controllers/orgAdminController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Super Admin only routes
router.get('/', requireAuth, getOrganizations);
router.post('/', requireAuth, createOrganization);
router.put('/:id', requireAuth, updateOrganization);
router.delete('/:id', requireAuth, deleteOrganization);
router.get('/available', requireAuth, getAvailableOrganizations);
router.get('/switch/:id', requireAuth, switchOrganization);
router.get('/assigned', requireAuth, getAssignedOrganization);
router.post('/:id/orgAdmin', requireAuth, assignOrgAdmin);
router.get('/:id/admins', requireAuth, getOrgAdmins);

export default router;
