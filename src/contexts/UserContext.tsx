
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';

interface UserContextType {
  currentUser: User | null;
  users: User[];
  loginUser: (email: string, password: string) => boolean;
  logoutUser: () => void;
  registerUser: (userData: Omit<User, 'id' | 'registrationDate' | 'isActive'>) => boolean;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  hasPermission: (action: string) => boolean;
  getUsersByRole: (role: User['role']) => User[];
  searchUsers: (searchTerm: string) => User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Erweiterte Mock-Benutzer für Demo
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
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0]);
  const [users, setUsers] = useState<User[]>(mockUsers);

  const loginUser = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.isActive);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const registerUser = (userData: Omit<User, 'id' | 'registrationDate' | 'isActive'>): boolean => {
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      return false; // User already exists
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
    
    // Update current user if it's the same user
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    
    // Logout if current user is deleted
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
  };

  const hasPermission = (action: string): boolean => {
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
        return true;
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
