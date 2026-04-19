import prisma from '../lib/prisma.js';

// GET /api/admin/roles - Get all roles with permission counts
export const getRoles = async (req, res) => {
  try {
    const roles = await prisma.roleConfig.findMany({
      include: {
        permissions: {
          select: {
            id: true,
            module: true,
            action: true,
            isEnabled: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`✅ Retrieved ${roles.length} roles`);

    res.json({
      success: true,
      data: roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isCustom: role.isCustom,
        isActive: role.isActive,
        permissionCount: role.permissions.length,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching roles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles',
      error: error.message
    });
  }
};

// GET /api/admin/roles/:id - Get role with all permissions
export const getRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await prisma.roleConfig.findUnique({
      where: { id: parseInt(id) },
      include: {
        permissions: {
          orderBy: [{ module: 'asc' }, { action: 'asc' }]
        }
      }
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Group permissions by module
    const permissionsByModule = {};
    role.permissions.forEach(perm => {
      if (!permissionsByModule[perm.module]) {
        permissionsByModule[perm.module] = [];
      }
      permissionsByModule[perm.module].push({
        id: perm.id,
        action: perm.action,
        isEnabled: perm.isEnabled
      });
    });

    console.log(`✅ Retrieved permissions for role: ${role.name}`);

    res.json({
      success: true,
      data: {
        id: role.id,
        name: role.name,
        description: role.description,
        isCustom: role.isCustom,
        isActive: role.isActive,
        permissionsByModule
      }
    });
  } catch (error) {
    console.error('❌ Error fetching role permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role permissions',
      error: error.message
    });
  }
};

// PUT /api/admin/roles/:id/permissions - Update permissions for a role
export const updateRolePermissions = async (req, res) => {
  try {
    console.log('🔥 UPDATE ROLE PERMISSIONS REQUEST RECEIVED');
    const { id } = req.params;
    const { permissions, reason } = req.body;
    const adminId = req.user.id;
    
    console.log(`📋 Request details:`, {
      roleId: id,
      permissionsCount: permissions?.length || 0,
      reason: reason,
      adminId: adminId
    });

    // Verify role exists
    const role = await prisma.roleConfig.findUnique({
      where: { id: parseInt(id) },
      include: { permissions: true }
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Prevent admin from disabling their own admin permissions
    if (role.name === 'admin' && adminId) {
      const adminDisablingAdmin = permissions.some(
        p => p.module === 'users' && p.action === 'view' && !p.isEnabled
      );
      if (adminDisablingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Cannot disable admin permissions for the admin role'
        });
      }
    }

    // Track changes for audit log
    const auditLogs = [];

    // Update permissions
    console.log(`🔍 Processing ${permissions.length} permission updates for role ${role.name}`);
    for (const permission of permissions) {
      const existingPerm = role.permissions.find(
        p => p.module === permission.module && p.action === permission.action
      );

      if (existingPerm) {
        if (existingPerm.isEnabled !== permission.isEnabled) {
          console.log(`📝 Updating permission: ${permission.module}.${permission.action} from ${existingPerm.isEnabled} to ${permission.isEnabled}`);
          
          // Log the change
          auditLogs.push({
            roleId: parseInt(id),
            changedBy: adminId,
            module: permission.module,
            action: permission.action,
            previousValue: existingPerm.isEnabled,
            newValue: permission.isEnabled,
            reason: reason || null
          });

          // Update permission
          const result = await prisma.permission.update({
            where: { id: existingPerm.id },
            data: { isEnabled: permission.isEnabled }
          });
          console.log(`✅ Permission updated in DB: ID ${result.id}, isEnabled: ${result.isEnabled}`);
        }
      } else {
        console.log(`⚠️ Permission not found: ${permission.module}.${permission.action}`);
      }
    }

    // Create audit logs
    if (auditLogs.length > 0) {
      await prisma.permissionAudit.createMany({
        data: auditLogs
      });
    }

    console.log(`✅ Updated ${auditLogs.length} permissions for role: ${role.name}`);

    res.json({
      success: true,
      message: `Updated ${auditLogs.length} permissions`,
      data: {
        roleId: parseInt(id),
        changesCount: auditLogs.length
      }
    });
  } catch (error) {
    console.error('❌ Error updating role permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update role permissions',
      error: error.message
    });
  }
};

// POST /api/admin/roles - Create custom role
export const createCustomRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Role name is required'
      });
    }

    // Check if role already exists
    const existingRole = await prisma.roleConfig.findUnique({
      where: { name: name.toLowerCase() }
    });

    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role with this name already exists'
      });
    }

    // Create new role
    const newRole = await prisma.roleConfig.create({
      data: {
        name: name.toLowerCase(),
        description: description || null,
        isCustom: true,
        isActive: true
      }
    });

    console.log(`✅ Created custom role: ${newRole.name}`);

    res.status(201).json({
      success: true,
      message: 'Custom role created successfully',
      data: {
        id: newRole.id,
        name: newRole.name,
        description: newRole.description,
        isCustom: newRole.isCustom
      }
    });
  } catch (error) {
    console.error('❌ Error creating custom role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create custom role',
      error: error.message
    });
  }
};

