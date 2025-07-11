import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Team, Event, HelperTask } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { useTeam } from '@/contexts/TeamContext';
import { User2, Mail, Phone, Calendar, Shield, Users, Trophy, Wrench, CheckCircle, Clock, XCircle } from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  events?: Event[];
  helperTasks?: HelperTask[];
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  events = [], 
  helperTasks = [] 
}) => {
  const { updateUser, currentUser, hasPermission } = useUser();
  const { teams } = useTeam();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  const isOwnProfile = currentUser?.id === user?.id;
  const canEdit = isOwnProfile || hasPermission('manage_users');

  const userTeams = user ? teams.filter(team => 
    team.players.includes(user.id) || team.trainers.includes(user.id)
  ) : [];

  // Get user's events and helper tasks
  const userEvents = events.filter(event => 
    event.participants.includes(user?.id || '') || event.createdBy === user?.id
  );

  const userHelperTasks = helperTasks.filter(task => 
    task.assignedTo === user?.id || task.createdBy === user?.id
  );

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

  const getHelperTaskStatusIcon = (status: HelperTask['status']) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'no-show':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getHelperTaskStatusLabel = (status: HelperTask['status']) => {
    switch (status) {
      case 'open': return 'Offen';
      case 'completed': return 'Erledigt';
      case 'no-show': return 'Nicht erschienen';
    }
  };

  const getEventTypeLabel = (type: Event['type']) => {
    switch (type) {
      case 'training': return 'Training';
      case 'game': return 'Spiel';
      case 'tournament': return 'Turnier';
      case 'helper': return 'Helfereinsatz';
      default: return 'Event';
    }
  };

  const helperStats = {
    total: userHelperTasks.length,
    completed: userHelperTasks.filter(t => t.status === 'completed').length,
    pending: userHelperTasks.filter(t => t.status === 'open').length,
    noShow: userHelperTasks.filter(t => t.status === 'no-show').length
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
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
            <Tabs defaultValue="info" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="teams">Teams</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="helper">Helfereinsätze</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
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
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role, index) => (
                          <Badge key={index} className={getRoleColor(role)}>
                            {getRoleLabel(role)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="teams" className="space-y-4">
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
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Event-Teilnahmen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userEvents.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>Typ</TableHead>
                            <TableHead>Datum</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userEvents.slice(0, 10).map(event => (
                            <TableRow key={event.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{event.title}</div>
                                  {event.location && (
                                    <div className="text-sm text-gray-600">{event.location}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {getEventTypeLabel(event.type)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {event.date.toLocaleDateString('de-DE')}
                              </TableCell>
                              <TableCell>
                                {event.participants.includes(user.id) ? (
                                  <Badge className="bg-green-600">Teilgenommen</Badge>
                                ) : (
                                  <Badge variant="outline">Erstellt</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-gray-600">Keine Event-Teilnahmen</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="helper" className="space-y-4">
                {/* Helper Task Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{helperStats.total}</div>
                      <div className="text-sm text-gray-600">Gesamt</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-orange-600">{helperStats.pending}</div>
                      <div className="text-sm text-gray-600">Offen</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">{helperStats.completed}</div>
                      <div className="text-sm text-gray-600">Erledigt</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-red-600">{helperStats.noShow}</div>
                      <div className="text-sm text-gray-600">Nicht erschienen</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Helfereinsätze
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userHelperTasks.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Aufgabe</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Zugewiesen</TableHead>
                            <TableHead>Erledigt</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userHelperTasks.map(task => (
                            <TableRow key={task.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{task.task}</div>
                                  {task.description && (
                                    <div className="text-sm text-gray-600">{task.description}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getHelperTaskStatusIcon(task.status)}
                                  <span>{getHelperTaskStatusLabel(task.status)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {task.assignedDate.toLocaleDateString('de-DE')}
                              </TableCell>
                              <TableCell>
                                {task.completedDate ? task.completedDate.toLocaleDateString('de-DE') : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-gray-600">Keine Helfereinsätze zugewiesen</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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
