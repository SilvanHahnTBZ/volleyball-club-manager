
import React, { useState } from 'react';
import { Calendar } from '@/components/Calendar';
import { EventModal } from '@/components/EventModal';
import { EventList } from '@/components/EventList';
import { Button } from '@/components/ui/button';
import { Plus, Volleyball } from 'lucide-react';

export interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'training' | 'game' | 'tournament';
  time?: string;
  location?: string;
  opponent?: string;
  description?: string;
}

const Index = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Training',
      date: new Date(2025, 6, 15),
      type: 'training',
      time: '19:00',
      location: 'Sporthalle Mitte'
    },
    {
      id: '2',
      title: 'Spiel vs. Eagles',
      date: new Date(2025, 6, 18),
      type: 'game',
      time: '20:00',
      location: 'Heimhalle',
      opponent: 'Eagles Volleyball'
    },
    {
      id: '3',
      title: 'Stadtmeisterschaft',
      date: new Date(2025, 6, 25),
      type: 'tournament',
      time: '10:00',
      location: 'Zentrale Sporthalle'
    }
  ]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const handleAddEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString()
    };
    setEvents([...events, newEvent]);
    setIsModalOpen(false);
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
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const openAddModal = (date?: Date) => {
    setEditingEvent(null);
    if (date) {
      setSelectedDate(date);
    }
    setIsModalOpen(true);
  };

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
                <p className="text-sm text-gray-600">Kalender & Events</p>
              </div>
            </div>
            <Button 
              onClick={() => openAddModal()}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Event hinzufügen
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <Calendar 
                events={events}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onDateDoubleClick={openAddModal}
                onEventClick={openEditModal}
              />
            </div>
          </div>

          {/* Event List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Kommende Events</h2>
              <EventList 
                events={events}
                onEditEvent={openEditModal}
                onDeleteEvent={handleDeleteEvent}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <EventModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={editingEvent ? handleEditEvent : handleAddEvent}
        initialDate={selectedDate}
        editingEvent={editingEvent}
      />
    </div>
  );
};

export default Index;
