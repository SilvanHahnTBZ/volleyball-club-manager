
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Edit, Trash2, Eye } from 'lucide-react';
import { Event } from '@/types';
import { useUser } from '@/contexts/UserContext';

interface EventListProps {
  events: Event[];
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  onViewEvent: (event: Event) => void;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  onEditEvent,
  onDeleteEvent,
  onViewEvent
}) => {
  const { currentUser, hasPermission } = useUser();
  
  // Sort events by date (upcoming first)
  const sortedEvents = [...events]
    .filter(event => event.date >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5); // Show only next 5 events

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'training':
        return 'bg-blue-100 text-blue-800';
      case 'game':
        return 'bg-orange-100 text-orange-800';
      case 'tournament':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeLabel = (type: Event['type']) => {
    switch (type) {
      case 'training':
        return 'Training';
      case 'game':
        return 'Spiel';
      case 'tournament':
        return 'Turnier';
      default:
        return type;
    }
  };

  const getVenueTypeIcon = (venueType?: Event['venueType']) => {
    switch (venueType) {
      case 'beach':
        return '🏖️';
      case 'club':
        return '🏠';
      default:
        return '🏢';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  };

  const isUserParticipating = (event: Event) => {
    return currentUser && event.participants.includes(currentUser.id);
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Keine kommenden Events</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedEvents.map(event => (
        <div
          key={event.id}
          className={`border rounded-lg p-4 hover:shadow-md transition-shadow bg-white ${
            isUserParticipating(event) ? 'ring-2 ring-green-200 bg-green-50' : 'border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium text-gray-900">{event.title}</h3>
                <Badge className={getEventTypeColor(event.type)}>
                  {getEventTypeLabel(event.type)}
                </Badge>
                {isUserParticipating(event) && (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Angemeldet
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(event.date)}</span>
                  {event.time && (
                    <>
                      <Clock className="h-4 w-4 ml-2" />
                      <span>{event.time}</span>
                    </>
                  )}
                </div>
                
                {event.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{getVenueTypeIcon(event.venueType)} {event.location}</span>
                  </div>
                )}
                
                {event.opponent && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>vs. {event.opponent}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {event.participants.length}
                    {event.maxParticipants && ` / ${event.maxParticipants}`} Teilnehmer
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-1 ml-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewEvent(event)}
                className="h-8 w-8 p-0 hover:bg-blue-50"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {hasPermission('edit_event') && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEditEvent(event)}
                  className="h-8 w-8 p-0 hover:bg-orange-50"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {hasPermission('delete_event') && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteEvent(event.id)}
                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {event.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
