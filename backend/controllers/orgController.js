import prisma from '../lib/prisma.js';

// GET /api/organizations - List all organizations (Super Admin only)
export const getOrganizations = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can access organizations'
      });
    }

    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            employees: true,
            leaveRequests: true,
            timesheets: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: organizations
    });
  } catch (error) {
    console.error('❌ Error fetching organizations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organizations',
      error: error.message
    });
  }
};

// POST /api/organizations - Create organization (Super Admin only)
export const createOrganization = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can create organizations'
      });
    }

    const { name, code, subscriptionPlan = 'free' } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Check if name already exists (name is unique in schema)
    const existing = await prisma.organization.findUnique({
      where: { name }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Organization name already exists'
      });
    }

    // Generate code if not provided - add full timestamp for uniqueness
    const orgCode = code || (name.toUpperCase().replace(/\s+/g, '-').substring(0, 10) + '-' + Date.now());

    const organization = await prisma.organization.create({
      data: {
        name,
        code: orgCode,
        subscriptionPlan
      }
    });

    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('❌ Error creating organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create organization',
      error: error.message
    });
  }
};

// PUT /api/organizations/:id - Update organization (Super Admin only)
export const updateOrganization = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can update organizations'
      });
    }

    const { id } = req.params;
    const { name, code, subscriptionPlan, isActive } = req.body;

    const organization = await prisma.organization.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(subscriptionPlan && { subscriptionPlan }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('❌ Error updating organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update organization',
      error: error.message
    });
  }
};

// DELETE /api/organizations/:id - Delete organization (Super Admin only)
export const deleteOrganization = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can delete organizations'
      });
    }

    const { id } = req.params;

    // Check if organization has employees
    const employeeCount = await prisma.employee.count({
      where: { organizationId: parseInt(id) }
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete organization with employees'
      });
    }

    await prisma.organization.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete organization',
      error: error.message
    });
  }
};

// GET /api/organizations/available - Get organizations Super Admin can manage
export const getAvailableOrganizations = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can access this endpoint'
      });
    }

    const organizations = await prisma.organization.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: organizations
    });
  } catch (error) {
    console.error('❌ Error fetching available organizations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available organizations',
      error: error.message
    });
  }
};

// GET /api/organizations/switch/:id - Switch organization context (Super Admin only)
export const switchOrganization = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can switch organizations'
      });
    }

    const { id } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true
      }
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    if (!organization.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Organization is not active'
      });
    }

    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('❌ Error switching organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to switch organization',
      error: error.message
    });
  }
};

// GET /api/organizations/assigned - Get assigned organization for Org Admin
export const getAssignedOrganization = async (req, res) => {
  try {
    if (req.user.role !== 'orgAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Only Org Admin can access this endpoint'
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: req.user.id },
      select: {
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
            isActive: true
          }
        }
      }
    });

    if (!employee || !employee.organization) {
      return res.status(404).json({
        success: false,
        message: 'No organization assigned'
      });
    }

    res.json({
      success: true,
      data: employee.organization
    });
  } catch (error) {
    console.error('❌ Error fetching assigned organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned organization',
      error: error.message
    });
  }
}
