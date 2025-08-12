import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService, type UpdateUserData } from '../services';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      userService.update(id, data),
    onSuccess: (updatedUser, { id }) => {
      queryClient.setQueryData(['user', id], updatedUser);
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error updating profile';
      toast.error(errorMessage);
    },
  });
};
