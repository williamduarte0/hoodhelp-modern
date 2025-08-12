import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};
