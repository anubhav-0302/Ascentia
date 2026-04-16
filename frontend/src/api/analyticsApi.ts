import { apiClient } from "./apiClient";

// Analytics interfaces
export interface AnalyticsMetrics {
  employees?: {
    total: number;
    active: number;
    remote: number;
  };
  leave?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  timesheets?: {
    totalHours: number;
    avgHours: number;
  };
  performance?: {
    totalReviews: number;
    avgRating: number;
  };
}

export interface AnalyticsCharts {
  departmentDistribution?: Array<{ name: string; count: number }>;
  leaveTrends?: Array<{ month: string; approved: number; pending: number; rejected: number }>;
  leaveStatus?: Array<{ status: string; count: number }>;
  timesheetHours?: Array<{ week: string; hours: number }>;
  topPerformers?: Array<{ name: string; rating: number; department: string }>;
}

export interface AnalyticsInsight {
  type: string;
  title: string;
  description: string;
  trend: 'positive' | 'neutral' | 'negative';
  value: string;
}

export interface AnalyticsWarning {
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AnalyticsData {
  insights: AnalyticsInsight[];
  charts: AnalyticsCharts;
  metrics: AnalyticsMetrics;
  warnings: AnalyticsWarning[];
}

// Get advanced analytics
export const getAnalytics = async (): Promise<AnalyticsData> => {
  try {
    const response = await apiClient.get('/analytics');
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch analytics');
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    throw error;
  }
};
