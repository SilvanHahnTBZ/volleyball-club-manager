
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface UserContextType {
  currentUser: User | null;
  users: User[];
  loginUser: (email: string, password: string) => boolean;
  logoutUser: () => void;
  registerUser: (userData: Omit<User, 'id' | 'registrationDate' | 'isActive'>) => boolean;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  hasPermission: (action: string, targetUserId?: string, teamId?: string) => boolean;
  getUsersByRole: (role: User['role']) => User[];
  searchUsers: (searchTerm: string) => User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock users für Demo wenn nicht mit Supabase verbunden
const mockUsers: User[] = [
  { 
    id: '1', 
    name: 'Admin User', 
    email: 'admin@volleyball.de', 
    role: 'admin', 
    teams: [],
    phone: '+49 123 456789',
    isActive: true,
    registrationDate: new Date('2024-01-01')
  },
  { 
    id: '2', 
    name: 'Max Trainer', 
    email: 'trainer@volleyball.de', 
    role: 'trainer', 
    teams: ['1', '2', '3'],
    assignedTeams: ['1', '2', '3'],
    phone: '+49 123 456790',
    isActive: true,
    registrationDate: new Date('2024-01-15')
  },
  { 
    id: '3', 
    name: 'Anna Spieler', 
    email: 'player@volleyball.de', 
    role: 'player', 
    teams: ['1', '3'],
    dateOfBirth: new Date('2008-05-15'),
    phone: '+49 123 456791',
    isActive: true,
    registrationDate: new Date('2024-02-01')
  },
  { 
    id: '4', 
    name: 'Lisa Müller', 
    email: 'lisa@volleyball.de', 
    role: 'player', 
    teams: ['2'],
    dateOfBirth: new Date('2006-08-22'),
    isActive: true,
    registrationDate: new Date('2024-02-15')
  },
  { 
    id: '5', 
    name: 'Peter Schmidt', 
    email: 'peter@volleyball.de', 
    role: 'parent', 
    teams: [],
    parentOf: ['3', '4'],
    phone: '+49 123 456792',
    isActive: true,
    registrationDate: new Date('2024-02-01')
  }
];

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile, signOut } = useSupabaseAuth();
  const [users, setUsers] = useState<User[]>(mockUsers);

  // Use Supabase profile as current user if available, otherwise fallback to mock
  const currentUser = profile || null;

  const loginUser = (email: string, password: string): boolean => {
    // This is now handled by Supabase Auth
    const user = users.find(u => u.email === email && u.isActive);
    return !!user;
  };

  const logoutUser = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const registerUser = (userData: Omit<User, 'id' | 'registrationDate' | 'isActive'>): boolean => {
    // This is now handled by Supabase Auth
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      return false;
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      registrationDate: new Date(),
      isActive: true
    };

    setUsers([...users, newUser]);
    return true;
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const hasPermission = (action: string, targetUserId?: string, teamId?: string): boolean => {
    if (!currentUser || !currentUser.isActive) return false;
    
    switch (action) {
      case 'create_event':
        return ['admin', 'trainer'].includes(currentUser.role);
        
      case 'edit_event':
        return ['admin', 'trainer'].includes(currentUser.role);
        
      case 'delete_event':
        return currentUser.role === 'admin';
        
      case 'manage_users':
        return currentUser.role === 'admin';
        
      case 'manage_teams':
        return ['admin', 'trainer'].includes(currentUser.role);
        
      case 'join_event':
        return ['player', 'trainer', 'admin'].includes(currentUser.role);
        
      case 'view_profiles':
        if (currentUser.role === 'admin') return true;
        if (currentUser.role === 'trainer' && targetUserId) {
          const targetUser = users.find(u => u.id === targetUserId);
          return targetUser ? targetUser.teams.some(t => currentUser.assignedTeams?.includes(t)) : false;
        }
        if (targetUserId) {
          return currentUser.id === targetUserId || 
                 (currentUser.role === 'parent' && currentUser.parentOf?.includes(targetUserId));
        }
        return true;
        
      case 'view_helper_tasks':
        if (currentUser.role === 'admin') return true;
        if (currentUser.role === 'trainer') return true;
        if (targetUserId) {
          return currentUser.id === targetUserId || 
                 (currentUser.role === 'parent' && currentUser.parentOf?.includes(targetUserId));
        }
        return false;
        
      case 'create_helper_task':
        return ['admin', 'trainer'].includes(currentUser.role);
        
      case 'edit_helper_task':
        return ['admin', 'trainer'].includes(currentUser.role);
        
      case 'view_team_events':
        if (currentUser.role === 'admin') return true;
        if (currentUser.role === 'trainer' && teamId) {
          return currentUser.assignedTeams?.includes(teamId) || false;
        }
        if (currentUser.role === 'player' && teamId) {
          return currentUser.teams.includes(teamId);
        }
        if (currentUser.role === 'parent' && teamId) {
          const childrenInTeam = users.filter(u => 
            currentUser.parentOf?.includes(u.id) && u.teams.includes(teamId)
          );
          return childrenInTeam.length > 0;
        }
        return false;
        
      case 'assign_teams':
        return currentUser.role === 'admin';
        
      default:
        return false;
    }
  };

  const getUsersByRole = (role: User['role']): User[] => {
    return users.filter(user => user.role === role && user.isActive);
  };

  const searchUsers = (searchTerm: string): User[] => {
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.isActive && (
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      )
    );
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      users,
      loginUser,
      logoutUser,
      registerUser,
      updateUser,
      deleteUser,
      hasPermission,
      getUsersByRole,
      searchUsers
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
