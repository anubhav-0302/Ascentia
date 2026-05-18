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
    
    // Calculate pending timesheet reviews for Admin/HR/Manager/TeamLead
    let pendingTimesheetReviews = null;
    if (userRole === 'admin' || userRole === 'hr' || userRole === 'manager' || userRole === 'teamlead') {
      pendingTimesheetReviews = await prisma.timesheet.count({
        where: {
          status: 'Pending',
          employeeId: { in: employees.map(e => e.id) }
        }
      });
    }
    
    // Calculate leave balance for employees, managers, team leads
    let leaveBalance = null;
    let totalLeaveDays = 21; // Standard annual leave allowance
    let usedLeaveDays = 0;
    if (userRole !== 'admin' && userRole !== 'hr') {
      const myLeaves = allLeave.filter(l => l.employeeId === userId && (l.status === 'Approved' || l.status === 'Pending'));
      usedLeaveDays = myLeaves.reduce((acc, leave) => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return acc + days;
      }, 0);
      leaveBalance = Math.max(0, totalLeaveDays - usedLeaveDays);
    }

    // Calculate payroll status for HR
    let payrollStatus = null;
    if (userRole === 'hr') {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const payrollRun = await prisma.payrollRun?.findFirst({
        where: {
          month: currentMonth,
          year: currentYear,
          organizationId: req.user.organizationId
        }
      });
      payrollStatus = payrollRun ? payrollRun.status : 'Pending';
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

    // Build pending tasks per role
    const pendingLeaveCount = allLeave.filter(l => l.status === 'Pending').length;
    const pendingTasks = [];

    if (userRole === 'admin' || userRole === 'hr') {
      if (pendingLeaveCount > 0) pendingTasks.push({ id: `${userRole}-pending-leaves`, title: 'Pending Leave Approvals', description: `${pendingLeaveCount} leave request${pendingLeaveCount > 1 ? 's' : ''} awaiting review`, count: pendingLeaveCount, urgency: 'pending', link: '/leave-attendance?tab=team', icon: 'fa-calendar-times' });
      if (pendingTimesheetReviews > 0) pendingTasks.push({ id: `${userRole}-pending-timesheets`, title: 'Pending Timesheet Approvals', description: `${pendingTimesheetReviews} timesheet${pendingTimesheetReviews > 1 ? 's' : ''} awaiting review`, count: pendingTimesheetReviews, urgency: 'pending', link: '/timesheet-entry?tab=approvals', icon: 'fa-clock' });
      const onboardingCount = employees.filter(e => e.status?.toLowerCase() === 'onboarding').length;
      if (onboardingCount > 0) pendingTasks.push({ id: `${userRole}-onboarding`, title: 'Employees Onboarding', description: `${onboardingCount} employee${onboardingCount > 1 ? 's' : ''} currently onboarding`, count: onboardingCount, urgency: 'info', link: '/directory', icon: 'fa-user-plus' });
    } else if (userRole === 'manager' || userRole === 'teamlead') {
      if (pendingLeaveCount > 0) pendingTasks.push({ id: 'mgr-pending-leaves', title: 'Pending Leave Approvals', description: `${pendingLeaveCount} team leave request${pendingLeaveCount > 1 ? 's' : ''} awaiting review`, count: pendingLeaveCount, urgency: 'pending', link: '/leave-attendance?tab=team', icon: 'fa-calendar-times' });
      if (pendingTimesheetReviews > 0) pendingTasks.push({ id: 'mgr-pending-timesheets', title: 'Pending Timesheet Approvals', description: `${pendingTimesheetReviews} team timesheet${pendingTimesheetReviews > 1 ? 's' : ''} awaiting review`, count: pendingTimesheetReviews, urgency: 'pending', link: '/timesheet-entry?tab=approvals', icon: 'fa-clock' });
      if (managedProjects && managedProjects.length > 0) {
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcoming = managedProjects.filter(p => p.endDate && new Date(p.endDate) <= weekFromNow && new Date(p.endDate) >= now && p.status !== 'completed');
        if (upcoming.length > 0) pendingTasks.push({ id: 'mgr-deadlines', title: 'Upcoming Project Deadlines', description: `${upcoming.length} project${upcoming.length > 1 ? 's' : ''} due within 7 days`, count: upcoming.length, urgency: 'overdue', link: '/projects', icon: 'fa-project-diagram' });
      }
    } else {
      const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0,0,0,0);
      const unsubmitted = await prisma.timesheet.count({ where: { employeeId: userId, date: { gte: startOfWeek }, status: 'Pending', ...tenantWhere(req) } });
      if (unsubmitted > 0) pendingTasks.push({ id: 'emp-unsubmitted', title: 'Unsubmitted Timesheet', description: `${unsubmitted} draft entr${unsubmitted > 1 ? 'ies' : 'y'} this week`, count: unsubmitted, urgency: 'overdue', link: '/timesheet-entry', icon: 'fa-clock' });
      const myPending = await prisma.leaveRequest.count({ where: { employeeId: userId, status: 'Pending', ...tenantWhere(req) } });
      if (myPending > 0) pendingTasks.push({ id: 'emp-pending-leaves', title: 'Pending Leave Requests', description: `${myPending} request${myPending > 1 ? 's' : ''} awaiting approval`, count: myPending, urgency: 'pending', link: '/leave-attendance', icon: 'fa-calendar' });
    }
    if (pendingTasks.length === 0) {
      pendingTasks.push({ id: 'no-tasks', title: 'No pending tasks', description: "You're all caught up!", count: 0, urgency: 'info', link: '/dashboard', icon: 'fa-check-circle' });
    }
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
        managedProjects,
        pendingTasks,
        leaveBalance, totalLeaveDays, usedLeaveDays
      }
    });
  } catch (error) {
    console.error("❌ DASHBOARD ERROR:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard statistics", error: error.message });
  }
};
