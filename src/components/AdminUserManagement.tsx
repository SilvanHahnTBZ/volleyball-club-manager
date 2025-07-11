
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Users, Settings, Search, UserPlus, Shield, Edit } from 'lucide-react';

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching all users...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Fehler beim Laden der Benutzer",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const userList: User[] = data?.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        teams: profile.teams || [],
        assignedTeams: profile.assigned_teams || [],
        parentOf: profile.parent_of || [],
        phone: profile.phone,
        dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : undefined,
        profileImage: profile.profile_image,
        isActive: profile.is_active,
        registrationDate: new Date(profile.created_at)
      })) || [];

      setUsers(userList);
      console.log('Users loaded:', userList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: User['role']) => {
    try {
      console.log('Updating user role:', userId, newRole);
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        toast({
          title: "Fehler beim Aktualisieren der Rolle",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Rolle aktualisiert",
        description: `Die Rolle wurde erfolgreich auf ${getRoleLabel(newRole)} geändert.`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const toggleUserActive = async (userId: string, isActive: boolean) => {
    try {
      console.log('Toggling user active status:', userId, isActive);
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user status:', error);
        toast({
          title: "Fehler beim Aktualisieren des Status",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive } : user
      ));

      toast({
        title: "Status aktualisiert",
        description: `Der Benutzer wurde ${isActive ? 'aktiviert' : 'deaktiviert'}.`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500 text-white';
      case 'trainer': return 'bg-blue-500 text-white';
      case 'player': return 'bg-green-500 text-white';
      case 'parent': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
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

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Users className="h-8 w-8 mx-auto mb-4 text-gray-400 animate-spin" />
          <p className="text-gray-600">Benutzer werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl font-bold">Benutzerverwaltung</h2>
        </div>
        <Badge variant="outline" className="text-sm">
          {users.length} Benutzer
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Benutzer suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(user => (
          <Card key={user.id} className={`${!user.isActive ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.profileImage} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm">{user.name}</CardTitle>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Dialog open={editDialogOpen && selectedUser?.id === user.id} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Benutzer bearbeiten</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Rolle</Label>
                        <Select
                          value={user.role}
                          onValueChange={(value: User['role']) => {
                            updateUserRole(user.id, value);
                            setEditDialogOpen(false);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="trainer">Trainer</SelectItem>
                            <SelectItem value="player">Spieler</SelectItem>
                            <SelectItem value="parent">Elternteil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={user.isActive ? "destructive" : "default"}
                          onClick={() => {
                            toggleUserActive(user.id, !user.isActive);
                            setEditDialogOpen(false);
                          }}
                        >
                          {user.isActive ? 'Deaktivieren' : 'Aktivieren'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={getRoleColor(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? 'Aktiv' : 'Inaktiv'}
                </Badge>
              </div>
              
              {user.teams.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Teams:</p>
                  <div className="flex flex-wrap gap-1">
                    {user.teams.slice(0, 3).map(teamId => (
                      <Badge key={teamId} variant="outline" className="text-xs">
                        Team {teamId}
                      </Badge>
                    ))}
                    {user.teams.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.teams.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                Registriert: {user.registrationDate.toLocaleDateString('de-DE')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Keine Benutzer gefunden</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Versuchen Sie andere Suchbegriffe.' : 'Noch keine Benutzer registriert.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
