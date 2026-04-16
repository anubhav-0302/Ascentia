import prisma from '../lib/prisma.js';

// Cache permissions per request to avoid repeated DB queries
const loadUserPermissions = async (req) => {
  // If permissions already loaded for this request, return cached
  if (req.user.permissions) {
    return req.user.permissions;
  }

  // Admin always has all permissions
  if (req.user.role === 'admin') {
    req.user.permissions = { all: true };
    return req.user.permissions;
  }

  // Load permissions from database for non-admin users
  const roleConfig = await prisma.roleConfig.findUnique({
    where: { name: req.user.role },
    include: { permissions: true }
  });

  if (!roleConfig) {
    req.user.permissions = {};
    return req.user.permissions;
  }

  // Convert permissions array to object for easy lookup
  const permissions = {};
  roleConfig.permissions.forEach(perm => {
    if (!permissions[perm.module]) {
      permissions[perm.module] = {};
    }
    permissions[perm.module][perm.action] = perm.isEnabled;
  });

  req.user.permissions = permissions;
  return permissions;
};

// Check if user has specific permission
export const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      // User must be authenticated first
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Load permissions (cached per request)
      const permissions = await loadUserPermissions(req);

      // Admin always passes
      if (permissions.all) {
        return next();
      }

      // Check specific permission
      const hasPermission = permissions[module]?.[action] === true;

      if (!hasPermission) {
        console.log(`🚫 Permission denied: ${req.user.role} tried to ${module}.${action}`);
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions: Required ${module}.${action}`
        });
      }

      console.log(`✅ Permission granted: ${req.user.role} can ${module}.${action}`);
      next();
    } catch (error) {
      console.error('Error checking permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

// Check if user has ANY permission for a module
export const checkModuleAccess = (module) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const permissions = await loadUserPermissions(req);

      // Admin always passes
      if (permissions.all) {
        return next();
      }

      // Check if user has ANY permission for this module
      const modulePermissions = permissions[module];
      const hasAnyPermission = modulePermissions && Object.values(modulePermissions).some(v => v === true);

      if (!hasAnyPermission) {
        return res.status(403).json({
          success: false,
          message: `No access to ${module} module`
        });
      }

      next();
    } catch (error) {
      console.error('Error checking module access:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};
