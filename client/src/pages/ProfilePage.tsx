import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TagInput } from '@/components/ui/tag-input';
import { LocationModal } from '@/components/ui/location-modal';
import { GoogleMaps } from '@/components/ui/google-maps';
import { LocationRangeInput } from '@/components/ui/location-range-input';
import { User, MapPin, DollarSign, Tag, Edit, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUpdateUser, useUser } from '../hooks/useUsers';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const updateUserMutation = useUpdateUser();
  
  const { data: completeUser, isLoading: isLoadingUser } = useUser(user?._id || '');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: null as any,
    interestCategories: [] as string[],
    desiredBudget: null as number | null,
    locationRange: 2
  });

  useEffect(() => {
    if (completeUser) {
      setFormData({
        name: completeUser.name || '',
        email: completeUser.email || '',
        location: completeUser.location || null,
        interestCategories: completeUser.interestCategories || [],
        desiredBudget: completeUser.desiredBudget || null,
        locationRange: completeUser.locationRange || 2
      });
    } else if (user) {  
      setFormData({
        name: user.name || '',
        email: user.email || '',
        location: user.location || null,
        interestCategories: user.interestCategories || [],
        desiredBudget: user.desiredBudget || null,
        locationRange: user.locationRange || 2
      });
    }
  }, [completeUser, user]);

  useEffect(() => {
    if (user && !completeUser) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        location: user.location || null,
        interestCategories: user.interestCategories || [],
        desiredBudget: user.desiredBudget || null,
        locationRange: user.locationRange || 2
      });
    }
  }, [user]);

  const handleCancel = () => {
    if (completeUser) {
      setFormData({
        name: completeUser.name || '',
        email: completeUser.email || '',
        location: completeUser.location || null,
        interestCategories: completeUser.interestCategories || [],
        desiredBudget: completeUser.desiredBudget || null,
        locationRange: completeUser.locationRange || 2
      });
    } else if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        location: user.location || null,
        interestCategories: user.interestCategories || [],
        desiredBudget: user.desiredBudget || null,
        locationRange: user.locationRange || 2
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationConfirm = (location: { latitude: number; longitude: number; address: string }) => {
    handleInputChange('location', location);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      await updateUserMutation.mutateAsync({
        id: user._id,
        data: formData
      });
      setIsEditing(false);
    } catch (error) {
    }
  };

  const isLoading = updateUserMutation.isPending || isLoadingUser;

  if (isLoadingUser) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and preferences</p>
        </div>
        
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="ml-3">Personal Information</CardTitle>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={isLoading}
                  />
                ) : (
                  <p className="font-medium text-gray-900">{completeUser?.name}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                
                  <p className="font-medium text-gray-900">{completeUser?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <CardTitle className="ml-3">Location & Range</CardTitle>
              </div>
              {formData.location && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Location Set
                </span>
              )}
            </div>
            
            <div className="space-y-4">
              {formData.location ? (
                <div className="space-y-4">
                  {isEditing && (
                    <LocationRangeInput
                      value={formData.locationRange}
                      onChange={(range) => handleInputChange('locationRange', range)}
                      disabled={isLoading}
                    />
                  )}
                  
                  <GoogleMaps
                    center={{ lat: formData.location.latitude, lng: formData.location.longitude }}
                    range={formData.locationRange}
                    className="h-64"
                  />
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-500 mb-1">Current Location</p>
                    <p className="font-medium text-gray-900">{formData.location.address}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Coordinates: {formData.location.latitude.toFixed(6)}, {formData.location.longitude.toFixed(6)}
                    </p>
                    {!isEditing && (
                      <p className="text-xs text-blue-600 mt-2">
                        Services within {formData.locationRange}km of your location will be shown
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No Location Set</p>
                  <p className="text-sm mb-4">Set your location to help others find you and for better service matching.</p>
                </div>
              )}
              
              {isEditing && (
                <Button
                  onClick={() => setIsLocationModalOpen(true)}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  disabled={isLoading}
                >
                  <MapPin className="w-4 h-4" />
                  {formData.location ? 'Update Location' : 'Set Location'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Tag className="w-5 h-5 text-purple-600" />
              </div>
              <CardTitle className="ml-3">Interest Categories</CardTitle>
            </div>
            
            <div className="space-y-4">
              {isEditing ? (
                <TagInput
                  label="Categories of Interest"
                  placeholder="Add a category"
                  value={formData.interestCategories}
                  onChange={(categories) => handleInputChange('interestCategories', categories)}
                />
              ) : (
                <div>
                  {formData.interestCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.interestCategories.map((category, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {category}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No categories set</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <CardTitle className="ml-3">Desired Budget</CardTitle>
            </div>
            
            <div className="space-y-4">
              {isEditing ? (
                <div>
                  <Label htmlFor="budget">Budget Range (CAD)</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.desiredBudget || ''}
                    onChange={(e) => handleInputChange('desiredBudget', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Enter your desired budget"
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <div>
                  {formData.desiredBudget ? (
                    <p className="font-medium text-gray-900">${formData.desiredBudget}</p>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No budget set</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onConfirm={handleLocationConfirm}
        currentLocation={formData.location}
      />
    </Layout>
  );
};
