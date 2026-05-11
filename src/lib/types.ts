export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      courses: {
        Row: Course;
        Insert: Partial<Course>;
        Update: Partial<Course>;
      };
      course_sessions: {
        Row: CourseSession;
        Insert: Partial<CourseSession>;
        Update: Partial<CourseSession>;
      };
      enrollments: {
        Row: Enrollment;
        Insert: Partial<Enrollment>;
        Update: Partial<Enrollment>;
      };
      attendance_records: {
        Row: AttendanceRecord;
        Insert: Partial<AttendanceRecord>;
        Update: Partial<AttendanceRecord>;
      };
      certificates: {
        Row: Certificate;
        Insert: Partial<Certificate>;
        Update: Partial<Certificate>;
      };
      email_logs: {
        Row: EmailLog;
        Insert: Partial<EmailLog>;
        Update: Partial<EmailLog>;
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
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration_hours: number;
  start_date: string | null;
  end_date: string | null;
  status: 'draft' | 'active' | 'completed';
  max_participants: number;
  attendance_threshold: number;
  image_url: string;
  category: string;
  location: string;
  modality: 'presencial' | 'virtual' | 'hibrido';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseSession {
  id: string;
  course_id: string;
  title: string;
  session_date: string;
  duration_minutes: number;
  description: string;
  location: string;
  is_mandatory: boolean;
  session_order: number;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  enrolled_at: string;
  notes: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  session_id: string;
  course_id: string;
  attended: boolean;
  marked_by: string | null;
  marked_at: string;
  notes: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_code: string;
  issued_at: string;
  issued_by: string | null;
  pdf_url: string;
  is_valid: boolean;
  attendance_percentage: number;
}

export interface EmailLog {
  id: string;
  user_id: string | null;
  email_type: string;
  recipient_email: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  metadata: Json;
  sent_at: string;
  created_at: string;
}

// Joined types for convenient queries
export interface EnrollmentWithCourse extends Enrollment {
  courses: Course;
}

export interface CertificateWithCourse extends Certificate {
  courses: Course;
}

export interface AttendanceWithSession extends AttendanceRecord {
  course_sessions: CourseSession;
}
