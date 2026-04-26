import prisma from '../lib/prisma.js';
import { tenantWhere } from './tenantHelper.js';

/**
 * Get all employee IDs that a user can access based on their role and relationships
 * Combines both organizational hierarchy (managerId) and project assignments
 */
export const getAccessibleEmployeeIds = async (userId, userRole, organizationId) => {
  const accessibleIds = new Set();
  
  // All roles can access themselves
  accessibleIds.add(userId);
  
  // Admin and HR can access all employees in the organization
  if (['admin', 'hr'].includes(userRole.toLowerCase())) {
    const allEmployees = await prisma.employee.findMany({
      where: { organizationId },
      select: { id: true }
    });
    allEmployees.forEach(emp => accessibleIds.add(emp.id));
    return Array.from(accessibleIds);
  }
  
  // Managers and Team Leads can access their direct reports
  if (['manager', 'teamlead'].includes(userRole.toLowerCase())) {
    const directReports = await prisma.employee.findMany({
      where: {
        managerId: userId,
        organizationId
      },
      select: { id: true }
    });
    directReports.forEach(emp => accessibleIds.add(emp.id));
  }
  
  // Get project-based access
  // 1. Projects where user is the manager
  const managedProjects = await prisma.project.findMany({
    where: {
      managerId: userId,
      organizationId
    },
    include: {
      assignments: {
        select: { employeeId: true }
      }
    }
  });
  
  managedProjects.forEach(project => {
    project.assignments.forEach(assignment => {
      accessibleIds.add(assignment.employeeId);
    });
  });
  
  // 2. Projects where user is a team lead
  const leadAssignments = await prisma.projectAssignment.findMany({
    where: {
      employeeId: userId,
      role: 'lead',
      project: {
        organizationId
      }
    },
    include: {
      project: {
        include: {
          assignments: {
            select: { employeeId: true }
          }
        }
      }
    }
  });
  
  leadAssignments.forEach(assignment => {
    assignment.project.assignments.forEach(projectAssignment => {
      accessibleIds.add(projectAssignment.employeeId);
    });
  });
  
  // 3. Projects where user is a member (can see other members)
  const memberAssignments = await prisma.projectAssignment.findMany({
    where: {
      employeeId: userId,
      project: {
        organizationId
      }
    },
    include: {
      project: {
        include: {
          assignments: {
            select: { employeeId: true }
          }
        }
      }
    }
  });
  
  memberAssignments.forEach(assignment => {
    assignment.project.assignments.forEach(projectAssignment => {
      accessibleIds.add(projectAssignment.employeeId);
    });
  });
  
  return Array.from(accessibleIds);
};

/**
 * Build a Prisma where clause for filtering employees based on access control
 */
export const buildEmployeeAccessWhere = async (userId, userRole, organizationId) => {
  if (['admin', 'hr'].includes(userRole.toLowerCase())) {
    return { organizationId };
  }
  
  const accessibleIds = await getAccessibleEmployeeIds(userId, userRole, organizationId);
  return {
    organizationId,
    id: { in: accessibleIds }
  };
};

/**
 * Check if a user can access a specific employee
 */
export const canAccessEmployee = async (userId, userRole, organizationId, targetEmployeeId) => {
  // Admin and HR can access everyone
  if (['admin', 'hr'].includes(userRole.toLowerCase())) {
    return true;
  }
  
  // Can always access self
  if (userId === targetEmployeeId) {
    return true;
  }
  
  const accessibleIds = await getAccessibleEmployeeIds(userId, userRole, organizationId);
  return accessibleIds.includes(targetEmployeeId);
};

/**
 * Get projects that a user can access
 */
export const getAccessibleProjects = async (userId, userRole, organizationId) => {
  let whereClause = { organizationId };
  
  if (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'hr') {
    // Admin and HR see all projects
    return prisma.project.findMany({
      where: whereClause,
      include: {
        manager: {
          select: { id: true, name: true, email: true }
        },
        assignments: {
          include: {
            employee: {
              select: { id: true, name: true, email: true, jobTitle: true }
            }
          }
        },
        _count: {
          select: {
            assignments: true,
            tasks: true
          }
        }
      }
    });
  }
  
  // Managers/TeamLeads see projects they manage or are assigned to
  if (['manager', 'teamlead'].includes(userRole.toLowerCase())) {
    whereClause.OR = [
      { managerId: userId },
      {
        assignments: {
          some: {
            employeeId: userId
          }
        }
      }
    ];
  } else {
    // Employees see only projects they're assigned to
    whereClause.assignments = {
      some: {
        employeeId: userId
      }
    };
  }
  
  return prisma.project.findMany({
    where: whereClause,
    include: {
      manager: {
        select: { id: true, name: true, email: true }
      },
      assignments: {
        include: {
          employee: {
            select: { id: true, name: true, email: true, jobTitle: true }
          }
        }
      },
      _count: {
        select: {
          assignments: true,
          tasks: true
        }
      }
    }
  });
};
