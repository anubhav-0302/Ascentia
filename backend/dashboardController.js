import { getEmployees } from './employeeStore.js';

// Dashboard statistics API
export const getDashboardStats = async (req, res) => {
  try {
    console.log("🔍 Fetching dashboard statistics...");
    
    const employees = getEmployees();
    
    // Calculate statistics
    const totalEmployees = employees.length;
    
    const activeEmployees = employees.filter(emp => emp.status === 'Active').length;
    
    const remoteEmployees = employees.filter(emp => emp.status === 'Remote').length;
    
    // Get unique departments
    const departments = [...new Set(employees.map(emp => emp.department))];
    
    // Get recent employees (last 5)
    const recentEmployees = employees
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        jobTitle: emp.jobTitle,
        department: emp.department,
        status: emp.status,
        createdAt: emp.createdAt
      }));
    
    // Get department distribution
    const departmentDistribution = departments.map(dept => ({
      name: dept,
      count: employees.filter(emp => emp.department === dept).length
    }));
    
    // Get status distribution
    const statusDistribution = [
      { name: 'Active', count: employees.filter(emp => emp.status === 'Active').length },
      { name: 'Remote', count: employees.filter(emp => emp.status === 'Remote').length },
      { name: 'Onboarding', count: employees.filter(emp => emp.status === 'Onboarding').length }
    ];
    
    console.log("📊 Dashboard stats calculated:", {
      totalEmployees,
      activeEmployees,
      remoteEmployees,
      departments: departments.length
    });
    
    res.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        remoteEmployees,
        departments: departments.length,
        recentEmployees,
        departmentDistribution,
        statusDistribution
      }
    });
    
  } catch (error) {
    console.error("❌ DASHBOARD ERROR:", error);
    console.error("❌ ERROR STACK:", error.stack);
    
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message
    });
  }
};
