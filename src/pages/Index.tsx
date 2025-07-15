import React, { useState } from 'react';
import { PersonalCalendar } from '@/components/PersonalCalendar';
import { HelperTaskManagement } from '@/components/HelperTaskManagement';
import { EventModal } from '@/components/EventModal';
import { EventList } from '@/components/EventList';
import { LoginForm } from '@/components/LoginForm';
import { UserProfile } from '@/components/UserProfile';
import { TeamManagement } from '@/components/TeamManagement';
import { AdminUserManagement } from '@/components/AdminUserManagement';
import { AdminSetup } from '@/components/AdminSetup';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Volleyball, LogIn, LogOut, User, Users, Calendar as CalendarIcon, Wrench, Shield } from 'lucide-react';
import { Event, HelperTask } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { currentUser, hasPermission, logoutUser, loading } = useAuth();
  
  // Simplified static data
  const [events] = useState<Event[]>([
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
    }
  ]);

  const [helperTasks] = useState<HelperTask[]>([
    {
      id: '1',
      task: 'Schiedsrichter U16 Spiel',
      status: 'open',
      assignedTo: '3',
      assignedDate: new Date(2025, 6, 20),
      createdBy: '2',
      description: 'Schiedsrichter für das U16 Spiel am Samstag',
      priority: 'high'
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
    console.log('Adding event:', eventData);
    setIsModalOpen(false);
    toast({
      title: "Event erstellt",
      description: `"${eventData.title}" wurde erfolgreich erstellt.`,
    });
  };

  const handleEditEvent = (eventData: Omit<Event, 'id'>) => {
    console.log('Editing event:', eventData);
    setEditingEvent(null);
    setIsModalOpen(false);
    toast({
      title: "Event aktualisiert",
      description: `"${eventData.title}" wurde erfolgreich aktualisiert.`,
    });
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    console.log('Updating event:', updatedEvent);
  };

  const handleDeleteEvent = (eventId: string) => {
    console.log('Deleting event:', eventId);
    toast({
      title: "Event gelöscht",
      description: "Event wurde gelöscht.",
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

  const handleLogout = async () => {
    await logoutUser();
    toast({
      title: "Abgemeldet",
      description: "Sie wurden erfolgreich abgemeldet.",
    });
  };

  const getRoleColor = (roles: string[]) => {
    if (roles.includes('admin')) return 'text-red-600';
    if (roles.includes('trainer')) return 'text-blue-600';
    if (roles.includes('player')) return 'text-green-600';
    if (roles.includes('parent')) return 'text-purple-600';
    return 'text-gray-600';
  };

  const getRoleLabel = (roles: string[]) => {
    const roleLabels = roles.map(role => {
      switch (role) {
        case 'admin': return 'Administrator';
        case 'trainer': return 'Trainer';
        case 'player': return 'Spieler';
        case 'parent': return 'Elternteil';
        default: return role;
      }
    });
    return roleLabels.join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Volleyball className="h-12 w-12 mx-auto mb-4 text-orange-500 animate-spin" />
          <p className="text-gray-600">Wird geladen...</p>
        </div>
      </div>
    );
  }

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
                      <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${getRoleColor(currentUser.roles)}`}>
                        {getRoleLabel(currentUser.roles)}
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
            <TabsList className={`grid w-full ${hasPermission('manage_users') ? 'grid-cols-5' : 'grid-cols-4'}`}>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Kalender
              </TabsTrigger>
              {hasPermission('manage_teams') && (
                <TabsTrigger value="teams" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Teams
                </TabsTrigger>
              )}
              <TabsTrigger value="helper" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Helfereinsätze
              </TabsTrigger>
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Mein Kalender
              </TabsTrigger>
              {hasPermission('manage_users') && (
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="calendar" className="space-y-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <PersonalCalendar
                      events={events}
                      helperTasks={helperTasks}
                      selectedDate={selectedDate}
                      onDateSelect={setSelectedDate}
                      onDateDoubleClick={(date: Date) => hasPermission('create_event') ? openAddModal(date) : openViewModal(events[0])}
                      onEventClick={openViewModal}
                    />
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Kommende Events</h2>
                    <EventList 
                      events={events}
                      onEditEvent={openEditModal}
                      onDeleteEvent={handleDeleteEvent}
                      onViewEvent={openViewModal}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {hasPermission('manage_teams') && (
              <TabsContent value="teams" className="space-y-0">
                <TeamManagement />
              </TabsContent>
            )}

            <TabsContent value="helper" className="space-y-0">
              <HelperTaskManagement
                helperTasks={helperTasks}
                onCreateTask={(taskData) => console.log('Creating helper task:', taskData)}
                onUpdateTask={(taskId, updates) => console.log('Updating helper task:', taskId, updates)}
                onDeleteTask={(taskId) => console.log('Deleting helper task:', taskId)}
              />
            </TabsContent>

            <TabsContent value="personal" className="space-y-0">
              <PersonalCalendar
                events={events}
                helperTasks={helperTasks}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onDateDoubleClick={(date: Date) => hasPermission('create_event') ? openAddModal(date) : openViewModal(events[0])}
                onEventClick={openViewModal}
              />
            </TabsContent>

            {hasPermission('manage_users') && (
              <TabsContent value="admin" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <AdminUserManagement />
                  </div>
                  <div className="lg:col-span-1">
                    <AdminSetup />
                  </div>
                </div>
              </TabsContent>
            )}
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

      {/* Modals */}
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

      <LoginForm 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      <UserProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        events={events}
        helperTasks={helperTasks}
      />
    </div>
  );
};

export default Index;