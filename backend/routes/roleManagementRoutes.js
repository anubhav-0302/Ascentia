import express from 'express';
import {
  getRoles,
  getRolePermissions,
  updateRolePermissions,
  createCustomRole,
  deleteCustomRole,
  getPermissionAuditLog,
  checkUserPermission
} from '../controllers/roleManagementController.js';
import { requireAuth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 ROLE MANAGEMENT ROUTE:", req.method, req.url);
  next();
});

// GET /api/admin/roles - Get all roles (admin only)
router.get('/', requireAuth, authorize('admin'), getRoles);

// GET /api/admin/roles/:id - Get role with permissions (admin only)
router.get('/:id', requireAuth, authorize('admin'), getRolePermissions);

// PUT /api/admin/roles/:id/permissions - Update role permissions (admin only)
router.put('/:id/permissions', (req, res, next) => {
  console.log('🎯 PERMISSION UPDATE ROUTE HIT:', req.method, req.url, 'Params:', req.params);
  console.log('🔑 Auth Header:', req.headers.authorization ? 'Present' : 'Missing');
  next();
}, requireAuth, (req, res, next) => {
  console.log('✅ Auth middleware passed');
  next();
}, authorize('admin'), (req, res, next) => {
  console.log('✅ Admin authorization passed');
  next();
}, updateRolePermissions);

// POST /api/admin/roles - Create custom role (admin only)
router.post('/', requireAuth, authorize('admin'), createCustomRole);

// DELETE /api/admin/roles/:id - Delete custom role (admin only)
router.delete('/:id', requireAuth, authorize('admin'), deleteCustomRole);

// GET /api/admin/permissions/audit - Get permission audit log (admin only)
router.get('/audit/logs', requireAuth, authorize('admin'), getPermissionAuditLog);

// GET /api/admin/permissions/check - Check user permission (authenticated users)
router.get('/check/permission', requireAuth, checkUserPermission);

export default router;
