
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';

interface UserContextType {
  currentUser: User | null;
  users: User[];
  loginUser: (email: string, password: string) => boolean;
  logoutUser: () => void;
  registerUser: (name: string, email: string, password: string, role: User['role']) => boolean;
  hasPermission: (action: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock users für Demo
const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@volleyball.de', role: 'admin', team: 'Volleyball Team' },
  { id: '2', name: 'Max Trainer', email: 'trainer@volleyball.de', role: 'trainer', team: 'Volleyball Team' },
  { id: '3', name: 'Anna Spieler', email: 'player@volleyball.de', role: 'player', team: 'Volleyball Team' },
];

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0]); // Start als Admin für Demo
  const [users] = useState<User[]>(mockUsers);

  const loginUser = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const registerUser = (name: string, email: string, password: string, role: User['role']): boolean => {
    // In einer echten App würde hier eine API-Anfrage gemacht
    console.log('User registration:', { name, email, role });
    return true;
  };

  const hasPermission = (action: string): boolean => {
    if (!currentUser) return false;
    
    switch (action) {
      case 'create_event':
        return ['admin', 'trainer'].includes(currentUser.role);
      case 'edit_event':
        return ['admin', 'trainer'].includes(currentUser.role);
      case 'delete_event':
        return currentUser.role === 'admin';
      case 'manage_users':
        return currentUser.role === 'admin';
      case 'join_event':
        return true; // Alle können Events beitreten
      default:
        return false;
    }
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      users,
      loginUser,
      logoutUser,
      registerUser,
      hasPermission
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
