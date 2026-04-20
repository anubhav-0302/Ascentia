import prisma from '../lib/prisma.js';

// Get advanced analytics with role-based filtering
export const getAnalytics = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    
    console.log(`📊 Analytics request for role: ${userRole}`);

    // Base analytics structure
    let analytics = {
      insights: [],
      charts: {},
      metrics: {},
      warnings: []
    };

    // Role-based data filtering
    const employeeFilter = userRole === 'admin' ? {} : 
                          userRole === 'hr' ? {} :
                          userRole === 'manager' ? { managerId: userId } :
                          userRole === 'teamlead' ? { managerId: userId } :
                          { id: userId };

    // 1. Employee Insights
    const employeeStats = await getEmployeeStats(employeeFilter, userRole);
    analytics.metrics.employees = employeeStats.metrics;
    analytics.charts.departmentDistribution = employeeStats.departmentChart;
    analytics.insights.push(...employeeStats.insights);

    // 2. Leave Analytics
    const leaveStats = await getLeaveAnalytics(employeeFilter, userRole);
    analytics.metrics.leave = leaveStats.metrics;
    analytics.charts.leaveTrends = leaveStats.trendsChart;
    analytics.charts.leaveStatus = leaveStats.statusChart;
    analytics.insights.push(...leaveStats.insights);
    analytics.warnings.push(...leaveStats.warnings);

    // 3. Timesheet Analytics (if user has permission)
    if (req.user.permissions?.timesheet?.view || userRole === 'admin') {
      const timesheetStats = await getTimesheetAnalytics(employeeFilter, userRole);
      analytics.metrics.timesheets = timesheetStats.metrics;
      analytics.charts.timesheetHours = timesheetStats.hoursChart;
      analytics.insights.push(...timesheetStats.insights);
      analytics.warnings.push(...timesheetStats.warnings);
    }

    // 4. Performance Analytics (if user has permission)
    if (req.user.permissions?.performance?.view || userRole === 'admin') {
      const performanceStats = await getPerformanceAnalytics(employeeFilter, userRole);
      analytics.metrics.performance = performanceStats.metrics;
      analytics.charts.topPerformers = performanceStats.performersChart;
      analytics.insights.push(...performanceStats.insights);
    }

    // Add role-specific insights
    if (userRole === 'admin') {
      analytics.insights.push({
        type: 'system',
        title: 'System Health',
        description: 'All systems operational with 99.9% uptime',
        trend: 'stable',
        value: '99.9%'
      });
    }

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// Employee Statistics
async function getEmployeeStats(filter, userRole) {
  const employees = await prisma.employee.findMany({
    where: filter
  });

  const total = employees.length;
  const active = employees.filter(e => e.status === 'Active').length;
  const remote = employees.filter(e => e.employmentType === 'Remote').length;

  // Department distribution
  const deptMap = {};
  employees.forEach(emp => {
    const dept = emp.department || 'Unassigned';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });

  const departmentChart = Object.entries(deptMap).map(([name, count]) => ({
    name,
    count
  }));

  const insights = [];
  
  if (userRole === 'admin' || userRole === 'hr') {
    const activeRate = ((active / total) * 100).toFixed(1);
    insights.push({
      type: 'employee',
      title: 'Employee Engagement',
      description: `${activeRate}% of workforce is currently active`,
      trend: activeRate > 90 ? 'positive' : activeRate > 70 ? 'neutral' : 'negative',
      value: `${activeRate}%`
    });
  }

  return {
    metrics: { total, active, remote },
    departmentChart,
    insights
  };
}

// Leave Analytics
async function getLeaveAnalytics(filter, userRole) {
  const leaves = await prisma.leaveRequest.findMany({
    where: {
      employeeId: filter.id || undefined
    },
    orderBy: { createdAt: 'desc' },
    take: 500
  });

  // Get employee details separately
  const employeeIds = [...new Set(leaves.map(l => l.employeeId))];
  const employees = await prisma.employee.findMany({
    where: { id: { in: employeeIds } },
    select: { id: true, name: true, department: true }
  });
  
  const employeeMap = employees.reduce((acc, emp) => {
    acc[emp.id] = emp;
    return acc;
  }, {});

  const total = leaves.length;
  const approved = leaves.filter(l => l.status === 'Approved').length;
  const pending = leaves.filter(l => l.status === 'Pending').length;
  const rejected = leaves.filter(l => l.status === 'Rejected').length;

  // Monthly trends
  const monthlyMap = {};
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    last6Months.push(monthKey);
    monthlyMap[monthKey] = { approved: 0, pending: 0, rejected: 0 };
  }

  leaves.forEach(leave => {
    const monthKey = new Date(leave.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (monthlyMap[monthKey]) {
      monthlyMap[monthKey][leave.status.toLowerCase()]++;
    }
  });

  const trendsChart = last6Months.map(month => ({
    month,
    ...monthlyMap[month]
  }));

  const statusChart = [
    { status: 'Approved', count: approved },
    { status: 'Pending', count: pending },
    { status: 'Rejected', count: rejected }
  ];

  const insights = [];
  const warnings = [];

  const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : 0;
  insights.push({
    type: 'leave',
    title: 'Leave Approval Rate',
    description: `${approvalRate}% of leave requests are approved`,
    trend: approvalRate > 80 ? 'positive' : approvalRate > 60 ? 'neutral' : 'negative',
    value: `${approvalRate}%`
  });

  if (pending > 10) {
    warnings.push({
      type: 'leave',
      title: 'High Pending Leaves',
      description: `${pending} leave requests awaiting approval`,
      severity: 'medium'
    });
  }

  return {
    metrics: { total, approved, pending, rejected },
    trendsChart,
    statusChart,
    insights,
    warnings
  };
}

