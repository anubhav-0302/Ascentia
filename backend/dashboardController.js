import prisma from './lib/prisma.js';
import { getAllLeaveRequests } from './leaveStoreDB.js';

// Dashboard statistics API
export const getDashboardStats = async (req, res) => {
  try {
    // Pull real employee data from database
    const employees = await prisma.employee.findMany({ orderBy: { createdAt: 'desc' } });

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

    // Pull real leave data
    const allLeave = await getAllLeaveRequests();
    const leaveStatus = [
      { status: 'Approved', count: allLeave.filter(l => l.status === 'Approved').length },
      { status: 'Pending',  count: allLeave.filter(l => l.status === 'Pending').length },
      { status: 'Rejected', count: allLeave.filter(l => l.status === 'Rejected').length }
    ];

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
        leaveStatus, leaveTrends
      }
    });
  } catch (error) {
    console.error("❌ DASHBOARD ERROR:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard statistics", error: error.message });
  }
};
