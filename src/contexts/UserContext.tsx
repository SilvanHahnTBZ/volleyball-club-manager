
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentUser = profile || null;

  const refreshUsers = useCallback(async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous calls
    
    setIsRefreshing(true);
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
      console.log('Users refreshed:', userList.length);
    } catch (error) {
      console.error('Error refreshing users:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // Only refresh users when currentUser changes and exists
  useEffect(() => {
    if (currentUser && !isRefreshing) {
      refreshUsers();
    }
  }, [currentUser?.id]); // Only depend on user ID to prevent unnecessary calls

  const loginUser = useCallback((email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.isActive);
    return !!user;
  }, [users]);

  const logoutUser = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [signOut]);

  const registerUser = useCallback((userData: Omit<User, 'id' | 'registrationDate' | 'isActive'>): boolean => {
    return true;
  }, []);

  const updateUser = useCallback(async (userId: string, updates: Partial<User>) => {
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
  }, [users]);

  const deleteUser = useCallback(async (userId: string) => {
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
  }, [users]);

  const hasPermission = useCallback((action: string, targetUserId?: string, teamId?: string): boolean => {
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
      case 'view_profiles':
        if (userRoles.includes('admin')) return true;
        if (userRoles.includes('trainer') && targetUserId) {
          const targetUser = users.find(u => u.id === targetUserId);
          return targetUser ? targetUser.teams.some(t => currentUser.assignedTeams?.includes(t)) : false;
        }
        if (targetUserId) {
          return currentUser.id === targetUserId || 
                 (userRoles.includes('parent') && currentUser.parentOf?.includes(targetUserId));
        }
        return true;
      case 'view_helper_tasks':
        if (userRoles.includes('admin')) return true;
        if (userRoles.includes('trainer')) return true;
        if (targetUserId) {
          return currentUser.id === targetUserId || 
                 (userRoles.includes('parent') && currentUser.parentOf?.includes(targetUserId));
        }
        return false;
      case 'create_helper_task':
        return userRoles.includes('admin') || userRoles.includes('trainer');
      case 'edit_helper_task':
        return userRoles.includes('admin') || userRoles.includes('trainer');
      case 'delete_helper_task':
        return userRoles.includes('admin');
      case 'view_team_events':
        if (userRoles.includes('admin')) return true;
        if (userRoles.includes('trainer') && teamId) {
          return currentUser.assignedTeams?.includes(teamId) || false;
        }
        if (userRoles.includes('player') && teamId) {
          return currentUser.teams.includes(teamId);
        }
        if (userRoles.includes('parent') && teamId) {
          const childrenInTeam = users.filter(u => 
            currentUser.parentOf?.includes(u.id) && u.teams.includes(teamId)
          );
          return childrenInTeam.length > 0;
        }
        return false;
      case 'assign_teams':
        return userRoles.includes('admin');
      default:
        return false;
    }
  }, [currentUser, users]);

  const getUsersByRole = useCallback((role: User['roles'][0]): User[] => {
    return users.filter(user => user.roles.includes(role) && user.isActive);
  }, [users]);

  const searchUsers = useCallback((searchTerm: string): User[] => {
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.isActive && (
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      )
    );
  }, [users]);

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
