import { apiClient } from './apiClient';

export interface PerformanceCycle {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed' | 'Archived';
  createdAt: string;
  updatedAt: string;
  goals?: Array<{ id: number }>;
  reviews?: Array<{ id: number }>;
}

export interface PerformanceGoal {
  id: number;
  cycleId: number;
  employeeId: number;
  title: string;
  description: string;
  targetDate: string;
  status: 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
  cycle?: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
  };
  employee?: {
    id: number;
    name: string;
    email: string;
    department: string;
  };
  reviews?: Array<{
    id: number;
    type: string;
    rating: number;
    status: string;
  }>;
}

export interface PerformanceReview {
  id: number;
  cycleId: number;
  goalId: number;
  employeeId: number;
  reviewerId: number;
  type: 'Self' | 'Manager';
  rating: number; // 1-5 scale
  comments?: string;
  status: 'Pending' | 'Submitted' | 'Approved';
  createdAt: string;
  updatedAt: string;
  cycle?: {
    id: number;
    name: string;
  };
  goal?: {
    id: number;
    title: string;
  };
  employee?: {
    id: number;
    name: string;
    email: string;
    department: string;
  };
  reviewer?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateCycleRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
}

export interface CreateGoalRequest {
  cycleId: number;
  employeeId: number;
  title: string;
  description?: string;
  targetDate: string;
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  targetDate?: string;
  status?: 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
}

export interface CreateReviewRequest {
  cycleId: number;
  goalId: number;
  employeeId: number;
  type: 'Self' | 'Manager';
  rating: number; // 1-5 scale
  comments?: string;
}

export interface UpdateReviewRequest {
  rating?: number; // 1-5 scale
  comments?: string;
  status?: 'Pending' | 'Submitted' | 'Approved';
}

// Performance Cycles
export const getPerformanceCycles = async () => {
  const response = await apiClient.get('/performance/cycles');
  return response.data;
};

export const createPerformanceCycle = async (data: CreateCycleRequest) => {
  const response = await apiClient.post('/performance/cycles', data);
  return response.data;
};

// Performance Goals
export const getPerformanceGoals = async (params?: {
  cycleId?: number;
  employeeId?: number;
  status?: string;
}) => {
  const queryString = new URLSearchParams();
  if (params?.cycleId) queryString.append('cycleId', params.cycleId.toString());
  if (params?.employeeId) queryString.append('employeeId', params.employeeId.toString());
  if (params?.status) queryString.append('status', params.status);
  
  const url = queryString.toString() 
    ? `/performance/goals?${queryString.toString()}`
    : '/performance/goals';
  
  const response = await apiClient.get(url);
  return response.data;
};

export const createPerformanceGoal = async (data: CreateGoalRequest) => {
  const response = await apiClient.post('/performance/goals', data);
  return response.data;
};

export const updatePerformanceGoal = async (id: number, data: UpdateGoalRequest) => {
  const response = await apiClient.put(`/performance/goals/${id}`, data);
  return response.data;
};

// Performance Reviews
export const getPerformanceReviews = async (params?: {
  cycleId?: number;
  goalId?: number;
  employeeId?: number;
  reviewerId?: number;
  type?: string;
  status?: string;
}) => {
  const queryString = new URLSearchParams();
  if (params?.cycleId) queryString.append('cycleId', params.cycleId.toString());
  if (params?.goalId) queryString.append('goalId', params.goalId.toString());
  if (params?.employeeId) queryString.append('employeeId', params.employeeId.toString());
  if (params?.reviewerId) queryString.append('reviewerId', params.reviewerId.toString());
  if (params?.type) queryString.append('type', params.type);
  if (params?.status) queryString.append('status', params.status);
  
  const url = queryString.toString() 
    ? `/performance/reviews?${queryString.toString()}`
    : '/performance/reviews';
  
  const response = await apiClient.get(url);
  return response.data;
};

export const createPerformanceReview = async (data: CreateReviewRequest) => {
  const response = await apiClient.post('/performance/reviews', data);
  return response.data;
};

export const updatePerformanceReview = async (id: number, data: UpdateReviewRequest) => {
  const response = await apiClient.put(`/performance/reviews/${id}`, data);
  return response.data;
};
