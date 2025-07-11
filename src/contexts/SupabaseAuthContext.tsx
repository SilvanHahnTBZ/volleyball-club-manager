
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

interface SupabaseAuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  profile: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
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
        console.log('Profile loaded:', userProfile);
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    // Get initial session - only once
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes - with proper cleanup
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - run only once

  const signInWithGoogle = useCallback(async () => {
    console.log('Starting Google sign in...');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      },
    });
    if (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    console.log('Signing in with email:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    console.log('Signing up user:', email, name);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (!error && data.user) {
      console.log('Creating profile for user:', data.user.id);
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
  }, []);

  const signOut = useCallback(async () => {
    console.log('Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;

    console.log('Updating profile:', updates);
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
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    setProfile(prev => prev ? { ...prev, ...updates } : null);
  }, [user]);

  const value = {
    user,
    session,
    profile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};
