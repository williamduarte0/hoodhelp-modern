import React, { useEffect, useRef, useState } from 'react';

interface GoogleMapsProps {
  center: { lat: number; lng: number };
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  range?: number;   
  className?: string;
}

declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

export const GoogleMaps: React.FC<GoogleMapsProps> = ({ 
  center, 
  onLocationSelect, 
  range,
  className = "h-48 w-full" 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [rangeCircle, setRangeCircle] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        setIsLoaded(true);
      };
      
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
        delete window.initMap;
      };
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: center.lat, lng: center.lng },
        zoom: 16,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      const newMarker = new window.google.maps.Marker({
        position: { lat: center.lat, lng: center.lng },
        map: newMap,
        title: 'Your Location',
        draggable: true,
        animation: window.google.maps.Animation.DROP
      });

      if (range) {
        const newRangeCircle = new window.google.maps.Circle({
          strokeColor: '#3B82F6',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#3B82F6',
          fillOpacity: 0.1,
          map: newMap,
          center: { lat: center.lat, lng: center.lng },
          radius: range * 1000,
        });
        setRangeCircle(newRangeCircle);
      }

      if (onLocationSelect) {
        newMarker.addListener('dragend', () => {
          const position = newMarker.getPosition();
          const newPos = {
            lat: position.lat(),
            lng: position.lng()
          };
          
          if (rangeCircle && range) {
            rangeCircle.setCenter(newPos);
          }
          
          onLocationSelect(newPos);
        });
      }

      if (onLocationSelect) {
        newMap.addListener('click', (event: any) => {
          const position = event.latLng;
          const newPos = {
            lat: position.lat(),
            lng: position.lng()
          };
          
          newMarker.setPosition(position);
          
          if (rangeCircle && range) {
            rangeCircle.setCenter(newPos);
          }
          
          onLocationSelect(newPos);
        });
      }

      setMap(newMap);
      setMarker(newMarker);
    }
  }, [isLoaded, center, map, onLocationSelect, range]);

  useEffect(() => {
    if (map && marker && center) {
      const position = { lat: center.lat, lng: center.lng };
      map.setCenter(position);
      marker.setPosition(position);
      
      if (rangeCircle && range) {
        rangeCircle.setCenter(position);
      }
    }
  }, [center, map, marker, rangeCircle, range]);

  if (!isLoaded) {
    return (
      <div className={`${className} bg-gray-200 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div 
        ref={mapRef} 
        className={`${className} rounded-lg overflow-hidden border border-gray-300`}
      />
      {onLocationSelect && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Interactive Map:</strong> Click anywhere on the map to set a new location, 
            or drag the marker to adjust your position.
            {range && ` The blue circle shows your ${range}km range.`}
          </p>
        </div>
      )}
    </div>
  );
};
