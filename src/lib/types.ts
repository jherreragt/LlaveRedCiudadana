export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name?: string;
          email?: string;
          phone?: string;
          organization?: string;
          job_title?: string;
          country?: string;
          city?: string;
          avatar_url?: string;
          role?: 'participant' | 'coordinator' | 'admin';
          admin_scope?: 'llave_gt' | 'escuela' | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          email?: string;
          phone?: string;
          organization?: string;
          job_title?: string;
          country?: string;
          city?: string;
          avatar_url?: string;
          role?: 'participant' | 'coordinator' | 'admin';
          admin_scope?: 'llave_gt' | 'escuela' | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  job_title: string;
  country: string;
  city: string;
  avatar_url: string;
  role: 'participant' | 'coordinator' | 'admin';
  admin_scope: 'llave_gt' | 'escuela' | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
