// Auth API Service
import apiClient from "./client";

export const authService = {
  // Login
  login: async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response;
  },

  // Register
  register: async (userData) => {
    return apiClient.post("/auth/register", userData);
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
  },

  // Get current user
  getCurrentUser: async () => {
    return apiClient.get("/auth/me");
  },

  // Refresh token
  refreshToken: async () => {
    return apiClient.post("/auth/refresh");
  },

  // Forgot password
  forgotPassword: async (email) => {
    return apiClient.post("/auth/forgot-password", { email });
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    return apiClient.post("/auth/reset-password", { token, newPassword });
  },
};

export default authService;
