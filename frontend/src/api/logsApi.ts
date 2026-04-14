import { apiClient } from './apiClient';

export interface AuditLog {
  id: string;
  timestamp: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';
  entity: string;
  details: any;
  userId: number | null;
  userName: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface LogsResponse {
  success: boolean;
  data: {
    logs: AuditLog[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface LogStatistics {
  totalLogs: number;
  operations: Record<string, number>;
  entities: Record<string, number>;
  last24Hours: number;
  last7Days: number;
  last30Days: number;
}

export interface StatisticsResponse {
  success: boolean;
  data: LogStatistics;
}

export const logsApi = {
  // Get all audit logs with pagination and filtering
  getLogs: async (params?: {
    page?: number;
    limit?: number;
    operation?: string;
    entity?: string;
    userId?: string;
  }): Promise<LogsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.operation) queryParams.append('operation', params.operation);
    if (params?.entity) queryParams.append('entity', params.entity);
    if (params?.userId) queryParams.append('userId', params.userId);
    
    const response = await apiClient.get(`/logs?${queryParams.toString()}`);
    return response;
  },

  // Get log statistics
  getStatistics: async (): Promise<StatisticsResponse> => {
    const response = await apiClient.get('/logs/statistics');
    return response;
  }
};
