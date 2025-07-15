
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { Event } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface EventParticipationProps {
  event: Event;
  onUpdateEvent: (updatedEvent: Event) => void;
}

export const EventParticipation: React.FC<EventParticipationProps> = ({
  event,
  onUpdateEvent
}) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;

  const isParticipating = event.participants.includes(currentUser.id);
  const canJoin = !event.maxParticipants || event.participants.length < event.maxParticipants;

  const handleJoinEvent = () => {
    if (isParticipating) {
      // Verlassen
      const updatedEvent = {
        ...event,
        participants: event.participants.filter(id => id !== currentUser.id)
      };
      onUpdateEvent(updatedEvent);
      toast({
        title: "Abgemeldet",
        description: `Sie haben sich von "${event.title}" abgemeldet.`,
      });
    } else if (canJoin) {
      // Beitreten
      const updatedEvent = {
        ...event,
        participants: [...event.participants, currentUser.id]
      };
      onUpdateEvent(updatedEvent);
      toast({
        title: "Angemeldet",
        description: `Sie haben sich für "${event.title}" angemeldet.`,
      });
    }
  };

  const getParticipationStatus = () => {
    if (isParticipating) {
      return { text: 'Abmelden', icon: UserX, variant: 'outline' as const };
    } else if (canJoin) {
      return { text: 'Anmelden', icon: UserCheck, variant: 'default' as const };
    } else {
      return { text: 'Ausgebucht', icon: Clock, variant: 'outline' as const, disabled: true };
    }
  };

  const status = getParticipationStatus();
  const StatusIcon = status.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {event.participants.length}
            {event.maxParticipants && ` / ${event.maxParticipants}`} Teilnehmer
          </span>
        </div>
        
        {isParticipating && (
          <Badge variant="outline" className="text-green-600 border-green-200">
            Angemeldet
          </Badge>
        )}
      </div>

      <Button
        onClick={handleJoinEvent}
        variant={status.variant}
        disabled={status.disabled}
        className="w-full"
        size="sm"
      >
        <StatusIcon className="h-4 w-4 mr-2" />
        {status.text}
      </Button>

      {event.requiresApproval && !isParticipating && (
        <p className="text-xs text-gray-500 text-center">
          Teilnahme erfordert Bestätigung durch Trainer
        </p>
      )}
    </div>
  );
};
