
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
  getUsersByRole: (role: User['role']) => User[];
  searchUsers: (searchTerm: string) => User[];
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile, signOut } = useSupabaseAuth();
  const [users, setUsers] = useState<User[]>([]);

  // Use Supabase profile as current user
  const currentUser = profile || null;

  useEffect(() => {
    if (currentUser) {
      refreshUsers();
    }
  }, [currentUser]);

  const refreshUsers = async () => {
    try {
      console.log('Refreshing users from database...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
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
      console.log('Users refreshed:', userList.length);
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  };

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
    return true;
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const dbUpdates = {
        name: updates.name,
        role: updates.role,
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
