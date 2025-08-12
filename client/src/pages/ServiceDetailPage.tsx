import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, User, Tag, MapPin, MessageCircle, ArrowLeft } from 'lucide-react';
import { GoogleMaps } from '@/components/ui/google-maps';
import { useService } from '../hooks/useServices';
import { useAuth } from '../contexts/AuthContext';
import { useCreateChat, useServiceChats, type Chat } from '../hooks/useChats';
import toast from 'react-hot-toast';

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const createChatMutation = useCreateChat();
  
  const { data: service, isLoading, error } = useService(id || '');
  const { data: serviceChats = [] } = useServiceChats(id || '');

  const previousRoute = location.state?.from || '/home';

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading service details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !service) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Not Found</h2>
          <p className="text-gray-600 mb-6">The service you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate(previousRoute)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </Layout>
    );
  }

  const isOwner = user?._id === service.requesterId._id;
      
  const hasActiveChat = serviceChats.some((chat: Chat) => 
    chat.interestedUserId._id === user?._id && chat.status === 'active'
  );

  const handleStartChat = async () => {
    if (!user) return;
    
    try {
      const chat = await createChatMutation.mutateAsync({
        serviceId: service._id,
        interestedUserId: user._id
      });
      
      toast.success('Chat started successfully!');
      navigate(`/chats/${chat._id}`);
    } catch (error) {
      toast.error('Failed to start chat');
    }
  };

  const handleViewChats = () => {
    navigate(`/services/${service._id}/chats`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(previousRoute)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>
        <p className="text-gray-600 mt-2">Service details and location</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <CardTitle className="text-xl mb-4">Service Details</CardTitle>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span>Requested by: {service.requesterId.name}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span>Budget: ${service.budget}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Posted: {formatDate(service.createdAt)}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>Location: {service.location?.address}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(service.category) ? (
                      service.category.map((cat: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {cat}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline">{service.category}</Badge>
                    )}
                  </div>
                </div>

                {service.tags && service.tags.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {service.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          <Tag className="w-3 h-3 mr-2" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {service.isUrgent && (
                  <div>
                    <Badge variant="destructive" className="text-sm">
                      Urgent
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {service.location && (
            <Card>
              <CardContent className="p-6">
                <CardTitle className="text-xl mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Service Location
                </CardTitle>
                <GoogleMaps
                  center={{
                    lat: service.location.latitude,
                    lng: service.location.longitude
                  }}
                  className="h-80 w-full rounded-lg"
                />
                <p className="text-sm text-gray-600 mt-3 text-center">
                  {service.location.address}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <CardTitle className="text-lg mb-4">Actions</CardTitle>
              
              {isOwner ? (
                <div className="space-y-3">
                  <Button
                    onClick={handleViewChats}
                    className="w-full"
                    disabled={serviceChats.length === 0}
                    variant="outline"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    View Chats ({serviceChats.length})
                  </Button>
                  <Button
                    onClick={() => navigate(`/services/edit/${service._id}`)}
                    className="w-full"
                  >
                    Edit Service
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {!hasActiveChat ? (
                    <Button
                      onClick={handleStartChat}
                      className="w-full"
                      disabled={createChatMutation.isPending}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {createChatMutation.isPending ? 'Starting Chat...' : 'Start Chat'}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat Started
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <CardTitle className="text-lg mb-4">Status</CardTitle>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={service.status === 'open' ? 'default' : 'secondary'}>
                    {service.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Applicants:</span>
                  <span className="font-medium">{service.applicants?.length || 0}</span>
                </div>
                {service.selectedApplicant && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selected:</span>
                    <span className="font-medium">{service.selectedApplicant.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
