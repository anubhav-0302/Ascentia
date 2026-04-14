export const BASE_URL = "http://localhost:5000/api";

// Get token from localStorage (Zustand persist format)
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

// Clear token cache (for logout)
export const clearTokenCache = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth-storage');
  }
};

// Helper to get authorization headers
const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Adding Authorization header for protected request');
  } else {
    console.log('⚠️ No token found - request may fail for protected endpoints');
  }
  
  return headers;
};

export const apiClient = {
  get: async (endpoint: string) => {
    console.log(`📤 GET ${BASE_URL}${endpoint}`);
    
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    console.log(`📥 Response status: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ API GET error: ${res.status} ${res.statusText}`, errorText);
      throw new Error(`API GET error: ${res.status} ${res.statusText}`);
    }
    
    const result = await res.json();
    console.log(`✅ API GET response:`, result);
    return result;
  },

  post: async (endpoint: string, data: any) => {
    console.log(`📤 POST ${BASE_URL}${endpoint}`, data);
    
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    console.log(`📥 Response status: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ API POST error: ${res.status} ${res.statusText}`, errorText);
      throw new Error(`API POST error: ${res.status} ${res.statusText}`);
    }
    
    const result = await res.json();
    console.log(`✅ API POST response:`, result);
    return result;
  },

  put: async (endpoint: string, data: any) => {
    console.log(`📤 PUT ${BASE_URL}${endpoint}`, data);
    
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    console.log(`📥 Response status: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ API PUT error: ${res.status} ${res.statusText}`, errorText);
      throw new Error(`API PUT error: ${res.status} ${res.statusText}`);
    }
    
    const result = await res.json();
    console.log(`✅ API PUT response:`, result);
    return result;
  },

  delete: async (endpoint: string) => {
    console.log(`📤 DELETE ${BASE_URL}${endpoint}`);
    
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    
    console.log(`📥 Response status: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ API DELETE error: ${res.status} ${res.statusText}`, errorText);
      throw new Error(`API DELETE error: ${res.status} ${res.statusText}`);
    }
    
    const result = await res.json();
    console.log(`✅ API DELETE response:`, result);
    return result;
  },
};
