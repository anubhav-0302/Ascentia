import { apiClient } from './apiClient';

export interface ProjectAssignment {
  id: number;
  projectId: number;
  employeeId: number;
  role: string;
  allocation?: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
  employee: {
    id: number;
    name: string;
    email: string;
    jobTitle?: string;
    avatar?: string;
  };
}

export interface ProjectTask {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigneeId?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  managerId: number;
  priority: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
  manager: {
    id: number;
    name: string;
    email: string;
  };
  assignments: ProjectAssignment[];
  tasks: ProjectTask[];
  teamSize?: number;
  completedTasks?: number;
  totalTasks?: number;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  managerId?: number;
  teamLeadId?: number;
  priority?: string;
  budget?: number;
  assignments?: number[];
}

export interface MyProject {
  id: number;
  name: string;
  description?: string;
  status: string;
  manager: {
    id: number;
    name: string;
    email: string;
  };
  myRole: string;
  myAllocation?: number;
  teamSize: number;
  totalTasks: number;
  createdAt: string;
}

export interface ProjectMember {
  id: number;
  role: string;
  allocation?: number;
  joinedAt: string;
  employee: {
    id: number;
    name: string;
    email: string;
    jobTitle?: string;
    department?: string;
    status: string;
  };
}

export interface AvailableEmployee {
  id: number;
  name: string;
  email: string;
  jobTitle?: string;
  department?: string;
  role: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  managerId?: number;
  teamLeadId?: number | null;
  priority?: string;
  budget?: number;
}

export interface AssignEmployeeData {
  employeeId: number;
  role?: string;
  allocation?: number;
}

// Get all projects
export const getProjects = async (): Promise<Project[]> => {
  const result = await apiClient.get('/projects');
  return result.data;
};

// Get single project
export const getProject = async (id: number): Promise<Project> => {
  const result = await apiClient.get(`/projects/${id}`);
  return result.data;
};

// Create project
export const createProject = async (projectData: CreateProjectData): Promise<Project> => {
  const result = await apiClient.post('/projects', projectData);
  return result.data;
};

// Update project
export const updateProject = async (id: number, projectData: UpdateProjectData): Promise<Project> => {
  const result = await apiClient.put(`/projects/${id}`, projectData);
  return result.data;
};

// Delete project
export const deleteProject = async (id: number): Promise<void> => {
  await apiClient.delete(`/projects/${id}`);
};

// Assign employees to project
export const assignEmployees = async (id: number, assignments: AssignEmployeeData[]): Promise<void> => {
  await apiClient.post(`/projects/${id}/assign`, { assignments });
};

// Remove employee from project
export const removeEmployee = async (projectId: number, employeeId: number): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}/assign/${employeeId}`);
};

// Get current user's projects (where they are manager, lead, or assigned)
export const getMyProjects = async (): Promise<MyProject[]> => {
  const result = await apiClient.get('/projects/my');
  return result.data;
};

// Get all members of a project
export const getProjectMembers = async (projectId: number): Promise<ProjectMember[]> => {
  const result = await apiClient.get(`/projects/${projectId}/members`);
  return result.data;
};

// Get employees available for project assignment
export const getAvailableEmployees = async (excludeProjectId?: number): Promise<AvailableEmployee[]> => {
  const endpoint = excludeProjectId
    ? `/projects/available-employees?excludeProjectId=${excludeProjectId}`
    : '/projects/available-employees';
  const result = await apiClient.get(endpoint);
  return result.data;
};
