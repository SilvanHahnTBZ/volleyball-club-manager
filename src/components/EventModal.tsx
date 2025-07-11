
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Event } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { EventParticipation } from './EventParticipation';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, 'id'>) => void;
  onUpdate?: (event: Event) => void;
  initialDate: Date;
  editingEvent?: Event | null;
  viewOnly?: boolean;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  initialDate,
  editingEvent,
  viewOnly = false
}) => {
  const { currentUser, hasPermission } = useUser();
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'training' as Event['type'],
    time: '',
    location: '',
    venueType: 'indoor' as Event['venueType'],
    opponent: '',
    description: '',
    maxParticipants: '',
    requiresApproval: false
  });

  const canEdit = hasPermission('edit_event') && !viewOnly;
  const canCreate = hasPermission('create_event');

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        date: editingEvent.date.toISOString().split('T')[0],
        type: editingEvent.type,
        time: editingEvent.time || '',
        location: editingEvent.location || '',
        venueType: editingEvent.venueType || 'indoor',
        opponent: editingEvent.opponent || '',
        description: editingEvent.description || '',
        maxParticipants: editingEvent.maxParticipants?.toString() || '',
        requiresApproval: editingEvent.requiresApproval || false
      });
    } else {
      setFormData({
        title: '',
        date: initialDate.toISOString().split('T')[0],
        type: 'training',
        time: '',
        location: '',
        venueType: 'indoor',
        opponent: '',
        description: '',
        maxParticipants: '',
        requiresApproval: false
      });
    }
  }, [editingEvent, initialDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    const eventData: Omit<Event, 'id'> = {
      title: formData.title,
      date: new Date(formData.date),
      type: formData.type,
      time: formData.time || undefined,
      location: formData.location || undefined,
      venueType: formData.venueType,
      opponent: formData.opponent || undefined,
      description: formData.description || undefined,
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
      participants: editingEvent?.participants || [],
      createdBy: currentUser.id,
      requiresApproval: formData.requiresApproval
    };

    onSave(eventData);
    
    // Reset form
    setFormData({
      title: '',
      date: '',
      type: 'training',
      time: '',
      location: '',
      venueType: 'indoor',
      opponent: '',
      description: '',
      maxParticipants: '',
      requiresApproval: false
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    if (onUpdate) {
      onUpdate(updatedEvent);
    }
  };

  if (!currentUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {viewOnly 
              ? 'Event Details' 
              : editingEvent 
                ? 'Event bearbeiten' 
                : 'Neues Event erstellen'
            }
          </DialogTitle>
        </DialogHeader>
        
        {viewOnly && editingEvent ? (
          <div className="space-y-6">
            {/* Event Details anzeigen */}
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{editingEvent.title}</h3>
                <p className="text-gray-600">
                  {editingEvent.date.toLocaleDateString('de-DE', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  {editingEvent.time && ` um ${editingEvent.time}`}
                </p>
              </div>
              
              {editingEvent.location && (
                <div>
                  <Label className="text-sm font-medium">Ort</Label>
                  <p className="text-gray-700">{editingEvent.location}</p>
                </div>
              )}
              
              {editingEvent.opponent && (
                <div>
                  <Label className="text-sm font-medium">Gegner</Label>
                  <p className="text-gray-700">{editingEvent.opponent}</p>
                </div>
              )}
              
              {editingEvent.description && (
                <div>
                  <Label className="text-sm font-medium">Beschreibung</Label>
                  <p className="text-gray-700">{editingEvent.description}</p>
                </div>
              )}
            </div>
            
            {/* Teilnahme-Sektion */}
            <EventParticipation 
              event={editingEvent} 
              onUpdateEvent={handleUpdateEvent}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="z.B. Training, Spiel vs. Team XY"
                required
                disabled={!canEdit && !canCreate}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Datum *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                  disabled={!canEdit && !canCreate}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Uhrzeit</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  disabled={!canEdit && !canCreate}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Event-Typ *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: Event['type']) => handleInputChange('type', value)}
                disabled={!canEdit && !canCreate}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="game">Spiel</SelectItem>
                  <SelectItem value="tournament">Turnier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Ort</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="z.B. Sporthalle Mitte"
                  disabled={!canEdit && !canCreate}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="venueType">Spielort-Typ</Label>
                <Select 
                  value={formData.venueType} 
                  onValueChange={(value: Event['venueType']) => handleInputChange('venueType', value)}
                  disabled={!canEdit && !canCreate}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indoor">Halle</SelectItem>
                    <SelectItem value="beach">Beach</SelectItem>
                    <SelectItem value="club">Vereinsheim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.type === 'game' && (
              <div className="space-y-2">
                <Label htmlFor="opponent">Gegner</Label>
                <Input
                  id="opponent"
                  value={formData.opponent}
                  onChange={(e) => handleInputChange('opponent', e.target.value)}
                  placeholder="Name des gegnerischen Teams"
                  disabled={!canEdit && !canCreate}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max. Teilnehmer</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                placeholder="Leer lassen für unbegrenzt"
                disabled={!canEdit && !canCreate}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="requiresApproval"
                checked={formData.requiresApproval}
                onCheckedChange={(checked) => handleInputChange('requiresApproval', checked)}
                disabled={!canEdit && !canCreate}
              />
              <Label htmlFor="requiresApproval">Teilnahme erfordert Bestätigung</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Zusätzliche Informationen..."
                rows={3}
                disabled={!canEdit && !canCreate}
              />
            </div>

            {(canEdit || canCreate) && (
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Abbrechen
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  {editingEvent ? 'Speichern' : 'Erstellen'}
                </Button>
              </div>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
