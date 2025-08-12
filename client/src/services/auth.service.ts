import { ApiClient } from './api';
import type { AuthResponse, LoginCredentials, RegisterData } from './types';

export const authService = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> => {
    return ApiClient.post<AuthResponse>('/auth/login', credentials);
  },

  register: (userData: RegisterData): Promise<AuthResponse> => {
    return ApiClient.post<AuthResponse>('/auth/register', userData);
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },

  getUser: (): any => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setUser: (user: any): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};
