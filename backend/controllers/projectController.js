import prisma from '../lib/prisma.js';
import { logDatabaseOperation } from '../databaseLogger.js';
import { tenantWhere, tenantWhereWith } from '../helpers/tenantHelper.js';

// GET /api/projects - Get all projects (with role-based filtering)
export const getProjects = async (req, res) => {
  try {
    const userRole = req.user?.role?.toLowerCase() || 'employee';
    const userId = req.user?.id;
    
    let whereClause = tenantWhere(req);
    
    // Role-based filtering
    if (userRole === 'manager' || userRole === 'teamlead') {
      // Managers/TeamLeads see only projects they manage
      whereClause.managerId = userId;
    } else if (userRole === 'employee') {
      // Employees see only projects they're assigned to
      whereClause.assignments = {
        some: {
          employeeId: userId
        }
      };
    }
    // Admin and HR see all projects
    
    const projects = await prisma.project.findMany({
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
        tasks: {
          select: {
            id: true,
            status: true
          }
        },
        _count: {
          select: {
            assignments: true,
            tasks: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Add computed fields
    const projectsWithStats = projects.map(project => ({
      ...project,
      teamSize: project.assignments.length,
      completedTasks: project.tasks.filter(t => t.status === 'done').length,
      totalTasks: project.tasks.length
    }));
    
    res.json({ success: true, data: projectsWithStats });
  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
};

// GET /api/projects/:id - Get single project with details
export const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role?.toLowerCase() || 'employee';
    const userId = req.user?.id;
    
    let whereClause = {
      id: parseInt(id),
      ...tenantWhere(req)
    };
    
    // Role-based access check
    if (userRole === 'manager' || userRole === 'teamlead') {
      whereClause.managerId = userId;
    } else if (userRole === 'employee') {
      whereClause.assignments = {
        some: {
          employeeId: userId
        }
      };
    }
    
    const project = await prisma.project.findFirst({
      where: whereClause,
      include: {
        manager: {
          select: { id: true, name: true, email: true }
        },
        assignments: {
          include: {
            employee: {
              select: { id: true, name: true, email: true, jobTitle: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({ success: true, data: project });
  } catch (error) {
    console.error('❌ Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
};

// POST /api/projects - Create new project (Simplified)
export const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      managerId,
      teamLeadId,
      // Legacy fields for backward compatibility
      startDate,
      endDate,
      priority,
      budget,
      assignments = []
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    // Only admin/HR can create projects
    const userRole = req.user?.role?.toLowerCase();
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only admin and HR can create projects'
      });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        managerId: managerId || req.user.id,
        priority: priority || 'medium',
        budget: budget ? parseFloat(budget) : null,
        organizationId: req.user.organizationId
      },
      include: {
        manager: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Auto-assign manager as project lead
    await prisma.projectAssignment.create({
      data: {
        projectId: project.id,
        employeeId: managerId || req.user.id,
        role: 'lead',
        allocation: 100
      }
    });

    // Assign team lead if provided
    if (teamLeadId && teamLeadId !== managerId) {
      await prisma.projectAssignment.create({
        data: {
          projectId: project.id,
          employeeId: teamLeadId,
          role: 'lead',
          allocation: 50
        }
      });
    }

    // Legacy: Create assignments if provided (for backward compatibility)
    if (assignments.length > 0) {
      await prisma.projectAssignment.createMany({
        data: assignments.map(empId => ({
          projectId: project.id,
          employeeId: empId,
          role: 'member'
        })),
        skipDuplicates: true
      });
    }

    logDatabaseOperation('create', 'project', project.id, req.user.id);

    // Fetch complete project with assignments for response
    const projectWithAssignments = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        manager: { select: { id: true, name: true, email: true } },
        assignments: {
          include: {
            employee: { select: { id: true, name: true, email: true, jobTitle: true } }
          }
        },
        _count: { select: { assignments: true, tasks: true } }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: projectWithAssignments
    });
  } catch (error) {
    console.error('❌ Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
};

// PUT /api/projects/:id - Update project
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      status,
      startDate,
      endDate,
      managerId,
      priority,
      budget
    } = req.body;
    
    const userRole = req.user?.role?.toLowerCase();
    
    // Check permissions
    const existingProject = await prisma.project.findFirst({
      where: {
        id: parseInt(id),
        ...tenantWhere(req)
      }
    });
    
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Only admin/HR or project manager can update
    if (!['admin', 'hr'].includes(userRole) && existingProject.managerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only admin, HR, or project manager can update project'
      });
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (managerId !== undefined && ['admin', 'hr'].includes(userRole)) {
      updateData.managerId = managerId;
    }
    if (priority !== undefined) updateData.priority = priority;
    if (budget !== undefined) updateData.budget = budget ? parseFloat(budget) : null;
    
    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        manager: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    logDatabaseOperation('update', 'project', project.id, req.user.id);
    
    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    console.error('❌ Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
};

// DELETE /api/projects/:id - Delete project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role?.toLowerCase();
    
    // Only admin/HR can delete projects
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only admin and HR can delete projects'
      });
    }
    
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(id),
        ...tenantWhere(req)
      }
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    await prisma.project.delete({
      where: { id: parseInt(id) }
    });
    
    logDatabaseOperation('delete', 'project', parseInt(id), req.user.id);
    
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
};

// POST /api/projects/:id/assign - Assign employees to project
export const assignEmployees = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignments } = req.body; // Array of { employeeId, role, allocation }
    
    const userRole = req.user?.role?.toLowerCase();
    
    // Check permissions
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(id),
        ...tenantWhere(req)
      }
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Only admin/HR or project manager can assign employees
    if (!['admin', 'hr'].includes(userRole) && project.managerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only admin, HR, or project manager can assign employees'
      });
    }
    
    // Create assignments
    const results = await prisma.projectAssignment.createMany({
      data: assignments.map(({ employeeId, role = 'member', allocation }) => ({
        projectId: parseInt(id),
        employeeId,
        role,
        allocation: allocation ? parseFloat(allocation) : null
      })),
      skipDuplicates: true
    });
    
    res.json({
      success: true,
      message: `Assigned ${results.count} employees to project`,
      data: { assignedCount: results.count }
    });
  } catch (error) {
    console.error('❌ Error assigning employees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign employees',
      error: error.message
    });
  }
};

