
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Team, User } from '@/types';

interface TeamContextType {
  teams: Team[];
  createTeam: (team: Omit<Team, 'id'>) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  deleteTeam: (teamId: string) => void;
  addPlayerToTeam: (teamId: string, playerId: string) => void;
  removePlayerFromTeam: (teamId: string, playerId: string) => void;
  addTrainerToTeam: (teamId: string, trainerId: string) => void;
  removeTrainerFromTeam: (teamId: string, trainerId: string) => void;
  getTeamsByUser: (userId: string, userRole: string) => Team[];
  getTeamPlayers: (teamId: string, users: User[]) => User[];
  getTeamTrainers: (teamId: string, users: User[]) => User[];
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

// Mock teams for demo
const mockTeams: Team[] = [
  {
    id: '1',
    name: 'U14 M',
    category: 'U14',
    gender: 'M',
    season: '2024/25',
    trainers: ['2'],
    players: ['3'],
    trainingTimes: [
      { day: 'tuesday', startTime: '17:00', endTime: '18:30', location: 'Sporthalle Mitte' },
      { day: 'friday', startTime: '17:00', endTime: '18:30', location: 'Sporthalle Mitte' }
    ],
    isActive: true
  },
  {
    id: '2',
    name: 'U16 F',
    category: 'U16',
    gender: 'F',
    season: '2024/25',
    trainers: ['2'],
    players: [],
    trainingTimes: [
      { day: 'monday', startTime: '18:00', endTime: '19:30', location: 'Sporthalle Ost' },
      { day: 'wednesday', startTime: '18:00', endTime: '19:30', location: 'Sporthalle Ost' }
    ],
    isActive: true
  },
  {
    id: '3',
    name: '4. Liga M',
    category: '4. Liga',
    gender: 'M',
    season: '2024/25',
    trainers: ['2'],
    players: ['3'],
    trainingTimes: [
      { day: 'tuesday', startTime: '20:00', endTime: '21:30', location: 'Sporthalle West' },
      { day: 'thursday', startTime: '20:00', endTime: '21:30', location: 'Sporthalle West' }
    ],
    isActive: true
  }
];

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>(mockTeams);

  const createTeam = (teamData: Omit<Team, 'id'>) => {
    const newTeam: Team = {
      ...teamData,
      id: Date.now().toString()
    };
    setTeams([...teams, newTeam]);
  };

  const updateTeam = (teamId: string, updates: Partial<Team>) => {
    setTeams(teams.map(team => 
      team.id === teamId ? { ...team, ...updates } : team
    ));
  };

  const deleteTeam = (teamId: string) => {
    setTeams(teams.filter(team => team.id !== teamId));
  };

  const addPlayerToTeam = (teamId: string, playerId: string) => {
    setTeams(teams.map(team => 
      team.id === teamId 
        ? { ...team, players: [...team.players, playerId] }
        : team
    ));
  };

  const removePlayerFromTeam = (teamId: string, playerId: string) => {
    setTeams(teams.map(team => 
      team.id === teamId 
        ? { ...team, players: team.players.filter(id => id !== playerId) }
        : team
    ));
  };

  const addTrainerToTeam = (teamId: string, trainerId: string) => {
    setTeams(teams.map(team => 
      team.id === teamId 
        ? { ...team, trainers: [...team.trainers, trainerId] }
        : team
    ));
  };

  const removeTrainerFromTeam = (teamId: string, trainerId: string) => {
    setTeams(teams.map(team => 
      team.id === teamId 
        ? { ...team, trainers: team.trainers.filter(id => id !== trainerId) }
        : team
    ));
  };

  const getTeamsByUser = (userId: string, userRole: string): Team[] => {
    if (userRole === 'admin') {
      return teams;
    } else if (userRole === 'trainer') {
      return teams.filter(team => team.trainers.includes(userId));
    } else if (userRole === 'player') {
      return teams.filter(team => team.players.includes(userId));
    }
    return [];
  };

  const getTeamPlayers = (teamId: string, users: User[]): User[] => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return [];
    return users.filter(user => team.players.includes(user.id));
  };

  const getTeamTrainers = (teamId: string, users: User[]): User[] => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return [];
    return users.filter(user => team.trainers.includes(user.id));
  };

  return (
    <TeamContext.Provider value={{
      teams,
      createTeam,
      updateTeam,
      deleteTeam,
      addPlayerToTeam,
      removePlayerFromTeam,
      addTrainerToTeam,
      removeTrainerFromTeam,
      getTeamsByUser,
      getTeamPlayers,
      getTeamTrainers
    }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};
