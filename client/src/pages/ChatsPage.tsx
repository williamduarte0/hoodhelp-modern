import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User, MapPin, ArrowRight } from 'lucide-react';
import { useMyChats, useInterestedChats } from '../hooks/useChats';

export const ChatsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'my-services' | 'interested'>('my-services');
  
  const { data: myChats = [], isLoading: myChatsLoading } = useMyChats();
  const { data: interestedChats = [], isLoading: interestedLoading } = useInterestedChats();

  const isLoading = myChatsLoading || interestedLoading;

  const handleChatClick = (chatId: string) => {
    navigate(`/chats/${chatId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chats...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Chats</h1>
        <p className="text-gray-600 mt-2">Manage your service conversations</p>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('my-services')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'my-services'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Services ({myChats.length})
        </button>
        <button
          onClick={() => setActiveTab('interested')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'interested'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Interested ({interestedChats.length})
        </button>
      </div>

      {activeTab === 'my-services' ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Chats for My Services</h2>
          {myChats.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No chats yet</h3>
                <p className="text-gray-600 mb-4">
                  When people show interest in your services, their chats will appear here.
                </p>
                <Button onClick={() => navigate('/my-services')}>
                  View My Services
                </Button>
              </CardContent>
            </Card>
          ) : (
            myChats.map((chat) => (
              <Card 
                key={chat._id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleChatClick(chat._id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {chat.serviceId.title}
                        </h3>
                        {getStatusBadge(chat.status)}
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          <span>Interested: {chat.interestedUserId.name}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>Service: {chat.serviceId.description.substring(0, 100)}...</span>
                        </div>
                        
                        {chat.lastMessage && (
                          <div className="flex items-center">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            <span className="line-clamp-1">{chat.lastMessage}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-gray-500">
                        {formatDate(chat.lastMessageAt || chat.updatedAt)}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Chats for Services I'm Interested In</h2>
          {interestedChats.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No chats yet</h3>
                <p className="text-gray-600 mb-4">
                  When you start chats with service providers, they will appear here.
                </p>
                <Button onClick={() => navigate('/home')}>
                  Browse Services
                </Button>
              </CardContent>
            </Card>
          ) : (
            interestedChats.map((chat) => (
              <Card 
                key={chat._id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleChatClick(chat._id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {chat.serviceId.title}
                        </h3>
                        {getStatusBadge(chat.status)}
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          <span>Service Owner: {chat.serviceOwnerId.name}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>Service: {chat.serviceId.description.substring(0, 100)}...</span>
                        </div>
                        
                        {chat.lastMessage && (
                          <div className="flex items-center">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            <span className="line-clamp-1">{chat.lastMessage}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-gray-500">
                        {formatDate(chat.lastMessageAt || chat.updatedAt)}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </Layout>
  );
};
