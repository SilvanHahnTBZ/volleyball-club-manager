
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Team } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { useTeam } from '@/contexts/TeamContext';
import { User2, Mail, Phone, Calendar, Shield, Users, Trophy } from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose, user }) => {
  const { updateUser, currentUser, hasPermission } = useUser();
  const { teams } = useTeam();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  const isOwnProfile = currentUser?.id === user?.id;
  const canEdit = isOwnProfile || hasPermission('manage_users');

  const userTeams = user ? teams.filter(team => 
    team.players.includes(user.id) || team.trainers.includes(user.id)
  ) : [];

  const handleEdit = () => {
    if (user) {
      setEditForm(user);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (user && editForm) {
      updateUser(user.id, editForm);
      setIsEditing(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'trainer': return 'bg-blue-100 text-blue-800';
      case 'player': return 'bg-green-100 text-green-800';
      case 'parent': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.profileImage} />
              <AvatarFallback>
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {isEditing ? 'Profil bearbeiten' : `Profil: ${user.name}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User2 className="h-5 w-5" />
                    Persönliche Informationen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{user.email}</span>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Registriert: {user.registrationDate.toLocaleDateString('de-DE')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Teams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userTeams.length > 0 ? (
                    <div className="space-y-2">
                      {userTeams.map(team => (
                        <div key={team.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{team.name}</div>
                            <div className="text-sm text-gray-600">
                              {team.trainers.includes(user.id) ? 'Trainer' : 'Spieler'}
                            </div>
                          </div>
                          <Badge variant="outline">
                            {team.season}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Noch keinem Team zugewiesen</p>
                  )}
                </CardContent>
              </Card>

              {user.helperTasks && user.helperTasks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Helfereinsätze
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {user.helperTasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span>{task.task}</span>
                          <Badge variant={task.completed ? 'default' : 'outline'}>
                            {task.completed ? 'Erledigt' : 'Offen'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleSave}>
                  Speichern
                </Button>
              </>
            ) : (
              <>
                {canEdit && (
                  <Button onClick={handleEdit}>
                    Profil bearbeiten
                  </Button>
                )}
                <Button variant="outline" onClick={onClose}>
                  Schließen
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
