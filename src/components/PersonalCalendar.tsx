
import React from 'react';
import { Calendar } from '@/components/Calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Event, HelperTask } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar as CalendarIcon, Users, Wrench, Trophy } from 'lucide-react';

interface PersonalCalendarProps {
  events: Event[];
  helperTasks: HelperTask[];
  onEventClick: (event: Event) => void;
  onDateSelect: (date: Date) => void;
  onDateDoubleClick: (date: Date) => void;
  selectedDate: Date;
}

export const PersonalCalendar: React.FC<PersonalCalendarProps> = ({
  events,
  helperTasks,
  onEventClick,
  onDateSelect,
  onDateDoubleClick,
  selectedDate
}) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Bitte melden Sie sich an, um Ihren persönlichen Kalender zu sehen.</p>
        </CardContent>
      </Card>
    );
  }

  // Simple filtering without complex logic
  const personalEvents = events.filter(event => {
    if (currentUser.roles.includes('admin')) return true;
    return !event.teamId || currentUser.teams.includes(event.teamId);
  });

  const dayEvents = personalEvents.filter(event => 
    event.date.toDateString() === selectedDate.toDateString()
  );

  const getEventTypeIcon = (type: Event['type']) => {
    switch (type) {
      case 'training':
        return <Users className="h-4 w-4" />;
      case 'game':
        return <Trophy className="h-4 w-4" />;
      case 'tournament':
        return <Trophy className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
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
        return 'Event';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Mein Kalender - {currentUser.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Calendar
                events={personalEvents}
                selectedDate={selectedDate}
                onDateSelect={onDateSelect}
                onDateDoubleClick={onDateDoubleClick}
                onEventClick={onEventClick}
              />
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedDate.toLocaleDateString('de-DE', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dayEvents.length > 0 ? (
                    <div className="space-y-3">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                          onClick={() => onEventClick(event)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {getEventTypeIcon(event.type)}
                            <span className="font-medium">{event.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {getEventTypeLabel(event.type)}
                            </Badge>
                          </div>
                          {event.time && (
                            <p className="text-sm text-gray-600">{event.time}</p>
                          )}
                          {event.location && (
                            <p className="text-sm text-gray-600">{event.location}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Keine Events an diesem Tag</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
