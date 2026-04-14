import { apiClient } from './apiClient';

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
}) => {
  const queryString = new URLSearchParams();
  if (params?.startDate) queryString.append('startDate', params.startDate);
  if (params?.endDate) queryString.append('endDate', params.endDate);
  
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
}) => {
  const queryString = new URLSearchParams();
  if (params?.startDate) queryString.append('startDate', params.startDate);
  if (params?.endDate) queryString.append('endDate', params.endDate);
  if (params?.employeeId) queryString.append('employeeId', params.employeeId.toString());
  if (params?.status) queryString.append('status', params.status);
  
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
    const response = await fetch(`http://localhost:5000/api${url}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')!).state?.token : ''}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to export CSV: ${response.statusText}`);
    }
    
    return response.blob();
  }
  
  const response = await apiClient.get(url);
  return response.data;
};
