import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { GoogleMaps } from './google-maps';
import { X, MapPin, Check } from 'lucide-react';
import { geocodingService } from '../../services/geocoding.service';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: { latitude: number; longitude: number; address: string }) => void;
  currentLocation?: { latitude: number; longitude: number; address: string } | null;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentLocation
}) => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !currentLocation) {
      getCurrentLocation();
    } else if (currentLocation) {
      setLocation(currentLocation);
    }
  }, [isOpen, currentLocation]);

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

  const handleConfirm = () => {
    if (location) {
      onConfirm(location);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Confirm Your Location
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Getting your location...</p>
          </div>
        ) : location ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Current Location:</h3>
              <p className="text-gray-600 text-sm">{location.address}</p>
              <p className="text-gray-500 text-xs mt-1">
                Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            </div>

            <GoogleMaps
              center={{ lat: location.latitude, lng: location.longitude }}
              onLocationSelect={handleLocationUpdate}
              className="h-64"
            />

            <div className="flex gap-3">
              <Button
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Confirm Location
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
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
