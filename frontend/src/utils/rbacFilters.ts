
// Get filtered employees based on current user's role
export const getFilteredEmployees = (employees: any[], currentUser: any) => {
  if (!currentUser || !Array.isArray(employees)) return [];
  
  // Filter out admin users from employee dropdowns
  return employees.filter(emp => {
    // Don't show admin users in employee dropdowns
    if (emp.role === 'admin') return false;
    
    // Don't show the current user themselves (unless they're admin/HR/manager)
    if (emp.id === currentUser.id && !['admin', 'hr', 'manager'].includes(currentUser.role)) {
      return false;
    }
    
    return true;
  });
};

// Check if user can access specific module/action
export const canAccess = (userRole: string, requiredRoles: string[]) => {
  return requiredRoles.includes(userRole);
};

// Get departments visible to user role
export const getVisibleDepartments = (departments: string[]) => {
  // All roles can see all departments for now
  // Can be customized based on business requirements
  return departments;
};

// Filter options for dropdowns based on role
export const filterDropdownOptions = (options: any[], userRole: string, excludeRoles: string[] = []) => {
  if (!Array.isArray(options)) return [];
  
  return options.filter(option => {
    // Exclude specific roles
    if (excludeRoles.length > 0 && option.role && excludeRoles.includes(option.role)) {
      return false;
    }
    
    // Don't show admin in employee-facing dropdowns
    if (option.role === 'admin' && !['admin', 'hr', 'manager'].includes(userRole)) {
      return false;
    }
    
    return true;
  });
};

// Performance management filters
export const getPerformanceAssignees = (employees: any[], currentUser: any) => {
  if (!currentUser || !Array.isArray(employees)) return [];
  
  return employees.filter(emp => {
    // Admin should not appear in goal/cycle assignment dropdowns
    if (emp.role === 'admin') return false;
    
    // Managers can assign to their team (not admins)
    if (currentUser.role === 'manager') {
      return emp.role !== 'admin' && emp.managerId === currentUser.id;
    }
    
    // HR can assign to anyone except admins
    if (currentUser.role === 'hr') {
      return emp.role !== 'admin';
    }
    
    // Admin can assign to anyone
    return true;
  });
};

// Payroll specific employee filtering
export const getPayrollAccessibleEmployees = (employees: any[], currentUser: any) => {
  if (!currentUser || !Array.isArray(employees)) return [];
  
  return employees.filter(emp => {
    // Don't show admin users in payroll dropdowns
    if (emp.role === 'admin') return false;
    
    // Employees can only see themselves
    if (currentUser.role === 'employee') {
      return emp.id === currentUser.id;
    }
    
    // Managers can see their team members
    if (currentUser.role === 'manager') {
      return emp.role !== 'admin' && emp.managerId === currentUser.id;
    }
    
    // HR can see all employees except admins
    if (currentUser.role === 'hr') {
      return emp.role !== 'admin';
    }
    
    // Admin can see everyone except other admins
    return emp.role !== 'admin';
  });
};
