import { BASE_URL } from './apiClient';

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
export const getProjects = async (token: string): Promise<Project[]> => {
  const response = await fetch(`${BASE_URL}/projects`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch projects');
  }

  const data = await response.json();
  return data.data;
};

// Get single project
export const getProject = async (id: number, token: string): Promise<Project> => {
  const response = await fetch(`${BASE_URL}/projects/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch project');
  }

  const data = await response.json();
  return data.data;
};

// Create project
export const createProject = async (projectData: CreateProjectData, token: string): Promise<Project> => {
  const response = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create project');
  }

  const data = await response.json();
  return data.data;
};

// Update project
export const updateProject = async (id: number, projectData: UpdateProjectData, token: string): Promise<Project> => {
  const response = await fetch(`${BASE_URL}/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update project');
  }

  const data = await response.json();
  return data.data;
};

// Delete project
export const deleteProject = async (id: number, token: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete project');
  }
};

// Assign employees to project
export const assignEmployees = async (id: number, assignments: AssignEmployeeData[], token: string): Promise<void> => {
  const url = `${BASE_URL}/projects/${id}/assign`;
  console.log('📡 API Call:', url, { id, assignments });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ assignments }),
  });

  console.log('📡 Response status:', response.status, response.statusText);

  if (!response.ok) {
    const text = await response.text();
    console.error('📡 Error response:', text.substring(0, 200));
    
    // Try to parse as JSON, fallback to text
    let errorMessage = 'Failed to assign employees';
    try {
      const errorJson = JSON.parse(text);
      errorMessage = errorJson.message || errorMessage;
    } catch {
      errorMessage = text.substring(0, 100) || `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
};

// Remove employee from project
export const removeEmployee = async (projectId: number, employeeId: number, token: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/projects/${projectId}/assign/${employeeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to remove employee');
  }
};

// Get current user's projects (where they are manager, lead, or assigned)
export const getMyProjects = async (token: string): Promise<MyProject[]> => {
  const response = await fetch(`${BASE_URL}/projects/my`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch my projects');
  }

  const data = await response.json();
  return data.data;
};

// Get all members of a project
export const getProjectMembers = async (projectId: number, token: string): Promise<ProjectMember[]> => {
  const response = await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch project members');
  }

  const data = await response.json();
  return data.data;
};

// Get employees available for project assignment
export const getAvailableEmployees = async (token: string, excludeProjectId?: number): Promise<AvailableEmployee[]> => {
  const url = excludeProjectId
    ? `${BASE_URL}/projects/available-employees?excludeProjectId=${excludeProjectId}`
    : `${BASE_URL}/projects/available-employees`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch available employees');
  }

  const data = await response.json();
  return data.data;
};
