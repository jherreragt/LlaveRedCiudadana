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
      connected_apps: {
        Row: ConnectedApp;
        Insert: {
          id?: string;
          name: string;
          description?: string;
          logo_url?: string;
          client_id: string;
          status?: 'active' | 'inactive';
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          description?: string;
          logo_url?: string;
          client_id?: string;
          status?: 'active' | 'inactive';
        };
        Relationships: [];
      };
      user_app_connections: {
        Row: UserAppConnection;
        Insert: {
          id?: string;
          user_id?: string;
          app_id: string;
          status?: 'pending' | 'authorized' | 'revoked';
          scopes?: string;
          authorized_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
        };
        Update: {
          status?: 'pending' | 'authorized' | 'revoked';
          scopes?: string;
          authorized_at?: string | null;
          revoked_at?: string | null;
        };
        Relationships: [];
      };
      security_events: {
        Row: SecurityEvent;
        Insert: {
          id?: string;
          user_id?: string;
          event_type: string;
          description?: string;
          ip_address?: string;
          user_agent?: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: {
      available_apps: {
        Row: AvailableApp;
      };
    };
    Functions: {
      set_user_role: {
        Args: { p_user_id: string; p_role: string; p_scope: string | null };
        Returns: void;
      };
      set_user_active: {
        Args: { p_user_id: string; p_active: boolean };
        Returns: void;
      };
      has_admin_role: {
        Args: { p_scope?: string | null };
        Returns: boolean;
      };
      has_staff_role: {
        Args: { p_scope?: string | null };
        Returns: boolean;
      };
      log_security_event: {
        Args: { p_user_id: string; p_event_type: string; p_description?: string; p_ip_address?: string; p_user_agent?: string };
        Returns: void;
      };
      verify_certificate_by_code: {
        Args: { p_code: string };
        Returns: {
          participant_name: string;
          course_title: string;
          issued_at: string;
          is_valid: boolean;
          attendance_percentage: number;
        }[];
      };
    };
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

export interface ConnectedApp {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  client_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  created_by: string | null;
}

export interface UserAppConnection {
  id: string;
  user_id: string;
  app_id: string;
  status: 'pending' | 'authorized' | 'revoked';
  scopes: string;
  authorized_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface AvailableApp {
  id: string;
  name: string;
  description: string;
  logo_url: string;
}

export interface AppConnectionWithApp extends UserAppConnection {
  app: ConnectedApp | AvailableApp;
}
