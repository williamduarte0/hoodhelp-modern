import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { GoogleMaps } from './google-maps';
import { LocationRangeInput } from './location-range-input';
import { MapPin, Check, AlertCircle } from 'lucide-react';
import { geocodingService } from '../../services/geocoding.service';
import { useUpdateUser } from '../../hooks/useUsers';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface SetupLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSet: () => void;
}

export const SetupLocationModal: React.FC<SetupLocationModalProps> = ({
  isOpen,
  onClose,
  onLocationSet
}) => {
  const { user } = useAuth();
  const updateUserMutation = useUpdateUser();
  
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [locationRange, setLocationRange] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && !location) {
      getCurrentLocation();
    }
  }, [isOpen]);

  const getCurrentLocation = () => {
    setIsLoading(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const address = await geocodingService.getAddressFromCoordinates(latitude, longitude);
          
          setLocation({ latitude, longitude, address });
        } catch (error) {
          console.error('Error getting address:', error);
          setLocation({ latitude, longitude, address: `${latitude}, ${longitude}` });
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location. Please check your browser permissions.');
        setIsLoading(false);
      }
    );
  };

  const handleLocationUpdate = async (newCoords: { lat: number; lng: number }) => {
    try {
      const address = await geocodingService.getAddressFromCoordinates(newCoords.lat, newCoords.lng);
      
      setLocation({
        latitude: newCoords.lat,
        longitude: newCoords.lng,
        address
      });
    } catch (error) {
      console.error('Error updating address:', error);
      setLocation(prev => prev ? {
        ...prev,
        latitude: newCoords.lat,
        longitude: newCoords.lng
      } : null);
    }
  };

  const handleSaveLocation = async () => {
    if (!location || !user) return;

    setIsSaving(true);
    
    try {
      await updateUserMutation.mutateAsync({
        id: user._id,
        data: { 
          location,
          locationRange
        }
      });
      
      toast.success('Location and range saved successfully!');
      
      onLocationSet();
      
      onClose();
    } catch (error) {
      toast.error('Failed to save location. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Set Your Location</h2>
              <p className="text-sm text-gray-600">Required to access the application</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Why is location required?</h3>
              <p className="text-sm text-blue-800">
                Your location helps us match you with nearby services and users. 
                This information is only visible to you and helps improve your experience.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Getting your location...</p>
          </div>
        ) : location ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Detected Location:</h3>
              <p className="text-gray-600 text-sm">{location.address}</p>
              <p className="text-xs text-gray-500 mt-1">
                Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            </div>

            <LocationRangeInput
              value={locationRange}
              onChange={setLocationRange}
              disabled={isSaving}
            />

            <GoogleMaps
              center={{ lat: location.latitude, lng: location.longitude }}
              range={locationRange}
              onLocationSelect={handleLocationUpdate}
              className="h-64"
            />

            <div className="flex gap-3">
              <Button
                onClick={handleSaveLocation}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Location & Continue'}
              </Button>
              <Button
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isSaving}
              >
                Refresh Location
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Unable to get your location.</p>
            <Button onClick={getCurrentLocation}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
