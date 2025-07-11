import React, { useState } from 'react';
import { Calendar } from '@/components/Calendar';
import { EventModal } from '@/components/EventModal';
import { EventList } from '@/components/EventList';
import { LoginForm } from '@/components/LoginForm';
import { UserProfile } from '@/components/UserProfile';
import { TeamManagement } from '@/components/TeamManagement';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Volleyball, LogIn, LogOut, User, Users, Calendar as CalendarIcon, Settings } from 'lucide-react';
import { Event } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { useTeam } from '@/contexts/TeamContext';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { currentUser, hasPermission, logoutUser } = useUser();
  const { getTeamsByUser } = useTeam();
  
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Training U14 M',
      date: new Date(2025, 6, 15),
      type: 'training',
      time: '19:00',
      location: 'Sporthalle Mitte',
      venueType: 'indoor',
      participants: ['1', '2'],
      createdBy: '2',
      maxParticipants: 12,
      teamId: '1'
    },
    {
      id: '2',
      title: 'Spiel vs. Eagles',
      date: new Date(2025, 6, 18),
      type: 'game',
      time: '20:00',
      location: 'Heimhalle',
      venueType: 'indoor',
      opponent: 'Eagles Volleyball',
      participants: ['1', '2', '3'],
      createdBy: '2',
      maxParticipants: 14,
      teamId: '3'
    },
    {
      id: '3',
      title: 'Beach Volleyball Turnier',
      date: new Date(2025, 6, 25),
      type: 'tournament',
      time: '10:00',
      location: 'Beachcourt Stadtpark',
      venueType: 'beach',
      participants: ['1'],
      createdBy: '1',
      maxParticipants: 8
    }
  ]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewOnlyMode, setViewOnlyMode] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar');

  const handleAddEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString()
    };
    setEvents([...events, newEvent]);
    setIsModalOpen(false);
    toast({
      title: "Event erstellt",
      description: `"${newEvent.title}" wurde erfolgreich erstellt.`,
    });
  };

  const handleEditEvent = (eventData: Omit<Event, 'id'>) => {
    if (editingEvent) {
      setEvents(events.map(event => 
        event.id === editingEvent.id 
          ? { ...eventData, id: editingEvent.id }
          : event
      ));
      setEditingEvent(null);
      setIsModalOpen(false);
      toast({
        title: "Event aktualisiert",
        description: `"${eventData.title}" wurde erfolgreich aktualisiert.`,
      });
    }
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    setEvents(events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
  };

  const handleDeleteEvent = (eventId: string) => {
    const eventToDelete = events.find(e => e.id === eventId);
    setEvents(events.filter(event => event.id !== eventId));
    toast({
      title: "Event gelöscht",
      description: `"${eventToDelete?.title}" wurde gelöscht.`,
    });
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setViewOnlyMode(false);
    setIsModalOpen(true);
  };

  const openViewModal = (event: Event) => {
    setEditingEvent(event);
    setViewOnlyMode(true);
    setIsModalOpen(true);
  };

  const openAddModal = (date?: Date) => {
    setEditingEvent(null);
    setViewOnlyMode(false);
    if (date) {
      setSelectedDate(date);
    }
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    logoutUser();
    toast({
      title: "Abgemeldet",
      description: "Sie wurden erfolgreich abgemeldet.",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600';
      case 'trainer': return 'text-blue-600';
      case 'player': return 'text-green-600';
      case 'parent': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'trainer': return 'Trainer';
      case 'player': return 'Spieler';
      case 'parent': return 'Elternteil';
      default: return role;
    }
  };

  const userEvents = currentUser ? events.filter(event => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'trainer') {
      const userTeams = getTeamsByUser(currentUser.id, currentUser.role);
      return event.teamId ? userTeams.some(team => team.id === event.teamId) : true;
    }
    if (currentUser.role === 'player') {
      const userTeams = getTeamsByUser(currentUser.id, currentUser.role);
      return event.teamId ? userTeams.some(team => team.id === event.teamId) : true;
    }
    return true;
  }) : events;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-orange-500 to-blue-600 p-2 rounded-lg">
                <Volleyball className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Volleyball Team</h1>
                <p className="text-sm text-gray-600">Kalender & Team-Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsProfileOpen(true)}
                      className="flex items-center space-x-2"
                    >
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{currentUser.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${getRoleColor(currentUser.role)}`}>
                        {getRoleLabel(currentUser.role)}
                      </span>
                    </Button>
                  </div>
                  
                  {hasPermission('create_event') && (
                    <Button 
                      onClick={() => openAddModal()}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Event hinzufügen
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="border-gray-200"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Abmelden
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsLoginOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Anmelden
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {currentUser ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Kalender
              </TabsTrigger>
              <TabsTrigger value="teams" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Teams
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <Calendar 
                      events={userEvents}
                      selectedDate={selectedDate}
                      onDateSelect={setSelectedDate}
                      onDateDoubleClick={(date: Date) => hasPermission('create_event') ? openAddModal(date) : openViewModal(userEvents.find(e => e.date.toDateString() === date.toDateString()) || userEvents[0])}
                      onEventClick={openViewModal}
                    />
                  </div>
                </div>

                {/* Event List */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Kommende Events</h2>
                    <EventList 
                      events={userEvents}
                      onEditEvent={openEditModal}
                      onDeleteEvent={handleDeleteEvent}
                      onViewEvent={openViewModal}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="teams" className="space-y-0">
              <TeamManagement />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-white rounded-xl shadow-lg p-12">
            <Volleyball className="h-16 w-16 mx-auto mb-6 text-orange-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Willkommen beim Volleyball Team
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Melden Sie sich an, um Events zu sehen, Teams zu verwalten und am Teamleben teilzunehmen.
            </p>
            <Button
              onClick={() => setIsLoginOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Jetzt anmelden
            </Button>
          </div>
        </div>
      )}

      {/* Event Modal */}
      <EventModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
          setViewOnlyMode(false);
        }}
        onSave={editingEvent ? handleEditEvent : handleAddEvent}
        onUpdate={handleUpdateEvent}
        initialDate={selectedDate}
        editingEvent={editingEvent}
        viewOnly={viewOnlyMode}
      />

      {/* Login Modal */}
      <LoginForm 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* User Profile Modal */}
      <UserProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
      />
    </div>
  );
};

export default Index;
