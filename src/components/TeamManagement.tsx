
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Team, User } from '@/types';
import { useTeam } from '@/contexts/TeamContext';
import { useUser } from '@/contexts/UserContext';
import { TeamForm } from './TeamForm';
import { TeamAssignment } from './TeamAssignment';
import { Plus, Users, UserPlus, Settings, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const TeamManagement: React.FC = () => {
  const { teams, deleteTeam, getTeamPlayers, getTeamTrainers } = useTeam();
  const { users, currentUser, hasPermission } = useUser();
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const canManageTeams = hasPermission('manage_users');
  const userTeams = currentUser ? teams.filter(team => 
    team.trainers.includes(currentUser.id) || currentUser.roles.includes('admin')
  ) : [];

  const handleDeleteTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (team && confirm(`Möchten Sie das Team "${team.name}" wirklich löschen?`)) {
      deleteTeam(teamId);
      toast({
        title: "Team gelöscht",
        description: `Das Team "${team.name}" wurde erfolgreich gelöscht.`,
      });
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'M': return 'Männlich';
      case 'F': return 'Weiblich';
      case 'Mixed': return 'Gemischt';
      default: return gender;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Team-Verwaltung</h2>
        {canManageTeams && (
          <Button onClick={() => setShowTeamForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neues Team
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userTeams.map(team => {
          const teamPlayers = getTeamPlayers(team.id, users);
          const teamTrainers = getTeamTrainers(team.id, users);

          return (
            <Card key={team.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {team.name}
                  </CardTitle>
                  <div className="flex gap-1">
                    {canManageTeams && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTeam(team);
                            setShowAssignment(true);
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingTeam(team);
                            setShowTeamForm(true);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTeam(team.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {team.category} {getGenderLabel(team.gender)}
                  </Badge>
                  <Badge variant="outline">
                    {team.season}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Trainer ({teamTrainers.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {teamTrainers.map(trainer => (
                      <div key={trainer.id} className="flex items-center gap-2 bg-blue-50 rounded-full px-3 py-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={trainer.profileImage} />
                          <AvatarFallback className="text-xs">
                            {trainer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{trainer.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Spieler ({teamPlayers.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {teamPlayers.slice(0, 6).map(player => (
                      <Avatar key={player.id} className="h-8 w-8" title={player.name}>
                        <AvatarImage src={player.profileImage} />
                        <AvatarFallback className="text-xs">
                          {player.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {teamPlayers.length > 6 && (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                        +{teamPlayers.length - 6}
                      </div>
                    )}
                  </div>
                </div>

                {team.trainingTimes && team.trainingTimes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Trainingszeiten</h4>
                    <div className="space-y-1">
                      {team.trainingTimes.map((time, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {time.day}: {time.startTime} - {time.endTime}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {userTeams.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Keine Teams verfügbar</h3>
            <p className="text-gray-500">
              {canManageTeams 
                ? 'Erstellen Sie ein neues Team, um zu beginnen.' 
                : 'Sie sind noch keinem Team zugewiesen.'}
            </p>
          </CardContent>
        </Card>
      )}

      <TeamForm
        isOpen={showTeamForm}
        onClose={() => {
          setShowTeamForm(false);
          setEditingTeam(null);
        }}
        editingTeam={editingTeam}
      />

      {selectedTeam && (
        <TeamAssignment
          isOpen={showAssignment}
          onClose={() => {
            setShowAssignment(false);
            setSelectedTeam(null);
          }}
          team={selectedTeam}
        />
      )}
    </div>
  );
};
