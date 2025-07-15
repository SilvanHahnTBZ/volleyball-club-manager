import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

interface AuthContextType {
  // Supabase Auth
  user: SupabaseUser | null;
  session: Session | null;
  profile: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  
  // User Management
  users: User[];
  currentUser: User | null;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for offline mode
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    roles: ['admin'],
    teams: [],
    assignedTeams: [],
    parentOf: [],
    isActive: true,
    registrationDate: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Trainer Hans',
    email: 'trainer@example.com',
    roles: ['trainer'],
    teams: ['1', '2'],
    assignedTeams: ['1', '2'],
    parentOf: [],
    isActive: true,
    registrationDate: new Date('2024-01-15')
  },
  {
    id: '3',
    name: 'Player Max',
    email: 'player@example.com',
    roles: ['player'],
    teams: ['1'],
    assignedTeams: [],
    parentOf: [],
    isActive: true,
    registrationDate: new Date('2024-02-01')
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>(mockUsers); // Start with mock data
  const [offlineMode, setOfflineMode] = useState(false);

  const currentUser = profile || null;

  const fetchProfile = async (userId: string) => {
    if (offlineMode) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching profile, switching to offline mode:', error);
        setOfflineMode(true);
        return;
      }

      if (data) {
        const userProfile: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          roles: Array.isArray(data.roles) ? data.roles : ['player'],
          teams: data.teams || [],
          assignedTeams: data.assigned_teams || [],
          parentOf: data.parent_of || [],
          phone: data.phone,
          dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
          profileImage: data.profile_image,
          isActive: data.is_active,
          registrationDate: new Date(data.created_at)
        };
        setProfile(userProfile);
      }
    } catch (error) {
      console.warn('Error fetching profile, switching to offline mode:', error);
      setOfflineMode(true);
    }
  };

  const refreshUsers = async () => {
    if (offlineMode) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('Error fetching users, using cached data:', error);
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
      console.warn('Error refreshing users, using cached data:', error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
          await refreshUsers();
        }
      } catch (error) {
        console.warn('Error initializing auth, using offline mode:', error);
        setOfflineMode(true);
      } finally {
        setLoading(false);
      }
    };

    // Quick initialization with fallback
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setOfflineMode(true);
    }, 3000); // 3 second timeout

    initAuth().finally(() => {
      clearTimeout(timeoutId);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
          await refreshUsers();
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  // Auth methods
  const signInWithGoogle = async () => {
    if (offlineMode) throw new Error('Offline mode - cannot sign in');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (offlineMode) {
      // Demo login - find user by email
      const mockUser = mockUsers.find(u => u.email === email);
      if (mockUser) {
        setProfile(mockUser);
        return { error: null };
      }
      return { error: { message: 'User not found in demo mode' } };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (offlineMode) throw new Error('Offline mode - cannot sign up');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (!error && data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        name,
        roles: ['player'],
        teams: [],
        is_active: true,
      });
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return { error };
  };

  const signOut = async () => {
    if (!offlineMode) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user && !offlineMode) return;

    if (offlineMode) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return;
    }

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
      .eq('id', user!.id);

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  // User management methods
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
    if (offlineMode) {
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));
      return;
    }

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
    if (offlineMode) {
      setUsers(users.filter(user => user.id !== userId));
      return;
    }

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

  const value = {
    // Supabase Auth
    user,
    session,
    profile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    signOut,
    updateProfile,
    
    // User Management
    users,
    currentUser,
    loginUser,
    logoutUser,
    registerUser,
    updateUser,
    deleteUser,
    hasPermission,
    getUsersByRole,
    searchUsers,
    refreshUsers,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};