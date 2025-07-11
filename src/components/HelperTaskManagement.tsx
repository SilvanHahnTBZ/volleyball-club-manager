import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelperTask } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { Plus, Wrench, CheckCircle, Clock, XCircle, Edit, Trash2, BarChart3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface HelperTaskManagementProps {
  helperTasks: HelperTask[];
  onCreateTask: (task: Omit<HelperTask, 'id'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<HelperTask>) => void;
  onDeleteTask: (taskId: string) => void;
}

export const HelperTaskManagement: React.FC<HelperTaskManagementProps> = ({
  helperTasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask
}) => {
  const { currentUser, users, hasPermission } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<HelperTask | null>(null);
  const [newTask, setNewTask] = useState({
    task: '',
    description: '',
    assignedTo: '',
    assignedDate: new Date().toISOString().split('T')[0],
    priority: 'medium' as HelperTask['priority']
  });

  // Filter tasks based on user permissions
  const visibleTasks = useMemo(() => {
    if (!currentUser) return [];
    
    if (currentUser.roles.includes('admin')) {
      return helperTasks;
    }
    
    if (currentUser.roles.includes('trainer')) {
      return helperTasks;
    }
    
    // Players and parents only see their own tasks (or their children's tasks for parents)
    return helperTasks.filter(task => {
      if (task.assignedTo === currentUser.id) return true;
      if (currentUser.roles.includes('parent') && currentUser.parentOf?.includes(task.assignedTo || '')) {
        return true;
      }
      return false;
    });
  }, [helperTasks, currentUser]);

  // Statistics for admin/trainer view
  const taskStats = useMemo(() => {
    const stats = {
      total: visibleTasks.length,
      open: visibleTasks.filter(t => t.status === 'open').length,
      completed: visibleTasks.filter(t => t.status === 'completed').length,
      noShow: visibleTasks.filter(t => t.status === 'no-show').length,
      byPriority: {
        high: visibleTasks.filter(t => t.priority === 'high').length,
        medium: visibleTasks.filter(t => t.priority === 'medium').length,
        low: visibleTasks.filter(t => t.priority === 'low').length
      }
    };
    return stats;
  }, [visibleTasks]);

  const canCreateTasks = hasPermission('create_helper_task');
  const canEditTasks = hasPermission('edit_helper_task');
  const canDeleteTasks = hasPermission('delete_helper_task');

  const handleCreateTask = () => {
    if (!currentUser || !canCreateTasks) return;

    const taskData: Omit<HelperTask, 'id'> = {
      task: newTask.task,
      description: newTask.description,
      status: 'open',
      assignedTo: newTask.assignedTo || undefined,
      assignedDate: new Date(newTask.assignedDate),
      createdBy: currentUser.id,
      priority: newTask.priority
    };

    onCreateTask(taskData);
    setNewTask({
      task: '',
      description: '',
      assignedTo: '',
      assignedDate: new Date().toISOString().split('T')[0],
      priority: 'medium'
    });
    setIsCreateModalOpen(false);
    
    toast({
      title: "Helfereinsatz erstellt",
      description: `"${taskData.task}" wurde erfolgreich erstellt.`,
    });
  };

  const handleUpdateTaskStatus = (taskId: string, status: HelperTask['status']) => {
    const updates: Partial<HelperTask> = { status };
    
    if (status === 'completed') {
      updates.completedDate = new Date();
    }
    
    onUpdateTask(taskId, updates);
    
    const task = helperTasks.find(t => t.id === taskId);
    toast({
      title: "Status aktualisiert",
      description: `"${task?.task}" wurde als ${getStatusLabel(status)} markiert.`,
    });
  };

  const handleDeleteTask = (taskId: string, taskName: string) => {
    if (window.confirm(`Möchten Sie den Helfereinsatz "${taskName}" wirklich löschen?`)) {
      onDeleteTask(taskId);
      toast({
        title: "Helfereinsatz gelöscht",
        description: `"${taskName}" wurde erfolgreich gelöscht.`,
      });
    }
  };

  const getStatusIcon = (status: HelperTask['status']) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'no-show':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusLabel = (status: HelperTask['status']) => {
    switch (status) {
      case 'open': return 'Offen';
      case 'completed': return 'Erledigt';
      case 'no-show': return 'Nicht erschienen';
    }
  };

  const getStatusBadgeVariant = (status: HelperTask['status']) => {
    switch (status) {
      case 'open': return 'outline' as const;
      case 'completed': return 'default' as const;
      case 'no-show': return 'destructive' as const;
    }
  };

  const getPriorityBadgeVariant = (priority: HelperTask['priority']) => {
    switch (priority) {
      case 'high': return 'destructive' as const;
      case 'medium': return 'outline' as const;
      case 'low': return 'secondary' as const;
    }
  };

  const getPriorityLabel = (priority: HelperTask['priority']) => {
    switch (priority) {
      case 'high': return 'Hoch';
      case 'medium': return 'Mittel';
      case 'low': return 'Niedrig';
    }
  };

  const getAssignedUserName = (userId?: string) => {
    if (!userId) return 'Nicht zugewiesen';
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unbekannter Benutzer';
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Bitte melden Sie sich an, um Helfereinsätze zu sehen.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="h-6 w-6" />
          Helfereinsätze
        </h2>
        
        {canCreateTasks && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Neuer Einsatz
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neuen Helfereinsatz erstellen</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task">Aufgabe *</Label>
                  <Input
                    id="task"
                    value={newTask.task}
                    onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                    placeholder="z.B. Schiedsrichter, Hallenaufbau"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Zusätzliche Details zur Aufgabe..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Zugewiesen an</Label>
                    <Select value={newTask.assignedTo} onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Person auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nicht zugewiesen</SelectItem>
                        {users.filter(u => u.isActive && (u.roles.includes('player') || u.roles.includes('trainer'))).map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.roles.includes('trainer') ? 'Trainer' : 'Spieler'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priorität</Label>
                    <Select value={newTask.priority} onValueChange={(value: HelperTask['priority']) => setNewTask({ ...newTask, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Niedrig</SelectItem>
                        <SelectItem value="medium">Mittel</SelectItem>
                        <SelectItem value="high">Hoch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedDate">Termin</Label>
                  <Input
                    id="assignedDate"
                    type="date"
                    value={newTask.assignedDate}
                    onChange={(e) => setNewTask({ ...newTask, assignedDate: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleCreateTask} disabled={!newTask.task}>
                    Erstellen
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">Aufgaben</TabsTrigger>
          {(canCreateTasks || canEditTasks) && (
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistiken
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="tasks">
          <Card>
            <CardContent className="p-6">
              {visibleTasks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aufgabe</TableHead>
                      <TableHead>Zugewiesen an</TableHead>
                      <TableHead>Termin</TableHead>
                      <TableHead>Priorität</TableHead>
                      <TableHead>Status</TableHead>
                      {(canEditTasks || canDeleteTasks) && <TableHead>Aktionen</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.task}</div>
                            {task.description && (
                              <div className="text-sm text-gray-600">{task.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getAssignedUserName(task.assignedTo)}</TableCell>
                        <TableCell>{task.assignedDate.toLocaleDateString('de-DE')}</TableCell>
                        <TableCell>
                          <Badge variant={getPriorityBadgeVariant(task.priority)}>
                            {getPriorityLabel(task.priority)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(task.status)}
                            <Badge variant={getStatusBadgeVariant(task.status)}>
                              {getStatusLabel(task.status)}
                            </Badge>
                          </div>
                        </TableCell>
                        {(canEditTasks || canDeleteTasks) && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {canEditTasks && task.status === 'open' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Erledigt
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateTaskStatus(task.id, 'no-show')}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Nicht erschienen
                                  </Button>
                                </>
                              )}
                              {canEditTasks && task.status !== 'open' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateTaskStatus(task.id, 'open')}
                                >
                                  Zurücksetzen
                                </Button>
                              )}
                              {canDeleteTasks && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteTask(task.id, task.task)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Helfereinsätze</h3>
                  <p className="text-gray-600">
                    {canCreateTasks 
                      ? 'Erstellen Sie den ersten Helfereinsatz.' 
                      : 'Ihnen sind noch keine Helfereinsätze zugewiesen.'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {(canCreateTasks || canEditTasks) && (
          <TabsContent value="statistics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{taskStats.total}</div>
                  <div className="text-sm text-gray-600">Gesamt</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-orange-600">{taskStats.open}</div>
                  <div className="text-sm text-gray-600">Offen</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
                  <div className="text-sm text-gray-600">Erledigt</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-red-600">{taskStats.noShow}</div>
                  <div className="text-sm text-gray-600">Nicht erschienen</div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Prioritäten-Verteilung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">{taskStats.byPriority.high}</div>
                    <div className="text-sm text-gray-600">Hoch</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">{taskStats.byPriority.medium}</div>
                    <div className="text-sm text-gray-600">Mittel</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-600">{taskStats.byPriority.low}</div>
                    <div className="text-sm text-gray-600">Niedrig</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
