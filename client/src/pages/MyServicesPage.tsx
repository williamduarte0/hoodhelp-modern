import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ServiceCard } from '../components/ServiceCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Plus, Package, MessageCircle, Users } from 'lucide-react';
import { useMyServices } from '../hooks/useMyServices';

export const MyServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: myServices = [], isLoading, error } = useMyServices();

  const handleServiceClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
  };

  const handleCreateService = () => {
    navigate('/services/create', { state: { from: '/my-services' } });
  };

  const getServiceStats = () => {
    const totalServices = myServices.length;
    const activeServices = myServices.filter((service: any) => service.status === 'open').length;
    const totalChats = myServices.reduce((total: number, service: any) => {
      return total + (service.applicants?.length || 0);
    }, 0);

    return { totalServices, activeServices, totalChats };
  };

  const stats = getServiceStats();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your services...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
            <p className="text-gray-600 mt-2">Manage and track your posted services</p>
          </div>
          <Button onClick={handleCreateService} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Post New Service
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{stats.totalServices}</CardTitle>
                  <p className="text-gray-600">Total Services</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{stats.activeServices}</CardTitle>
                  <p className="text-gray-600">Active Services</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{stats.totalChats}</CardTitle>
                  <p className="text-gray-600">Total Chats</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load your services. Please try again.</p>
          </div>
        )}

        {!isLoading && !error && myServices.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
            <p className="text-gray-600 mb-6">
              Start helping others by posting your first service. It's easy and quick!
            </p>
           
          </div>
        )}

        {!isLoading && !error && myServices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myServices.map((service: any) => (
              <div key={service._id} className="cursor-pointer" onClick={() => handleServiceClick(service._id)}>
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