// DELETE /api/projects/:id/assign/:employeeId - Remove employee from project
export const removeEmployee = async (req, res) => {
  try {
    const { id, employeeId } = req.params;
    const userRole = req.user?.role?.toLowerCase();

    // Check permissions
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(id),
        ...tenantWhere(req)
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Only admin/HR or project manager can remove employees
    if (!['admin', 'hr'].includes(userRole) && project.managerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only admin, HR, or project manager can remove employees'
      });
    }

    await prisma.projectAssignment.deleteMany({
      where: {
        projectId: parseInt(id),
        employeeId: parseInt(employeeId)
      }
    });

    res.json({
      success: true,
      message: 'Employee removed from project successfully'
    });
  } catch (error) {
    console.error('❌ Error removing employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove employee',
      error: error.message
    });
  }
};

// GET /api/projects/my - Get projects for current user (where they are manager, lead, or assigned)
export const getMyProjects = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role?.toLowerCase();

    let whereClause = tenantWhere(req);

    // Admin/HR see all projects (same as getProjects)
    if (!['admin', 'hr'].includes(userRole)) {
      // Manager: projects they manage OR where they are assigned
      // TeamLead: projects where they are assigned
      // Employee: projects where they are assigned
      whereClause = {
        ...whereClause,
        OR: [
          { managerId: userId },
          {
            assignments: {
              some: {
                employeeId: userId
              }
            }
          }
        ]
      };
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        manager: {
          select: { id: true, name: true, email: true }
        },
        assignments: {
          where: { employeeId: userId },
          select: { role: true, allocation: true }
        },
        _count: {
          select: {
            assignments: true,
            tasks: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add computed fields and user's role in project
    const projectsWithUserInfo = projects.map(project => ({
      ...project,
      myRole: project.managerId === userId ? 'manager' : (project.assignments[0]?.role || 'member'),
      myAllocation: project.assignments[0]?.allocation || null,
      teamSize: project._count.assignments,
      totalTasks: project._count.tasks
    }));

    res.json({
      success: true,
      data: projectsWithUserInfo
    });
  } catch (error) {
    console.error('❌ Error fetching my projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
};

// GET /api/projects/:id/members - Get all members assigned to a project
export const getProjectMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role?.toLowerCase();

    // Check if project exists and user has access
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(id),
        ...tenantWhere(req)
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has access to this project
    const hasAccess = ['admin', 'hr'].includes(userRole) ||
                      project.managerId === userId ||
                      await prisma.projectAssignment.findFirst({
                        where: { projectId: parseInt(id), employeeId: userId }
                      });

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project'
      });
    }

    // Get all project members
    const assignments = await prisma.projectAssignment.findMany({
      where: { projectId: parseInt(id) },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            jobTitle: true,
            department: true,
            status: true
          }
        }
      },
      orderBy: [
        { role: 'asc' }, // lead first, then member
        { createdAt: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: assignments.map(a => ({
        id: a.id,
        role: a.role,
        allocation: a.allocation,
        joinedAt: a.startDate,
        employee: a.employee
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching project members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project members',
      error: error.message
    });
  }
};

// GET /api/projects/available-employees - Get employees available for project assignment
export const getAvailableEmployees = async (req, res) => {
  try {
    const { excludeProjectId } = req.query;
    const userRole = req.user?.role?.toLowerCase();

    // Only admin/HR/manager can view available employees
    if (!['admin', 'hr', 'manager', 'teamlead'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const whereClause = {
      ...tenantWhere(req),
      status: { not: 'inactive' }
    };

    // If excludeProjectId provided, exclude employees already assigned to that project
    if (excludeProjectId) {
      const existingAssignments = await prisma.projectAssignment.findMany({
        where: { projectId: parseInt(excludeProjectId) },
        select: { employeeId: true }
      });
      const assignedIds = existingAssignments.map(a => a.employeeId);

      if (assignedIds.length > 0) {
        whereClause.id = { notIn: assignedIds };
      }
    }

    const employees = await prisma.employee.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        jobTitle: true,
        department: true,
        role: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('❌ Error fetching available employees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available employees',
      error: error.message
    });
  }
};
