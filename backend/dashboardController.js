import prisma from './lib/prisma.js';
import { getAllLeaveRequests } from './leaveStoreDB.js';

// Dashboard statistics API
export const getDashboardStats = async (req, res) => {
  try {
    const userRole = req.user?.role?.toLowerCase() || 'employee';
    const userId = req.user?.id;
    
    // Pull real employee data from database
    let employees = await prisma.employee.findMany({ orderBy: { createdAt: 'desc' } });
    let allLeave = await getAllLeaveRequests();
    
    // Filter data based on user role
    if (userRole === 'manager') {
      // Managers see only their team members
      const manager = await prisma.employee.findUnique({ 
        where: { id: userId },
        select: { department: true }
      });
      
      if (manager?.department) {
        employees = employees.filter(e => e.department === manager.department);
        allLeave = allLeave.filter(l => {
          const leaveEmployee = employees.find(e => e.id === l.employeeId);
          return leaveEmployee?.department === manager.department;
        });
      }
    } else if (userRole === 'employee') {
      // Employees see only their own data
      employees = employees.filter(e => e.id === userId);
      allLeave = allLeave.filter(l => l.employeeId === userId);
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

    // Calculate average performance rating (TODO: Integrate with performance reviews table)
    const avgPerformance = userRole === 'manager' ? 4.2 : null;

    // Calculate hours logged for employees (TODO: Integrate with timesheet entries table)
    const hoursLogged = userRole === 'employee' ? 160 : null;

    // Calculate performance rating for employees (TODO: Integrate with performance reviews table)
    const performanceRating = userRole === 'employee' ? 4.5 : null;

    // Calculate pending timesheet reviews for HR/Manager (TODO: Query from timesheet table)
    const pendingTimesheetReviews = (userRole === 'hr' || userRole === 'manager') ? 12 : null;

    // Calculate payroll status for HR (TODO: Check payroll schedule table)
    const payrollStatus = userRole === 'hr' ? 'Run' : null;

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
        pendingTimesheetReviews, payrollStatus
      }
    });
  } catch (error) {
    console.error("❌ DASHBOARD ERROR:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard statistics", error: error.message });
  }
};
