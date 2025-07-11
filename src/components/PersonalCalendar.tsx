
import React, { useState, useMemo } from 'react';
import { Calendar } from '@/components/Calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Event, HelperTask, User } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { useTeam } from '@/contexts/TeamContext';
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
  const { currentUser } = useUser();
  const { getTeamsByUser } = useTeam();

  const userTeams = currentUser ? getTeamsByUser(currentUser.id, currentUser.role) : [];

  // Filter events based on user role and team assignments
  const personalEvents = useMemo(() => {
    if (!currentUser) return [];

    const filteredEvents = events.filter(event => {
      // Admins see all events
      if (currentUser.role === 'admin') return true;

      // Trainers see events for their assigned teams
      if (currentUser.role === 'trainer') {
        return !event.teamId || userTeams.some(team => team.id === event.teamId);
      }

      // Players see events for their teams
      if (currentUser.role === 'player') {
        return !event.teamId || userTeams.some(team => team.id === event.teamId);
      }

      // Parents see events for their children's teams
      if (currentUser.role === 'parent') {
        return !event.teamId || userTeams.some(team => team.id === event.teamId);
      }

      return false;
    });

    // Add helper tasks as events
    const helperEvents: Event[] = helperTasks
      .filter(task => task.assignedTo === currentUser.id || currentUser.role === 'admin')
      .map(task => ({
        id: `helper-${task.id}`,
        title: task.task,
        date: task.assignedDate,
        type: 'helper' as const,
        description: task.description,
        participants: [],
        createdBy: task.createdBy,
        helperTask: task
      }));

    return [...filteredEvents, ...helperEvents];
  }, [events, helperTasks, currentUser, userTeams]);

  // Filter events for upcoming list
  const upcomingEvents = personalEvents
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 10);

  // Get events for selected date
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
      case 'helper':
        return <Wrench className="h-4 w-4" />;
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
      case 'helper':
        return 'Helfereinsatz';
      default:
        return 'Event';
    }
  };

  const getHelperTaskStatusBadge = (task?: HelperTask) => {
    if (!task) return null;
    
    switch (task.status) {
      case 'open':
        return <Badge variant="outline" className="text-orange-600">Offen</Badge>;
      case 'completed':
        return <Badge className="bg-green-600">Erledigt</Badge>;
      case 'no-show':
        return <Badge variant="destructive">Nicht erschienen</Badge>;
    }
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Bitte melden Sie sich an, um Ihren persönlichen Kalender zu sehen.</p>
        </CardContent>
      </Card>
    );
  }

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
          <Tabs defaultValue="calendar" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calendar">Kalenderansicht</TabsTrigger>
              <TabsTrigger value="list">Listenansicht</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-4">
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
                  {/* Selected Day Events */}
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
                              {event.helperTask && (
                                <div className="mt-2">
                                  {getHelperTaskStatusBadge(event.helperTask)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">Keine Events an diesem Tag</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Team Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Meine Teams</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {userTeams.length > 0 ? (
                        <div className="space-y-2">
                          {userTeams.map((team) => (
                            <div key={team.id} className="flex items-center justify-between">
                              <span className="font-medium">{team.name}</span>
                              <Badge variant="outline">{team.season}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">Noch keinem Team zugewiesen</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Kommende Events</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                          onClick={() => onEventClick(event)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getEventTypeIcon(event.type)}
                              <span className="font-medium">{event.title}</span>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline">
                                {getEventTypeLabel(event.type)}
                              </Badge>
                              {event.helperTask && getHelperTaskStatusBadge(event.helperTask)}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{event.date.toLocaleDateString('de-DE')} {event.time && `um ${event.time}`}</p>
                            {event.location && <p>📍 {event.location}</p>}
                            {event.description && <p>{event.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Keine kommenden Events</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
