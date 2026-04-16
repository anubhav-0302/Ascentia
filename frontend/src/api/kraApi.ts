import { apiClient } from './apiClient';

export interface KRA {
  id: number;
  goalId: number;
  title: string;
  description?: string;
  targetValue?: string;
  actualValue?: string;
  weightage: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
  dueDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKRARequest {
  goalId: number;
  title: string;
  description?: string;
  targetValue?: string;
  weightage?: number;
  dueDate?: string;
}

export interface UpdateKRARequest {
  title?: string;
  description?: string;
  targetValue?: string;
  actualValue?: string;
  weightage?: number;
  status?: string;
  dueDate?: string;
  completedDate?: string;
}

export const kraApi = {
  // Get all KRAs for a goal
  getKRAsByGoal: async (goalId: number) => {
    const response = await apiClient.get(`/kras/goal/${goalId}`);
    return response.data;
  },

  // Create a new KRA
  createKRA: async (data: CreateKRARequest) => {
    const response = await apiClient.post('/kras', data);
    return response;
  },

  // Update a KRA
  updateKRA: async (kraId: number, data: UpdateKRARequest) => {
    const response = await apiClient.put(`/kras/${kraId}`, data);
    return response;
  },

  // Delete a KRA
  deleteKRA: async (kraId: number) => {
    const response = await apiClient.delete(`/kras/${kraId}`);
    return response;
  }
};
