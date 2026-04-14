import { apiClient, BASE_URL } from './apiClient';

// Shared utility for authenticated fetch requests (used for CSV export)
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  // Get token from localStorage (same logic as apiClient)
  const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
      try {
        const storage = localStorage.getItem('auth-storage');
        if (storage) {
          const parsed = JSON.parse(storage);
          return parsed.state?.token || null;
        }
      } catch (error) {
        console.error('Error parsing token from localStorage:', error);
        return null;
      }
    }
    return null;
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });
};

export interface TimesheetEntry {
  id: number;
  employeeId: number;
  date: string;
  hours: number;
  description?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: number;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: number;
    name: string;
    email: string;
    department?: string;
  };
  approver?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateTimesheetRequest {
  date: string;
  hours: number;
  description?: string;
}

export interface UpdateTimesheetRequest {
  hours?: number;
  description?: string;
}

export interface ApproveTimesheetRequest {
  status: 'Approved' | 'Rejected';
  comments?: string;
}

// Get current user's timesheet
export const getMyTimesheet = async (params?: {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const queryString = new URLSearchParams();
  if (params?.startDate) queryString.append('startDate', params.startDate);
  if (params?.endDate) queryString.append('endDate', params.endDate);
  if (params?.page) queryString.append('page', params.page.toString());
  if (params?.limit) queryString.append('limit', params.limit.toString());
  
  const url = queryString.toString() 
    ? `/timesheet?${queryString.toString()}`
    : '/timesheet';
  
  const response = await apiClient.get(url);
  return response.data;
};

// Get all timesheets (admin only)
export const getAllTimesheets = async (params?: {
  startDate?: string;
  endDate?: string;
  employeeId?: number;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const queryString = new URLSearchParams();
  if (params?.startDate) queryString.append('startDate', params.startDate);
  if (params?.endDate) queryString.append('endDate', params.endDate);
  if (params?.employeeId) queryString.append('employeeId', params.employeeId.toString());
  if (params?.status) queryString.append('status', params.status);
  if (params?.page) queryString.append('page', params.page.toString());
  if (params?.limit) queryString.append('limit', params.limit.toString());
  
  const url = queryString.toString() 
    ? `/timesheet/all?${queryString.toString()}`
    : '/timesheet/all';
  
  const response = await apiClient.get(url);
  return response.data;
};

// Create new timesheet entry
export const createTimesheetEntry = async (data: CreateTimesheetRequest) => {
  const response = await apiClient.post('/timesheet', data);
  return response.data;
};

// Update timesheet entry
export const updateTimesheetEntry = async (id: number, data: UpdateTimesheetRequest) => {
  const response = await apiClient.put(`/timesheet/${id}`, data);
  return response.data;
};

// Approve/reject timesheet entry
export const approveTimesheetEntry = async (id: number, data: ApproveTimesheetRequest) => {
  const response = await apiClient.put(`/timesheet/${id}/approve`, data);
  return response.data;
};

// Delete timesheet entry
export const deleteTimesheetEntry = async (id: number) => {
  const response = await apiClient.delete(`/timesheet/${id}`);
  return response.data;
};

// Bulk approve/reject timesheet entries
export const bulkApproveTimesheets = async (data: {
  timesheetIds: number[];
  status: 'Approved' | 'Rejected';
  comments?: string;
}) => {
  const response = await apiClient.post('/timesheet/bulk-approve', data);
  return response.data;
};

// Get timesheet history for export
export const getTimesheetHistory = async (params?: {
  startDate?: string;
  endDate?: string;
  employeeId?: number;
  format?: 'json' | 'csv';
}) => {
  const queryString = new URLSearchParams();
  if (params?.startDate) queryString.append('startDate', params.startDate);
  if (params?.endDate) queryString.append('endDate', params.endDate);
  if (params?.employeeId) queryString.append('employeeId', params.employeeId.toString());
  if (params?.format) queryString.append('format', params.format);
  
  const url = queryString.toString() 
    ? `/timesheet/history?${queryString.toString()}`
    : '/timesheet/history';
  
  // For CSV export, we need to handle the response differently
  if (params?.format === 'csv') {
    const response = await authenticatedFetch(url, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to export CSV: ${response.statusText}`);
    }
    
    return response.blob();
  }
  
  const response = await apiClient.get(url);
  return response.data;
};
