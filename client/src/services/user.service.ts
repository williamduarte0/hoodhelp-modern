import { ApiClient } from './api';
import type { User, UpdateUserData } from './types';

export const userService = {
  getById: (id: string): Promise<User> => {
    return ApiClient.get<User>(`/users/${id}`);
  },

  update: (id: string, data: UpdateUserData): Promise<User> => {
    return ApiClient.patch<User>(`/users/${id}`, data);
  }
};
