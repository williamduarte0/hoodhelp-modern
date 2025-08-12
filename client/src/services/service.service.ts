import { ApiClient } from './api';
import type { Service, CreateServiceData, UpdateServiceData, ServiceFilters } from './types';

export const serviceService = {
  getAll: (filters: ServiceFilters = {}): Promise<Service[]> => {
    const params = new URLSearchParams();
    
    if (filters.category && filters.category.length > 0) {
      filters.category.forEach(cat => params.append('category', cat));
    }
    
    if (filters.minBudget) params.append('minBudget', filters.minBudget.toString());
    if (filters.maxBudget) params.append('maxBudget', filters.maxBudget.toString());
    if (filters.status) params.append('status', filters.status);
    
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }
    
    if (filters.search) params.append('search', filters.search);
    
    return ApiClient.get<Service[]>(`/services?${params.toString()}`);
  },

  getMyServices: (): Promise<Service[]> => {
    return ApiClient.get<Service[]>('/services/my-services');
  },

  getById: (id: string): Promise<Service> => {
    return ApiClient.get<Service>(`/services/${id}`);
  },

  create: (data: CreateServiceData): Promise<Service> => {
    return ApiClient.post<Service>('/services', data);
  },

  update: (id: string, data: UpdateServiceData): Promise<Service> => {
    return ApiClient.patch<Service>(`/services/${id}`, data);
  },

  delete: (id: string): Promise<void> => {
    return ApiClient.delete<void>(`/services/${id}`);
  },

  apply: (id: string): Promise<Service> => {
    return ApiClient.post<Service>(`/services/${id}/apply`, {});
  },

  selectApplicant: (id: string, applicantId: string): Promise<Service> => {
    return ApiClient.post<Service>(`/services/${id}/select-applicant/${applicantId}`, {});
  },

  getCategories: (): Promise<string[]> => {
    return ApiClient.get<string[]>('/services/categories');
  },

  getLocations: (): Promise<string[]> => {
    return ApiClient.get<string[]>('/services/locations');
  }
};