// DELETE /api/admin/roles/:id - Delete custom role
export const deleteCustomRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await prisma.roleConfig.findUnique({
      where: { id: parseInt(id) }
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Prevent deletion of default roles
    if (!role.isCustom) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default roles'
      });
    }

    // Delete role (permissions will cascade delete)
    await prisma.roleConfig.delete({
      where: { id: parseInt(id) }
    });

    console.log(`✅ Deleted custom role: ${role.name}`);

    res.json({
      success: true,
      message: 'Custom role deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting custom role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete custom role',
      error: error.message
    });
  }
};

// GET /api/admin/permissions/audit - Get permission audit log
export const getPermissionAuditLog = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const roleId = req.query.roleId ? parseInt(req.query.roleId) : null;

    const where = roleId ? { roleId } : {};

    const auditLogs = await prisma.permissionAudit.findMany({
      where,
      include: {
        role: { select: { name: true } },
        changedByUser: { select: { name: true, email: true } }
      },
      orderBy: { changedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.permissionAudit.count({ where });

    console.log(`✅ Retrieved ${auditLogs.length} audit logs`);

    res.json({
      success: true,
      data: {
        logs: auditLogs.map(log => ({
          id: log.id,
          roleName: log.role.name,
          module: log.module,
          action: log.action,
          previousValue: log.previousValue,
          newValue: log.newValue,
          changedBy: log.changedByUser.name,
          changedByEmail: log.changedByUser.email,
          reason: log.reason,
          changedAt: log.changedAt
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message
    });
  }
};

// GET /api/admin/permissions/check - Check if user has permission (for frontend)
export const checkUserPermission = async (req, res) => {
  try {
    const { module, action } = req.query;
    const userId = req.user.id;

    if (!module || !action) {
      return res.status(400).json({
        success: false,
        message: 'Module and action are required'
      });
    }

    // Get user's role
    const user = await prisma.employee.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get role config
    const roleConfig = await prisma.roleConfig.findUnique({
      where: { name: user.role }
    });

    if (!roleConfig) {
      return res.status(404).json({
        success: false,
        message: 'Role configuration not found'
      });
    }

    // Check permission
    const permission = await prisma.permission.findUnique({
      where: {
        roleId_module_action: {
          roleId: roleConfig.id,
          module,
          action
        }
      }
    });

    const hasPermission = permission ? permission.isEnabled : false;

    res.json({
      success: true,
      data: {
        module,
        action,
        hasPermission,
        userRole: user.role
      }
    });
  } catch (error) {
    console.error('❌ Error checking permission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check permission',
      error: error.message
    });
  }
};

// GET /api/admin/permissions/sidebar - Get sidebar permissions for current user
export const getSidebarPermissions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's role
    const user = await prisma.employee.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get role config
    const roleConfig = await prisma.roleConfig.findUnique({
      where: { name: user.role },
      include: { permissions: true }
    });

    if (!roleConfig) {
      return res.status(404).json({
        success: false,
        message: 'Role configuration not found'
      });
    }

    // Get all sidebar permissions for this role
    const sidebarPermissions = roleConfig.permissions.filter(p => p.module === 'sidebar');
    
    // Build result object
    const result = {};
    sidebarPermissions.forEach(perm => {
      result[perm.action] = perm.isEnabled;
    });

    // Prevent caching - always return fresh data
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error fetching sidebar permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sidebar permissions',
      error: error.message
    });
  }
};
