// TypeScript interfaces for all major entities based on the database schema

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  gender?: string;
  phone_number?: string;
  institution?: string;
  field_of_study?: string;
  bio?: string;
  notify_email?: boolean;
  visibility?: string;
  address?: string;
  duration?: string;
  linkedin_url?: string;
  github_url?: string;
  cv_url?: string;
  profile_pic_url?: string;
  role: string;
  last_read_notification_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  technologies?: string[];
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: number;
  project_id: number;
  name?: string;
  manager_id: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: number;
  team_id: number;
  user_id: number;
  role: string;
  joined_at: string;
}

export interface Application {
  id: number;
  applicant_id: number;
  status?: string;
  created_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assigned_to?: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

// No direct TaskAssignment table in schema, skipping

export interface Report {
  id: number;
  student_id: number;
  project_id: number;
  title: string;
  period_to: string;
  review_id?: number; // Links to Review object for fetching review details
  task_completed?: string;
  challenges?: string;
  next_week_goals?: string;
  created_at: string;
}

export interface Review {
  id: number;
  report_id: number;
  feedback?: string;
  rating?: number;
  reviewer_id: number;
  created_at: string;
}

export interface Notification {
  id: number;
  role: string[];
  title: string;
  description?: string;
  created_at: string;
}

export interface UserNotificationStatus {
  user_id: number;
  notification_id: number;
  is_read?: boolean;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: number;
  user1_id: number;
  user2_id: number;
  last_message_at?: string;
  created_at: string;
}

// No direct ConversationParticipant table in schema, skipping

export interface LeaveRequest {
  id: number;
  user_id: number;
  receiver_id: number;
  start_date: string;
  end_date: string;
  description?: string;
  type?: string;
  status?: string;
  created_at: string;
}

export interface Activity {
  id: number;
  user_id: number;
  title: string;
  description: string;
  created_at: string;
}
export interface Applicant {
  id: number;
  user_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  institution: string;
  field_of_study: string;
  gender: string;
  duration: string;
  linkedin_url?: string;
  github_url?: string;
  cv_url?: string;
  application_status?: string;
  created_at: string;
  updated_at: string;
}
export interface StudentTask {
  id: number;
  student_id: number;
  title: string;
  description?: string;
  due_date: string;
  is_completed?: boolean;
  created_at: string;
  updated_at: string;
}
