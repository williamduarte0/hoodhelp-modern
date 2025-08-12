import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export class ApiClient {
  static async get<T>(endpoint: string): Promise<T> {
    const response = await apiClient.get<T>(endpoint);
    return response.data;
  }

  static async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await apiClient.post<T>(endpoint, data);
    return response.data;
  }

  static async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await apiClient.put<T>(endpoint, data);
    return response.data;
  }

  static async patch<T>(endpoint: string, data: any): Promise<T> {
    const response = await apiClient.patch<T>(endpoint, data);
    return response.data;
  }

  static async delete<T>(endpoint: string): Promise<T> {
    const response = await apiClient.delete<T>(endpoint);
    return response.data;
  }
}

export default apiClient;
