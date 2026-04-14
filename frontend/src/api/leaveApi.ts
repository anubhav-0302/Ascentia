import { apiClient } from "./apiClient";

// Leave request interface
export interface LeaveRequest {
  id: number;
  userId: number;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

// Create leave request interface
export interface CreateLeaveRequest {
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
}

// Leave API object
export const leaveApi = {
  // Create leave request
  createLeave: (data: CreateLeaveRequest) => apiClient.post("/leave", data),
  
  // Get current user's leave requests
  getMyLeaves: () => apiClient.get("/leave/my"),
  
  // Get all leave requests (admin only)
  getAllLeaves: () => apiClient.get("/leave"),
  
  // Update leave status (admin only)
  updateLeaveStatus: (id: number, status: string) => apiClient.put(`/leave/${id}`, { status }),

  // Cancel leave request (employee, pending only)
  cancelLeave: (id: number) => apiClient.delete(`/leave/${id}`),
};

// Export individual functions for convenience
export const createLeave = leaveApi.createLeave;
export const getMyLeaves = leaveApi.getMyLeaves;
export const getAllLeaves = leaveApi.getAllLeaves;
export const updateLeaveStatus = leaveApi.updateLeaveStatus;
export const cancelLeave = leaveApi.cancelLeave;
