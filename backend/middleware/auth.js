import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { env } from '../config/env.js';

// Authentication middleware - database only - now works with Employee model
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: "Access token required" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const employee = await prisma.employee.findUnique({ 
      where: { id: decoded.id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            subscriptionPlan: true,
            isActive: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            role: true,
            department: true,
            email: true
          }
        },
        passwordChanges: {
          orderBy: { changedAt: 'desc' },
          take: 1,
          select: {
            changedAt: true,
            reason: true
          }
        }
      }
    });
    if (!employee)
      return res.status(401).json({ success: false, message: 'Invalid token - employee not found' });

    req.user = { 
      id: employee.id, 
      name: employee.name, 
      email: employee.email, 
      role: employee.role, 
      jobTitle: employee.jobTitle,
      department: employee.department,
      status: employee.status,
      createdAt: employee.createdAt,
      manager: employee.manager,
      phone: employee.phone,
      address: employee.address,
      profilePicture: employee.profilePicture,
      lastPasswordChange: employee.passwordChanges[0]?.changedAt || null,
      twoFactorEnabled: employee.twoFactorEnabled,
      organizationId: employee.organizationId,
      organization: employee.organization
    };

    // -----------------------------------------------------------------
    // SuperAdmin org context switching (X-Organization-Id header).
    // Honored ONLY when the authenticated user is a SuperAdmin AND the
    // referenced organization exists and is active. Silently ignored
    // for all other roles to prevent tenant escalation.
    // Downstream code reads req.activeOrgId (via tenantWhere()) to scope
    // queries to the chosen org while the SuperAdmin is "acting as" it.
    // -----------------------------------------------------------------
    if (req.user.role === 'superAdmin') {
      const raw = req.headers['x-organization-id'];
      if (raw !== undefined && raw !== '' && raw !== null) {
        const orgId = parseInt(raw, 10);
        if (Number.isInteger(orgId) && orgId > 0) {
          const org = await prisma.organization.findUnique({
            where: { id: orgId },
            select: { id: true, isActive: true }
          });
          if (org && org.isActive) {
            req.activeOrgId = org.id;
          }
        }
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

export default { requireAuth, authorize };
