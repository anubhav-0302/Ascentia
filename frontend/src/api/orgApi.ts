import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface Organization {
  id: number;
  name: string;
  code: string;
  subscriptionPlan: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    employees: number;
    leaveRequests: number;
    timesheets: number;
  };
}

export const getOrganizations = async (token: string): Promise<Organization[]> => {
  const response = await axios.get(`${API_BASE_URL}/organizations`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};

export const createOrganization = async (data: any, token: string): Promise<Organization> => {
  const response = await axios.post(`${API_BASE_URL}/organizations`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};

export const updateOrganization = async (id: number, data: any, token: string): Promise<Organization> => {
  const response = await axios.put(`${API_BASE_URL}/organizations/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};

export const deleteOrganization = async (id: number, token: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/organizations/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getAvailableOrganizations = async (token: string): Promise<any[]> => {
  const response = await axios.get(`${API_BASE_URL}/organizations/available`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};

export const switchOrganization = async (id: number, token: string): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/organizations/switch/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};

export const getAssignedOrganization = async (token: string): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/organizations/assigned`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};

export const assignOrgAdmin = async (orgId: number, userId: number, token: string): Promise<any> => {
  const response = await axios.post(`${API_BASE_URL}/organizations/${orgId}/orgAdmin`, 
    { userId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.data;
};

export const getOrgAdmins = async (orgId: number, token: string): Promise<any[]> => {
  const response = await axios.get(`${API_BASE_URL}/organizations/${orgId}/admins`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};
