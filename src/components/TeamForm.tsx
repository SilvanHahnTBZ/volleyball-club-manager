
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Team } from '@/types';
import { useTeam } from '@/contexts/TeamContext';
import { toast } from '@/hooks/use-toast';

interface TeamFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTeam?: Team | null;
}

export const TeamForm: React.FC<TeamFormProps> = ({ isOpen, onClose, editingTeam }) => {
  const { createTeam, updateTeam } = useTeam();
  const [formData, setFormData] = useState<Partial<Team>>({
    name: '',
    category: 'U14',
    gender: 'M',
    season: '2024/25',
    trainers: [],
    players: [],
    description: '',
    trainingTimes: [],
    isActive: true
  });

  useEffect(() => {
    if (editingTeam) {
      setFormData(editingTeam);
    } else {
      setFormData({
        name: '',
        category: 'U14',
        gender: 'M',
        season: '2024/25',
        trainers: [],
        players: [],
        description: '',
        trainingTimes: [],
        isActive: true
      });
    }
  }, [editingTeam, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.gender) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    const teamName = `${formData.category} ${formData.gender}`;
    const teamData = {
      ...formData,
      name: teamName,
    } as Omit<Team, 'id'>;

    if (editingTeam) {
      updateTeam(editingTeam.id, teamData);
      toast({
        title: "Team aktualisiert",
        description: `Das Team "${teamName}" wurde erfolgreich aktualisiert.`,
      });
    } else {
      createTeam(teamData);
      toast({
        title: "Team erstellt",
        description: `Das Team "${teamName}" wurde erfolgreich erstellt.`,
      });
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingTeam ? 'Team bearbeiten' : 'Neues Team erstellen'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as Team['category'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="U14">U14</SelectItem>
                  <SelectItem value="U16">U16</SelectItem>
                  <SelectItem value="U20">U20</SelectItem>
                  <SelectItem value="U23">U23</SelectItem>
                  <SelectItem value="4. Liga">4. Liga</SelectItem>
                  <SelectItem value="Seniors">Seniors</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Geschlecht *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as Team['gender'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Geschlecht wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Männlich</SelectItem>
                  <SelectItem value="F">Weiblich</SelectItem>
                  <SelectItem value="Mixed">Gemischt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="season">Saison</Label>
            <Input
              id="season"
              value={formData.season || ''}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              placeholder="z.B. 2024/25"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Zusätzliche Informationen zum Team..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit">
              {editingTeam ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
