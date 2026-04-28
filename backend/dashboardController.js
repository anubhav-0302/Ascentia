import prisma from './lib/prisma.js';
import { getAllLeaveRequests } from './leaveStoreDB.js';
import { tenantWhere, tenantWhereWith } from './helpers/tenantHelper.js';
import { getAccessibleEmployeeIds } from './helpers/accessControlHelper.js';

// Dashboard statistics API
export const getDashboardStats = async (req, res) => {
  try {
    const userRole = req.user?.role?.toLowerCase() || 'employee';
    const userId = req.user?.id;
    
    // Pull real employee data from database
    const where = tenantWhere(req);
    let employees = await prisma.employee.findMany({ 
      where: where,
      orderBy: { createdAt: 'desc' } 
    });
    
    let allLeave = await getAllLeaveRequests();
    
    // Filter data based on user role using access control helper
    if (!['admin', 'hr'].includes(userRole)) {
      const accessibleIds = await getAccessibleEmployeeIds(userId, userRole, req.user.organizationId);
      employees = employees.filter(e => accessibleIds.includes(e.id));
      allLeave = allLeave.filter(l => accessibleIds.includes(l.employeeId));
    }
    // Admin and HR see all data (no filtering)

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status?.toLowerCase() === 'active').length;
    const remoteEmployees = employees.filter(e => e.status?.toLowerCase() === 'remote').length;

    const departmentNames = [...new Set(employees.map(e => e.department).filter(Boolean))];

    const recentEmployees = employees.slice(0, 5).map(e => ({
      id: e.id, name: e.name, email: e.email,
      jobTitle: e.jobTitle, department: e.department,
      status: e.status, createdAt: e.createdAt
    }));

    const departmentDistribution = departmentNames.map(dept => ({
      name: dept,
      count: employees.filter(e => e.department === dept).length
    }));

    const statusDistribution = [
      { name: 'Active', count: activeEmployees },
      { name: 'Remote', count: remoteEmployees },
      { name: 'Onboarding', count: employees.filter(e => e.status?.toLowerCase() === 'onboarding').length }
    ];

    const leaveStatus = [
      { status: 'Approved', count: allLeave.filter(l => l.status === 'Approved').length },
      { status: 'Pending',  count: allLeave.filter(l => l.status === 'Pending').length },
      { status: 'Rejected', count: allLeave.filter(l => l.status === 'Rejected').length }
    ];

    // Calculate team attendance percentage (for managers)
    const teamAttendance = totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0;

    // Calculate average performance rating for managers/teamleads
    let avgPerformance = null;
    if (userRole === 'manager' || userRole === 'teamlead') {
      const reviews = await prisma.performanceReview.findMany({
        where: {
          employeeId: { in: employees.map(e => e.id) }
        },
        select: { rating: true }
      });
      if (reviews.length > 0) {
        avgPerformance = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      }
    }
    
    // Calculate hours logged for employees
    let hoursLogged = null;
    if (userRole === 'employee') {
      const timesheets = await prisma.timesheet.findMany({
        where: {
          employeeId: userId,
          ...tenantWhere(req)
        },
        select: { hours: true }
      });
      hoursLogged = timesheets.reduce((sum, t) => sum + t.hours, 0);
    }
    
    // Calculate performance rating for employees
    let performanceRating = null;
    if (userRole === 'employee') {
      const review = await prisma.performanceReview.findFirst({
        where: {
          employeeId: userId,
          employee: {
            ...tenantWhere(req)
          }
        },
        orderBy: { createdAt: 'desc' },
        select: { rating: true }
      });
      performanceRating = review?.rating || null;
    }
    
    // Calculate pending timesheet reviews for HR/Manager/TeamLead
    let pendingTimesheetReviews = null;
    if (userRole === 'hr' || userRole === 'manager' || userRole === 'teamlead') {
      pendingTimesheetReviews = await prisma.timesheet.count({
        where: {
          status: 'Pending',
          employeeId: { in: employees.map(e => e.id) }
        }
      });
    }
    
    // Calculate payroll status for HR
    let payrollStatus = null;
    if (userRole === 'hr') {
      // TODO: Implement payroll status when PayrollRun model is available
      payrollStatus = 'Not Available';
    }

    // Get project data for managers and team leads
    let managedProjects = null;
    if (userRole === 'manager' || userRole === 'teamlead') {
      // Projects where user is the manager
      const projects = await prisma.project.findMany({
        where: {
          managerId: userId,
          organizationId: req.user.organizationId
        },
        include: {
          assignments: {
            include: {
              employee: {
                select: { id: true, name: true, email: true, jobTitle: true, status: true }
              }
            }
          },
          tasks: {
            select: { id: true, status: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Also include projects where user is a team lead
      const leadProjects = await prisma.project.findMany({
        where: {
          assignments: {
            some: {
              employeeId: userId,
              role: 'lead'
            }
          },
          organizationId: req.user.organizationId
        },
        include: {
          assignments: {
            include: {
              employee: {
                select: { id: true, name: true, email: true, jobTitle: true, status: true }
              }
            }
          },
          tasks: {
            select: { id: true, status: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Merge and deduplicate projects
      const projectMap = new Map();
      [...projects, ...leadProjects].forEach(p => {
        if (!projectMap.has(p.id)) projectMap.set(p.id, p);
      });

      managedProjects = Array.from(projectMap.values()).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        priority: p.priority,
        startDate: p.startDate,
        endDate: p.endDate,
        memberCount: p.assignments.length,
        taskCount: p.tasks.length,
        completedTasks: p.tasks.filter(t => t.status === 'done').length,
        members: p.assignments.map(a => ({
          id: a.employee.id,
          name: a.employee.name,
          email: a.employee.email,
          jobTitle: a.employee.jobTitle,
          status: a.employee.status,
          role: a.role,
          allocation: a.allocation
        }))
      }));
    }

    // Build monthly leave trends for the last 6 months
    const now = new Date();
    const leaveTrends = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const month = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const monthLeave = allLeave.filter(l => {
        const ld = new Date(l.createdAt);
        return ld.getMonth() === d.getMonth() && ld.getFullYear() === year;
      });
      return {
        month,
        approved: monthLeave.filter(l => l.status === 'Approved').length,
        pending:  monthLeave.filter(l => l.status === 'Pending').length,
        rejected: monthLeave.filter(l => l.status === 'Rejected').length
      };
    });

    res.json({
      success: true,
      data: {
        totalEmployees, activeEmployees, remoteEmployees,
        departments: departmentNames.length,
        recentEmployees, departmentDistribution, statusDistribution,
        leaveStatus, leaveTrends,
        teamAttendance, avgPerformance,
        hoursLogged, performanceRating,
        pendingTimesheetReviews, payrollStatus,
        managedProjects
      }
    });
  } catch (error) {
    console.error("❌ DASHBOARD ERROR:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard statistics", error: error.message });
  }
};
