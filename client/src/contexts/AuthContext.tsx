import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authService, type AuthResponse } from '../services';
import { userService } from '../services/user.service';
import type { User } from '../services/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompleteUser = async (userId: string) => {
    try {
      const completeUser = await userService.getById(userId);
      setUser(completeUser);
      authService.setUser(completeUser);
      return completeUser;
    } catch (error) {
      console.error('Error fetching complete user:', error);
      return null;
    }
  };

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (data: AuthResponse) => {
      authService.setToken(data.access_token);
      authService.setUser(data.user);
      
      await fetchCompleteUser(data.user.id);
      
      toast.success('Login successful!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: async (data: AuthResponse) => {
      authService.setToken(data.access_token);
      authService.setUser(data.user);
      
      await fetchCompleteUser(data.user.id);
      
      toast.success('Registration successful!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    const token = authService.getToken();
    const savedUser = authService.getUser();
    
    if (token && savedUser) {
      setUser(savedUser);
      if (savedUser._id) {
        fetchCompleteUser(savedUser._id);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return true;
    } catch (error) {
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      await registerMutation.mutateAsync({ name, email, password });
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Logout successful!');
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
    if (user) {
      authService.setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