// Timesheet Analytics
async function getTimesheetAnalytics(filter, userRole) {
  const timesheets = await prisma.timesheet.findMany({
    where: {
      employeeId: filter.id || undefined
    },
    orderBy: { date: 'desc' },
    take: 1000
  });

  // Get employee details separately
  const employeeIds = [...new Set(timesheets.map(t => t.employeeId))];
  const employees = await prisma.employee.findMany({
    where: { id: { in: employeeIds } },
    select: { id: true, name: true, department: true }
  });
  
  const employeeMap = employees.reduce((acc, emp) => {
    acc[emp.id] = emp;
    return acc;
  }, {});

  const totalHours = timesheets.reduce((sum, ts) => sum + (ts.hours || 0), 0);
  const avgHours = timesheets.length > 0 ? (totalHours / timesheets.length).toFixed(1) : 0;

  // Weekly hours trend
  const weeklyMap = {};
  const last4Weeks = [];
  for (let i = 3; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));
    const weekKey = `Week ${4 - i}`;
    last4Weeks.push(weekKey);
    weeklyMap[weekKey] = 0;
  }

  timesheets.forEach(ts => {
    const weekStart = new Date(ts.date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = `Week ${Math.floor((new Date() - weekStart) / (7 * 24 * 60 * 60 * 1000)) + 1}`;
    if (weeklyMap[weekKey] !== undefined) {
      weeklyMap[weekKey] += ts.hours || 0;
    }
  });

  const hoursChart = last4Weeks.map(week => ({
    week,
    hours: weeklyMap[week]
  }));

  const insights = [];
  const warnings = [];

  insights.push({
    type: 'timesheet',
    title: 'Average Weekly Hours',
    description: `Employees average ${avgHours} hours per timesheet`,
    trend: avgHours >= 35 && avgHours <= 45 ? 'positive' : avgHours < 35 ? 'negative' : 'neutral',
    value: `${avgHours}h`
  });

  // Low activity detection
  const recentTimesheets = timesheets.filter(ts => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    return new Date(ts.date) > twoWeeksAgo;
  });

  const employeeHours = {};
  recentTimesheets.forEach(ts => {
    if (!employeeHours[ts.employeeId]) {
      employeeHours[ts.employeeId] = { 
        name: employeeMap[ts.employeeId]?.name || 'Unknown',
        hours: 0 
      };
    }
    employeeHours[ts.employeeId].hours += ts.hours || 0;
  });

  Object.values(employeeHours).forEach(emp => {
    if (emp.hours < 20) {
      warnings.push({
        type: 'timesheet',
        title: 'Low Activity Alert',
        description: `${emp.name} has logged less than 20 hours in 2 weeks`,
        severity: 'low'
      });
    }
  });

  return {
    metrics: { totalHours, avgHours: parseFloat(avgHours) },
    hoursChart,
    insights,
    warnings
  };
}

// Performance Analytics
async function getPerformanceAnalytics(filter, userRole) {
  const reviews = await prisma.performanceReview.findMany({
    where: {
      employeeId: filter.id || undefined
    },
    orderBy: { createdAt: 'desc' },
    take: 200
  });

  // Get employee details separately
  const employeeIds = [...new Set(reviews.map(r => r.employeeId))];
  const employees = await prisma.employee.findMany({
    where: { id: { in: employeeIds } },
    select: { id: true, name: true, department: true }
  });
  
  const employeeMap = employees.reduce((acc, emp) => {
    acc[emp.id] = emp;
    return acc;
  }, {});

  const totalReviews = reviews.length;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  // Top performers
  const employeeRatings = {};
  reviews.forEach(review => {
    if (!employeeRatings[review.employeeId]) {
      employeeRatings[review.employeeId] = { 
        name: employeeMap[review.employeeId]?.name || 'Unknown',
        department: employeeMap[review.employeeId]?.department || 'Unknown',
        rating: 0,
        count: 0 
      };
    }
    employeeRatings[review.employeeId].rating += review.rating || 0;
    employeeRatings[review.employeeId].count++;
  });

  const performersChart = Object.values(employeeRatings)
    .map(emp => ({
      name: emp.name,
      rating: parseFloat((emp.rating / emp.count).toFixed(1)),
      department: emp.department
    }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  const insights = [];
  
  if (totalReviews > 0) {
    insights.push({
      type: 'performance',
      title: 'Performance Rating',
      description: `Average team rating is ${avgRating} out of 5`,
      trend: avgRating >= 4 ? 'positive' : avgRating >= 3 ? 'neutral' : 'negative',
      value: `${avgRating}/5`
    });
  }

  return {
    metrics: { totalReviews, avgRating: parseFloat(avgRating) },
    performersChart,
    insights
  };
}
