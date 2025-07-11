
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HelperTask, User } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { Plus, Edit, Check, X, Clock, AlertTriangle } from 'lucide-react';
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
  const [formData, setFormData] = useState<Partial<HelperTask>>({
    task: '',
    description: '',
    priority: 'medium',
    status: 'open'
  });

  const canManageTasks = hasPermission('create_event') || hasPermission('manage_users');

  const getStatusBadge = (status: HelperTask['status']) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="text-orange-600"><Clock className="h-3 w-3 mr-1" />Offen</Badge>;
      case 'completed':
        return <Badge className="bg-green-600"><Check className="h-3 w-3 mr-1" />Erledigt</Badge>;
      case 'no-show':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Nicht erschienen</Badge>;
    }
  };

  const getPriorityBadge = (priority: HelperTask['priority']) => {
    switch (priority) {
      case 'low':
        return <Badge variant="secondary">Niedrig</Badge>;
      case 'medium':
        return <Badge variant="outline">Mittel</Badge>;
      case 'high':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Hoch</Badge>;
    }
  };

  const handleSubmit = () => {
    if (!formData.task) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine Aufgabe ein.",
        variant: "destructive"
      });
      return;
    }

    const taskData = {
      ...formData,
      assignedDate: new Date(),
      createdBy: currentUser?.id || '',
      priority: formData.priority || 'medium',
      status: formData.status || 'open'
    } as Omit<HelperTask, 'id'>;

    if (editingTask) {
      onUpdateTask(editingTask.id, taskData);
      toast({
        title: "Aufgabe aktualisiert",
        description: "Die Helfereinsatz-Aufgabe wurde erfolgreich aktualisiert."
      });
    } else {
      onCreateTask(taskData);
      toast({
        title: "Aufgabe erstellt",
        description: "Neue Helfereinsatz-Aufgabe wurde erstellt."
      });
    }

    setFormData({
      task: '',
      description: '',
      priority: 'medium',
      status: 'open'
    });
    setEditingTask(null);
    setIsCreateModalOpen(false);
  };

  const openEditModal = (task: HelperTask) => {
    setEditingTask(task);
    setFormData(task);
    setIsCreateModalOpen(true);
  };

  const getUserName = (userId?: string) => {
    if (!userId) return 'Nicht zugewiesen';
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unbekannt';
  };

  const getTaskStats = () => {
    const total = helperTasks.length;
    const completed = helperTasks.filter(t => t.status === 'completed').length;
    const open = helperTasks.filter(t => t.status === 'open').length;
    const noShow = helperTasks.filter(t => t.status === 'no-show').length;
    
    return { total, completed, open, noShow };
  };

  const stats = getTaskStats();

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Gesamt</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.open}</div>
            <div className="text-sm text-gray-600">Offen</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Erledigt</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.noShow}</div>
            <div className="text-sm text-gray-600">Nicht erschienen</div>
          </CardContent>
        </Card>
      </div>

      {/* Helper Tasks Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Helfereinsätze</CardTitle>
            {canManageTasks && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Neue Aufgabe
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aufgabe</TableHead>
                <TableHead>Zugewiesen an</TableHead>
                <TableHead>Priorität</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Datum</TableHead>
                {canManageTasks && <TableHead>Aktionen</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {helperTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{task.task}</div>
                      {task.description && (
                        <div className="text-sm text-gray-600">{task.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getUserName(task.assignedTo)}</TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>
                    {task.assignedDate.toLocaleDateString('de-DE')}
                  </TableCell>
                  {canManageTasks && (
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(task)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {task.status === 'open' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateTask(task.id, { status: 'completed', completedDate: new Date() })}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Task Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'Aufgabe bearbeiten' : 'Neue Helfereinsatz-Aufgabe'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task">Aufgabe *</Label>
              <Input
                id="task"
                value={formData.task || ''}
                onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                placeholder="z.B. Schiedsrichter, Aufbau, Catering..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Weitere Details zur Aufgabe..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priorität</Label>
                <Select
                  value={formData.priority || 'medium'}
                  onValueChange={(value: HelperTask['priority']) => setFormData({ ...formData, priority: value })}
                >
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

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status || 'open'}
                  onValueChange={(value: HelperTask['status']) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Offen</SelectItem>
                    <SelectItem value="completed">Erledigt</SelectItem>
                    <SelectItem value="no-show">Nicht erschienen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Zuweisen an</Label>
              <Select
                value={formData.assignedTo || ''}
                onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Person auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.isActive).map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingTask(null);
                  setFormData({
                    task: '',
                    description: '',
                    priority: 'medium',
                    status: 'open'
                  });
                }}
              >
                Abbrechen
              </Button>
              <Button onClick={handleSubmit}>
                {editingTask ? 'Aktualisieren' : 'Erstellen'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
