
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Team, User } from '@/types';
import { useTeam } from '@/contexts/TeamContext';
import { useUser } from '@/contexts/UserContext';
import { Search, UserPlus, UserMinus, Crown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TeamAssignmentProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
}

export const TeamAssignment: React.FC<TeamAssignmentProps> = ({ isOpen, onClose, team }) => {
  const { addPlayerToTeam, removePlayerFromTeam, addTrainerToTeam, removeTrainerFromTeam, getTeamPlayers, getTeamTrainers } = useTeam();
  const { users } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'players' | 'trainers'>('players');

  const teamPlayers = getTeamPlayers(team.id, users);
  const teamTrainers = getTeamTrainers(team.id, users);

  const availableUsers = users.filter(user => {
    if (activeTab === 'players') {
      return (user.role === 'player' || user.role === 'parent') && 
             !team.players.includes(user.id) &&
             user.name.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      return (user.role === 'trainer' || user.role === 'admin') && 
             !team.trainers.includes(user.id) &&
             user.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

  const handleAddUser = (userId: string) => {
    if (activeTab === 'players') {
      addPlayerToTeam(team.id, userId);
      const user = users.find(u => u.id === userId);
      toast({
        title: "Spieler hinzugefügt",
        description: `${user?.name} wurde zum Team ${team.name} hinzugefügt.`,
      });
    } else {
      addTrainerToTeam(team.id, userId);
      const user = users.find(u => u.id === userId);
      toast({
        title: "Trainer hinzugefügt",
        description: `${user?.name} wurde als Trainer für Team ${team.name} hinzugefügt.`,
      });
    }
  };

  const handleRemoveUser = (userId: string) => {
    if (activeTab === 'players') {
      removePlayerFromTeam(team.id, userId);
      const user = users.find(u => u.id === userId);
      toast({
        title: "Spieler entfernt",
        description: `${user?.name} wurde aus dem Team ${team.name} entfernt.`,
      });
    } else {
      removeTrainerFromTeam(team.id, userId);
      const user = users.find(u => u.id === userId);
      toast({
        title: "Trainer entfernt",
        description: `${user?.name} wurde als Trainer für Team ${team.name} entfernt.`,
      });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Team-Zuweisungen: {team.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={activeTab === 'players' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('players')}
              className="flex-1"
            >
              Spieler ({teamPlayers.length})
            </Button>
            <Button
              variant={activeTab === 'trainers' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('trainers')}
              className="flex-1"
            >
              Trainer ({teamTrainers.length})
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`${activeTab === 'players' ? 'Spieler' : 'Trainer'} suchen...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {/* Current Team Members */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">
                Aktuelle {activeTab === 'players' ? 'Spieler' : 'Trainer'}
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {(activeTab === 'players' ? teamPlayers : teamTrainers).map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImage} />
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500">{getRoleLabel(user.role)}</div>
                      </div>
                      {team.captain === user.id && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(activeTab === 'players' ? teamPlayers : teamTrainers).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Keine {activeTab === 'players' ? 'Spieler' : 'Trainer'} zugewiesen
                  </p>
                )}
              </div>
            </div>

            {/* Available Users */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">
                Verfügbare {activeTab === 'players' ? 'Spieler' : 'Trainer'}
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {availableUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-white border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImage} />
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500">{getRoleLabel(user.role)}</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddUser(user.id)}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {availableUsers.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {searchTerm 
                      ? `Keine ${activeTab === 'players' ? 'Spieler' : 'Trainer'} gefunden`
                      : `Alle verfügbaren ${activeTab === 'players' ? 'Spieler' : 'Trainer'} sind bereits zugewiesen`
                    }
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>
              Schließen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
