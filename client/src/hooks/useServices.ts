import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService, type Service, type CreateServiceData, type UpdateServiceData, type ServiceFilters } from '../services';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export type { Service, CreateServiceData, UpdateServiceData, ServiceFilters };

export const serviceKeys = {
  all: ['services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: (filters: ServiceFilters) => [...serviceKeys.lists(), filters] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceKeys.details(), id] as const,
  categories: () => [...serviceKeys.all, 'categories'] as const,
};

export const useServices = (filters: ServiceFilters = {}) => {
  const { user } = useAuth();
  
  const enhancedFilters = { ...filters };
  
  return useQuery({
    queryKey: serviceKeys.list(enhancedFilters),
    queryFn: () => serviceService.getAll(enhancedFilters),
    staleTime: 2 * 60 * 1000,
    enabled: !!user,
  });
};

export const useService = (id: string) => {
  return useQuery<Service>({
    queryKey: serviceKeys.detail(id),
    queryFn: () => serviceService.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useServiceCategories = () => {
  return useQuery({
    queryKey: serviceKeys.categories(),
    queryFn: serviceService.getCategories,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['my-services'] });
      toast.success('Service created successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error creating service';
      toast.error(errorMessage);
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceData }) =>
      serviceService.update(id, data),
    onSuccess: (updatedService, { id }) => {
      queryClient.setQueryData(serviceKeys.detail(id), updatedService);
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      toast.success('Service updated successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error updating service';
      toast.error(errorMessage);
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceService.delete,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: serviceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      toast.success('Service deleted successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error deleting service';
      toast.error(errorMessage);
    },
  });
};

export const useApplyToService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceService.apply,
    onSuccess: (_, serviceId) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(serviceId) });
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      toast.success('Application submitted successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error applying to service';
      toast.error(errorMessage);
    },
  });
};

export const useSelectApplicant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, applicantId }: { serviceId: string; applicantId: string }) =>
      serviceService.selectApplicant(serviceId, applicantId),
    onSuccess: (_, { serviceId }) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(serviceId) });
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      toast.success('Applicant selected successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error selecting applicant';
      toast.error(errorMessage);
    },
  });
};
