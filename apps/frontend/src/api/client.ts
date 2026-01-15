/**
 * Axios HTTP client with JWT authentication.
 * Provides request/response interceptors for token handling.
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create axios instance with base config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// API endpoints
export const authAPI = {
  register: (email: string, password: string) =>
    apiClient.post("/auth/register", { email, password }),

  login: (email: string, password: string) => {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);
    return apiClient.post("/auth/login", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getMe: () => apiClient.get("/auth/me"),

  getGoogleAuthUrl: () => `${API_BASE_URL}/auth/google`,
  getGithubAuthUrl: () => `${API_BASE_URL}/auth/github`,
};

export const categoriesAPI = {
  list: (type?: "income" | "expense") =>
    apiClient.get("/categories", {
      params: type ? { category_type: type } : {},
    }),

  create: (name: string, type: "income" | "expense") =>
    apiClient.post("/categories", { name, type }),

  update: (id: number, name: string, type?: "income" | "expense") =>
    apiClient.put(`/categories/${id}`, { name, type }),

  delete: (id: number) => apiClient.delete(`/categories/${id}`),
};

export const transactionsAPI = {
  list: (params?: {
    page?: number;
    per_page?: number;
    category_id?: number;
    start_date?: string;
    end_date?: string;
    type?: "income" | "expense";
  }) => apiClient.get("/transactions", { params }),

  get: (id: number) => apiClient.get(`/transactions/${id}`),

  create: (data: {
    amount: number;
    description?: string;
    date: string;
    category_id: number;
  }) => apiClient.post("/transactions", data),

  update: (
    id: number,
    data: {
      amount?: number;
      description?: string;
      date?: string;
      category_id?: number;
    }
  ) => apiClient.put(`/transactions/${id}`, data),

  delete: (id: number) => apiClient.delete(`/transactions/${id}`),
};

export const reportsAPI = {
  getSummary: (startDate?: string, endDate?: string) =>
    apiClient.get("/reports/summary", {
      params: { start_date: startDate, end_date: endDate },
    }),

  getByCategory: (startDate?: string, endDate?: string) =>
    apiClient.get("/reports/by-category", {
      params: { start_date: startDate, end_date: endDate },
    }),

  getMonthlyTrends: (months?: number) =>
    apiClient.get("/reports/monthly", { params: { months } }),
};
