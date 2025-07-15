
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';

interface UserContextType {
  currentUser: User | null;
  users: User[];
  loginUser: (email: string, password: string) => boolean;
  logoutUser: () => void;
  registerUser: (userData: Omit<User, 'id' | 'registrationDate' | 'isActive'>) => boolean;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  hasPermission: (action: string, targetUserId?: string, teamId?: string) => boolean;
  getUsersByRole: (role: User['roles'][0]) => User[];
  searchUsers: (searchTerm: string) => User[];
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile, signOut } = useSupabaseAuth();
  const [users, setUsers] = useState<User[]>([]);

  const currentUser = profile || null;

  const refreshUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      const userList: User[] = data?.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        roles: Array.isArray(profile.roles) ? profile.roles : ['player'],
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
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshUsers();
    }
  }, [currentUser?.id]);

  const loginUser = (email: string, password: string): boolean => {
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
    return true;
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const dbUpdates = {
        name: updates.name,
        roles: updates.roles,
        teams: updates.teams,
        assigned_teams: updates.assignedTeams,
        parent_of: updates.parentOf,
        phone: updates.phone,
        date_of_birth: updates.dateOfBirth?.toISOString(),
        profile_image: updates.profileImage,
        is_active: updates.isActive,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId);

      if (error) {
        console.error('Error updating user:', error);
        return;
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) {
        console.error('Error deactivating user:', error);
        return;
      }

      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const hasPermission = (action: string, targetUserId?: string, teamId?: string): boolean => {
    if (!currentUser || !currentUser.isActive) return false;
    
    const userRoles = currentUser.roles || [];
    
    switch (action) {
      case 'create_event':
        return userRoles.includes('admin') || userRoles.includes('trainer');
      case 'edit_event':
        return userRoles.includes('admin') || userRoles.includes('trainer');
      case 'delete_event':
        return userRoles.includes('admin');
      case 'manage_users':
        return userRoles.includes('admin');
      case 'manage_teams':
        return userRoles.includes('admin') || userRoles.includes('trainer');
      case 'join_event':
        return userRoles.includes('player') || userRoles.includes('trainer') || userRoles.includes('admin');
      default:
        return false;
    }
  };

  const getUsersByRole = (role: User['roles'][0]): User[] => {
    return users.filter(user => user.roles.includes(role) && user.isActive);
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
      searchUsers,
      refreshUsers
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
