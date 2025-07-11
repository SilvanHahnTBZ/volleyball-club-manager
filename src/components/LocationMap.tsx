
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Map } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
  location: string;
  title?: string;
  showMap?: boolean;
}

export const LocationMap: React.FC<LocationMapProps> = ({ 
  location, 
  title = "Standort",
  showMap = false 
}) => {
  // Simple geocoding mock - in real app you'd use a geocoding service
  const getCoordinates = (location: string): [number, number] => {
    // Default to Berlin coordinates
    const defaultCoords: [number, number] = [52.5200, 13.4050];
    
    // Simple location mapping for common volleyball venues
    const locationMap: { [key: string]: [number, number] } = {
      'sporthalle mitte': [52.5170, 13.3888],
      'sporthalle ost': [52.5232, 13.4127],
      'sporthalle west': [52.5145, 13.3501],
      'beachcourt stadtpark': [52.5318, 13.4015],
      'heimhalle': [52.5200, 13.4050],
    };
    
    const normalizedLocation = location.toLowerCase().trim();
    return locationMap[normalizedLocation] || defaultCoords;
  };

  const coordinates = getCoordinates(location);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

  if (!showMap) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">{location}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(googleMapsUrl, '_blank')}
          className="p-1 h-auto"
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium flex items-center gap-2">
            <Map className="h-4 w-4" />
            {title}
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(googleMapsUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Google Maps
          </Button>
        </div>
        
        <div className="mb-2">
          <p className="text-sm text-gray-600">{location}</p>
        </div>

        <div className="h-48 rounded-lg overflow-hidden border">
          <MapContainer
            center={coordinates}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={coordinates}>
              <Popup>
                <div className="text-center">
                  <p className="font-medium">{title}</p>
                  <p className="text-sm">{location}</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
};
