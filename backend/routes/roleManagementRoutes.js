import express from 'express';
import {
  getRoles,
  getRolePermissions,
  updateRolePermissions,
  createCustomRole,
  deleteCustomRole,
  getPermissionAuditLog,
  checkUserPermission,
  getSidebarPermissions
} from '../controllers/roleManagementController.js';
import { requireAuth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 ROLE MANAGEMENT ROUTE:", req.method, req.url);
  next();
});

// Specific routes BEFORE dynamic :id routes
// GET /api/admin/permissions/audit - Get permission audit log (admin or superAdmin)
router.get('/audit/logs', requireAuth, authorize('admin', 'superAdmin'), getPermissionAuditLog);

// GET /api/admin/permissions/check - Check user permission (authenticated users)
router.get('/check/permission', requireAuth, checkUserPermission);

// GET /api/admin/permissions/sidebar - Get sidebar permissions for current user
router.get('/sidebar/permissions', requireAuth, getSidebarPermissions);

// Generic routes AFTER specific routes
// GET /api/admin/roles - Get all roles (admin or superAdmin)
router.get('/', requireAuth, authorize('admin', 'superAdmin'), getRoles);

// GET /api/admin/roles/:id - Get role with permissions (admin or superAdmin)
router.get('/:id', requireAuth, authorize('admin', 'superAdmin'), getRolePermissions);

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

export default router;
