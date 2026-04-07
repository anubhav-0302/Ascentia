const BASE_URL = "http://localhost:5000/api";

// Get token from localStorage
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth-storage');
  }
  return null;
};

// Parse token from persisted storage
const parseToken = (): string | null => {
  const storage = getToken();
  if (storage) {
    try {
      const parsed = JSON.parse(storage);
      return parsed.state?.token || null;
    } catch {
      return null;
    }
  }
  return null;
};

export const apiClient = {
  get: async (endpoint: string) => {
    const token = parseToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    
    if (!res.ok) throw new Error(`API GET error: ${res.status} ${res.statusText}`);
    return res.json();
  },

  post: async (endpoint: string, data: any) => {
    const token = parseToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    
    if (!res.ok) throw new Error(`API POST error: ${res.status} ${res.statusText}`);
    return res.json();
  },

  put: async (endpoint: string, data: any) => {
    const token = parseToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    
    if (!res.ok) throw new Error(`API PUT error: ${res.status} ${res.statusText}`);
    return res.json();
  },

  delete: async (endpoint: string) => {
    const token = parseToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });
    
    if (!res.ok) throw new Error(`API DELETE error: ${res.status} ${res.statusText}`);
    return res.json();
  },
};
