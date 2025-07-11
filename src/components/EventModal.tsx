
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Event } from '@/pages/Index';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, 'id'>) => void;
  initialDate: Date;
  editingEvent?: Event | null;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDate,
  editingEvent
}) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'training' as Event['type'],
    time: '',
    location: '',
    opponent: '',
    description: ''
  });

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        date: editingEvent.date.toISOString().split('T')[0],
        type: editingEvent.type,
        time: editingEvent.time || '',
        location: editingEvent.location || '',
        opponent: editingEvent.opponent || '',
        description: editingEvent.description || ''
      });
    } else {
      setFormData({
        title: '',
        date: initialDate.toISOString().split('T')[0],
        type: 'training',
        time: '',
        location: '',
        opponent: '',
        description: ''
      });
    }
  }, [editingEvent, initialDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData: Omit<Event, 'id'> = {
      title: formData.title,
      date: new Date(formData.date),
      type: formData.type,
      time: formData.time || undefined,
      location: formData.location || undefined,
      opponent: formData.opponent || undefined,
      description: formData.description || undefined
    };

    onSave(eventData);
    
    // Reset form
    setFormData({
      title: '',
      date: '',
      type: 'training',
      time: '',
      location: '',
      opponent: '',
      description: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? 'Event bearbeiten' : 'Neues Event erstellen'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="z.B. Training, Spiel vs. Team XY"
              required
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Uhrzeit</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Event-Typ *</Label>
            <Select value={formData.type} onValueChange={(value: Event['type']) => handleInputChange('type', value)}>
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

          <div className="space-y-2">
            <Label htmlFor="location">Ort</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="z.B. Sporthalle Mitte"
            />
          </div>

          {formData.type === 'game' && (
            <div className="space-y-2">
              <Label htmlFor="opponent">Gegner</Label>
              <Input
                id="opponent"
                value={formData.opponent}
                onChange={(e) => handleInputChange('opponent', e.target.value)}
                placeholder="Name des gegnerischen Teams"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Zusätzliche Informationen..."
              rows={3}
            />
          </div>

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
        </form>
      </DialogContent>
    </Dialog>
  );
};
