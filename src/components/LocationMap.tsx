
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin } from 'lucide-react';

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
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

  if (!showMap) {
    return (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{location}</span>
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
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
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
        
        <div className="rounded-lg border bg-muted/50 p-8 text-center">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="font-medium mb-1">{location}</p>
          <p className="text-sm text-muted-foreground">Klicke auf "Google Maps" um die Route zu planen</p>
        </div>
      </CardContent>
    </Card>
  );
};
