import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Trophy, Settings, User, Bell, MapPin, Play, Clock, Star } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data für die Demo
  const mockEvents = [
    {
      id: 1,
      title: "Training - Damen 1",
      date: "2025-07-16",
      time: "19:00",
      location: "Sporthalle Mitte",
      type: "training"
    },
    {
      id: 2,
      title: "Spiel vs. VBC Berlin",
      date: "2025-07-18",
      time: "20:00",
      location: "Heimhalle",
      type: "match"
    },
    {
      id: 3,
      title: "Turnier Stadtmeisterschaft",
      date: "2025-07-20",
      time: "10:00",
      location: "Sportzentrum Nord",
      type: "tournament"
    }
  ];

  const mockTeams = [
    { id: 1, name: "Damen 1", league: "Oberliga", players: 12 },
    { id: 2, name: "Herren 1", league: "Landesliga", players: 10 },
    { id: 3, name: "Mixed", league: "Bezirksliga", players: 15 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">VolleyManager</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                Demo User
              </Badge>
              <Badge variant="default">Admin</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Kommende Events
                  </CardTitle>
                  <CardDescription>
                    Spiele, Trainings und Turniere
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{mockEvents.length}</div>
                  <p className="text-sm text-muted-foreground">Diese Woche</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Aktive Teams
                  </CardTitle>
                  <CardDescription>
                    Deine Teams und Mannschaften
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{mockTeams.length}</div>
                  <p className="text-sm text-muted-foreground">Teams verwaltet</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Siege
                  </CardTitle>
                  <CardDescription>
                    Erfolge dieser Saison
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">8</div>
                  <p className="text-sm text-muted-foreground">Gewonnene Spiele</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Nächste Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {event.type === 'training' && <Clock className="h-4 w-4 text-blue-500" />}
                        {event.type === 'match' && <Play className="h-4 w-4 text-green-500" />}
                        {event.type === 'tournament' && <Star className="h-4 w-4 text-yellow-500" />}
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.date} um {event.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{event.location}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Übersicht</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockTeams.map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{team.name}</p>
                        <p className="text-sm text-muted-foreground">{team.league}</p>
                      </div>
                      <Badge variant="secondary">{team.players} Spieler</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alle Events</CardTitle>
                <CardDescription>Verwalte Spiele, Trainings und Turniere</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        {event.type === 'training' && <Clock className="h-5 w-5 text-blue-500" />}
                        {event.type === 'match' && <Play className="h-5 w-5 text-green-500" />}
                        {event.type === 'tournament' && <Star className="h-5 w-5 text-yellow-500" />}
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.date} um {event.time} - {event.location}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Details</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Verwalte deine Volleyball-Teams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockTeams.map((team) => (
                    <Card key={team.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <CardDescription>{team.league}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{team.players} Spieler</Badge>
                          <Button variant="outline" size="sm">Verwalten</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Benutzer Profil</CardTitle>
                <CardDescription>Verwalte deine persönlichen Informationen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Vorname</label>
                    <p className="text-muted-foreground">Demo</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nachname</label>
                    <p className="text-muted-foreground">User</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">E-Mail</label>
                    <p className="text-muted-foreground">demo@volleymanager.de</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Rolle</label>
                    <Badge>Admin</Badge>
                  </div>
                </div>
                <Button className="mt-4">Profil bearbeiten</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;