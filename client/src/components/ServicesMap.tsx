import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Service } from '../services/types';

declare global {
  interface Window {
    google: any;
  }
}

interface ServicesMapProps {
  services: Service[];
  userLocation?: { latitude: number; longitude: number };
}

export const ServicesMap: React.FC<ServicesMapProps> = ({ services, userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [infoWindow, setInfoWindow] = useState<any>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const center = userLocation || { latitude: 43.6532, longitude: -79.3832 };

    const newMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: center.latitude, lng: center.longitude },
      zoom: 15,
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'transit',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'landscape',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    const zoomControlDiv = document.createElement('div');
    zoomControlDiv.style.position = 'absolute';
    zoomControlDiv.style.top = '10px';
    zoomControlDiv.style.right = '10px';
    zoomControlDiv.style.zIndex = '1';
    
    const zoomInButton = document.createElement('button');
    zoomInButton.innerHTML = '+';
    zoomInButton.style.width = '32px';
    zoomInButton.style.height = '32px';
    zoomInButton.style.backgroundColor = 'white';
    zoomInButton.style.border = '1px solid #ccc';
    zoomInButton.style.borderRadius = '4px';
    zoomInButton.style.fontSize = '18px';
    zoomInButton.style.fontWeight = 'bold';
    zoomInButton.style.cursor = 'pointer';
    zoomInButton.style.marginBottom = '4px';
    zoomInButton.onclick = () => newMap.setZoom((newMap.getZoom() || 12) + 1);
    
    const zoomOutButton = document.createElement('button');
    zoomOutButton.innerHTML = '−';
    zoomOutButton.style.width = '32px';
    zoomOutButton.style.height = '32px';
    zoomOutButton.style.backgroundColor = 'white';
    zoomOutButton.style.border = '1px solid #ccc';
    zoomOutButton.style.borderRadius = '4px';
    zoomOutButton.style.fontSize = '18px';
    zoomOutButton.style.fontWeight = 'bold';
    zoomOutButton.style.cursor = 'pointer';
    zoomOutButton.onclick = () => newMap.setZoom((newMap.getZoom() || 12) - 1);
    
    zoomControlDiv.appendChild(zoomInButton);
    zoomControlDiv.appendChild(zoomOutButton);
    
    newMap.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(zoomControlDiv);

    setMap(newMap);

    const newInfoWindow = new window.google.maps.InfoWindow();
    setInfoWindow(newInfoWindow);

    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
  }, [userLocation]);

  useEffect(() => {
    if (!map || !infoWindow) return;

    markers.forEach(marker => marker.setMap(null));

    const newMarkers: any[] = [];

    services.forEach(service => {
      if (!service.location) return;

      const markerIcon = {
        url: createCustomMarkerIcon(),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40)
      };

      const marker = new window.google.maps.Marker({
        position: { lat: service.location.latitude, lng: service.location.longitude },
        map: map,
        icon: markerIcon,
        title: service.title
      });

      marker.addListener('click', () => {
        const content = createInfoWindowContent(service);
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  }, [map, services, infoWindow]);

  const createCustomMarkerIcon = () => {
    const svg = `
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="#1E40AF" stroke-width="2"/>
        <text x="20" y="26" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">$$</text>
      </svg>
    `;
    
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  };

  const createInfoWindowContent = (service: Service) => {
    return `
      <div class="p-3 max-w-xs">
        <div class="flex justify-between items-start mb-3">
          <div class="font-semibold text-lg text-gray-900">${service.title}</div>
          <button 
            onclick="window.open('/services/${service._id}', '_blank')"
            class="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
          >
            See Details
          </button>
        </div>
        <div class="text-sm text-gray-600 mb-3 line-clamp-2">${service.description}</div>
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-1 text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            ${service.requesterId.name}
          </div>
          <div class="flex items-center gap-1 text-green-600 font-semibold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            </svg>
            $${service.budget}
          </div>
        </div>
        <div class="flex flex-wrap gap-1 mt-2">
          ${service.category.map(cat => `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${cat}</span>`).join('')}
        </div>
      </div>
    `;
  };

  return (
    <Card className="h-96">
      <CardContent className="p-0 h-full">
        <div ref={mapRef} className="w-full h-full rounded-lg" />
      </CardContent>
    </Card>
  );
};
