
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wnriuisfeozybhzaimxy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inducml1aXNmZW96eWJoemFpbXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzc4MTQsImV4cCI6MjA2NzgxMzgxNH0.KA6R2JeZkPFXS0-QdLcuM8kPq1OfdGNsoE6GZsGZDQc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'trainer' | 'player' | 'parent';
          teams: string[];
          assigned_teams?: string[];
          parent_of?: string[];
          phone?: string;
          date_of_birth?: string;
          profile_image?: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'trainer' | 'player' | 'parent';
          teams?: string[];
          assigned_teams?: string[];
          parent_of?: string[];
          phone?: string;
          date_of_birth?: string;
          profile_image?: string;
          is_active?: boolean;
        };
        Update: {
          email?: string;
          name?: string;
          role?: 'admin' | 'trainer' | 'player' | 'parent';
          teams?: string[];
          assigned_teams?: string[];
          parent_of?: string[];
          phone?: string;
          date_of_birth?: string;
          profile_image?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          category: 'U14' | 'U16' | 'U20' | 'U23' | '4. Liga' | 'Seniors';
          gender: 'M' | 'F' | 'Mixed';
          season: string;
          trainers: string[];
          players: string[];
          captain?: string;
          description?: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          category: 'U14' | 'U16' | 'U20' | 'U23' | '4. Liga' | 'Seniors';
          gender: 'M' | 'F' | 'Mixed';
          season: string;
          trainers?: string[];
          players?: string[];
          captain?: string;
          description?: string;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          category?: 'U14' | 'U16' | 'U20' | 'U23' | '4. Liga' | 'Seniors';
          gender?: 'M' | 'F' | 'Mixed';
          season?: string;
          trainers?: string[];
          players?: string[];
          captain?: string;
          description?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          date: string;
          type: 'training' | 'game' | 'tournament' | 'helper';
          time?: string;
          location?: string;
          venue_type?: 'indoor' | 'beach' | 'club';
          opponent?: string;
          description?: string;
          max_participants?: number;
          participants: string[];
          created_by: string;
          requires_approval?: boolean;
          team_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          date: string;
          type: 'training' | 'game' | 'tournament' | 'helper';
          time?: string;
          location?: string;
          venue_type?: 'indoor' | 'beach' | 'club';
          opponent?: string;
          description?: string;
          max_participants?: number;
          participants?: string[];
          created_by: string;
          requires_approval?: boolean;
          team_id?: string;
        };
        Update: {
          title?: string;
          date?: string;
          type?: 'training' | 'game' | 'tournament' | 'helper';
          time?: string;
          location?: string;
          venue_type?: 'indoor' | 'beach' | 'club';
          opponent?: string;
          description?: string;
          max_participants?: number;
          participants?: string[];
          requires_approval?: boolean;
          team_id?: string;
          updated_at?: string;
        };
      };
      helper_tasks: {
        Row: {
          id: string;
          event_id?: string;
          task: string;
          status: 'open' | 'completed' | 'no-show';
          assigned_to?: string;
          assigned_date: string;
          completed_date?: string;
          created_by: string;
          description?: string;
          priority: 'low' | 'medium' | 'high';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          event_id?: string;
          task: string;
          status?: 'open' | 'completed' | 'no-show';
          assigned_to?: string;
          assigned_date: string;
          created_by: string;
          description?: string;
          priority?: 'low' | 'medium' | 'high';
        };
        Update: {
          task?: string;
          status?: 'open' | 'completed' | 'no-show';
          assigned_to?: string;
          assigned_date?: string;
          completed_date?: string;
          description?: string;
          priority?: 'low' | 'medium' | 'high';
          updated_at?: string;
        };
      };
    };
  };
}
