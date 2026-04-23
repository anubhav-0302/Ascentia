import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

// POST /api/organizations/:id/orgAdmin - Assign Org Admin (Super Admin only)
export const assignOrgAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can assign Org Admins'
      });
    }

    const { id } = req.params;
    const { userId } = req.body;

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: parseInt(id) }
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Verify user exists
    const user = await prisma.employee.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user to be Org Admin and assign to organization
    const updatedUser = await prisma.employee.update({
      where: { id: parseInt(userId) },
      data: {
        role: 'orgAdmin',
        organizationId: parseInt(id)
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Org Admin assigned successfully'
    });
  } catch (error) {
    console.error('❌ Error assigning Org Admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign Org Admin',
      error: error.message
    });
  }
};

// GET /api/organizations/:id/admins - Get Org Admins for organization (Super Admin only)
export const getOrgAdmins = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can access this endpoint'
      });
    }

    const { id } = req.params;

    const orgAdmins = await prisma.employee.findMany({
      where: {
        organizationId: parseInt(id),
        role: 'orgAdmin'
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: orgAdmins
    });
  } catch (error) {
    console.error('❌ Error fetching Org Admins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Org Admins',
      error: error.message
    });
  }
}
