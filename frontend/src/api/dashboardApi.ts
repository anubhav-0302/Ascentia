import { apiClient } from "./apiClient";

// Dashboard statistics interface
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  remoteEmployees: number;
  departments: number;
  recentEmployees: Array<{
    id: number;
    name: string;
    jobTitle: string;
    status: string;
    createdAt: string;
    department?: string;
  }>;
  // Chart data
  departmentDistribution: Array<{
    name: string;
    count: number;
  }>;
  leaveStatus: Array<{
    status: string;
    count: number;
  }>;
  leaveTrends: Array<{
    month: string;
    approved: number;
    pending: number;
    rejected: number;
  }>;
  // Role-specific data
  teamAttendance?: number;
  avgPerformance?: number;
  hoursLogged?: number;
  performanceRating?: number;
  pendingTimesheetReviews?: number;
  payrollStatus?: string;
}

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await apiClient.get('/dashboard/stats');
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch dashboard statistics');
  } catch (error) {
    console.error('Failed to fetch dashboard statistics:', error);
    throw error;
  }
};

// Export dashboard API object for consistency
export const dashboardApi = {
  getStats: () => apiClient.get("/dashboard/stats"),
};
