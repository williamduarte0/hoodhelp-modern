import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SetupLocationModal } from './ui/setup-location-modal';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [locationModalClosed, setLocationModalClosed] = useState(false);

  useEffect(() => {
    if (user?.location) {
      setLocationModalClosed(false);
    }
  }, [user?.location]);

  const handleLocationSet = () => {
    setLocationModalClosed(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.location && !locationModalClosed) {
    return (
      <>
        <SetupLocationModal
          isOpen={true}
          onClose={() => {}}
          onLocationSet={handleLocationSet}
        />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Setting up your location</h2>
            <p className="text-gray-600">Please set your location to continue</p>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
};
