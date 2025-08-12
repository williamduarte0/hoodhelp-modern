import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, User, DollarSign } from 'lucide-react';
import { useDeleteService } from '../hooks/useServices';
import type { Service } from '../services/types';

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const navigate = useNavigate();
  const deleteServiceMutation = useDeleteService();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isOwner = service.requesterId._id === localStorage.getItem('userId');

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) { return; }
    navigate(`/services/${service._id}`, { state: { from: window.location.pathname } });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteServiceMutation.mutateAsync(service._id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/services/edit/${service._id}`);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full" onClick={handleCardClick}>
        <CardContent className="p-6 h-full flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-3">
              {service.title}
            </h3>
            {isOwner && (
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={handleEdit} className="p-2 h-auto">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowDeleteModal(true)} 
                  className="p-2 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="mb-4 flex-1">
            <p className="text-sm text-gray-600 line-clamp-2 h-12 leading-6">
              {service.description}
            </p>
          </div>

          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {service.category.map((cat, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span className="font-medium">{service.requesterId.name}</span>
              </div>
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <DollarSign className="w-4 h-4" />
                <span>${service.budget}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
              
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Service</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{service.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteServiceMutation.isPending}
                className="flex-1"
              >
                {deleteServiceMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
