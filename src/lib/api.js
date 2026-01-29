const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Generic API request handler
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  const response = await fetch(url, config);
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
}

/**
 * Auth API
 */
export const authApi = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  logout: () => apiRequest('/auth/logout', {
    method: 'POST',
  }),
  
  getProfile: () => apiRequest('/auth/me'),
};

/**
 * Patients API
 */
export const patientsApi = {
  // Get all patients with optional filters
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/patients${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get single patient by ID
  getById: (id) => apiRequest(`/patients/${id}`),
  
  // Create new patient
  create: (patientData) => apiRequest('/patients', {
    method: 'POST',
    body: JSON.stringify(patientData),
  }),
  
  // Update patient (full update)
  update: (id, patientData) => apiRequest(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patientData),
  }),
  
  // Partial update (e.g., status change)
  patch: (id, partialData) => apiRequest(`/patients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(partialData),
  }),
  
  // Delete patient
  delete: (id) => apiRequest(`/patients/${id}`, {
    method: 'DELETE',
  }),
  
  // Get statistics
  getStats: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/patients/stats${queryString ? `?${queryString}` : ''}`);
  },
};

/**
 * Helper functions
 */
export const getStoredNurse = () => {
  if (typeof window === 'undefined') return null;
  const nurseData = localStorage.getItem('nurse');
  return nurseData ? JSON.parse(nurseData) : null;
};

export const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const clearAuthData = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('nurse');
};

export const isAuthenticated = () => {
  return !!getStoredToken();
};

export default apiRequest;
