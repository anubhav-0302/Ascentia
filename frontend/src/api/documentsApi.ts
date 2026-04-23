import { apiClient, getActiveOrgHeader } from './apiClient';

export const documentsApi = {
  // Upload a document
  upload: async (employeeId: number, file: File) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('employeeId', employeeId.toString());
    
    // Get token from localStorage
    const storage = localStorage.getItem('auth-storage');
    const token = storage ? JSON.parse(storage).state?.token : null;
    
    const response = await fetch(`http://localhost:5000/api/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        ...getActiveOrgHeader(),
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    
    return response.json();
  },

  // Get all documents for an employee
  getEmployeeDocuments: async (employeeId: number) => {
    const response = await apiClient.get(`/documents/${employeeId}`);
    return response;
  },

  // Delete a document
  delete: async (documentId: number) => {
    const response = await apiClient.delete(`/documents/${documentId}`);
    return response;
  },

  // Download a document
  download: async (documentId: number, fileName: string) => {
    // Get token from localStorage
    const storage = localStorage.getItem('auth-storage');
    const token = storage ? JSON.parse(storage).state?.token : null;
    
    const response = await fetch(`http://localhost:5000/api/documents/${documentId}/download`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        ...getActiveOrgHeader(),
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download document');
    }
    
    // Create download link
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
