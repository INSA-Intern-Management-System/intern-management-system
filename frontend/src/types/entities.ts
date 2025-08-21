// src/types/user.ts
export interface User {
  id: string; // Backend returns Long, but use string for frontend consistency
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Not returned in responses, so optional
  phoneNumber: string | null;
  address: string | null;
  gender: string | null;
  fieldOfStudy: string | null;
  institution: string | null;
  bio: string | null;
  notifyEmail: boolean | null;
  visibility: boolean | null;
  duration: string | null;
  linkedInUrl: string | null;
  githubUrl: string | null;
  cvUrl: string | null;
  profilePicUrl: string | null;
  lastReadNotificationAt: string | null; // ISO date string
  createdAt: string | null; // ISO date string
  updatedAt: string | null; // ISO date string
  lastLogin: string | null; // ISO date string
  supervisor: User | null; // Recursive type for supervisor
  supervisedInterns: User[] | null; // Array of users
  roles: Role;
  userStatus: "PENDING" | "APPROVED" | "REJECTED"; // Based on UserStatus enum
  status: "ONLINE" | "OFFLINE"; // Based on Status enum
  isFirstLogin: boolean;
}

export interface UserMessage {
  id: string;
  firstName: string;
  lastName: string;
  university: string | null;
  fieldOfStudy: string | null;
  status: string;
  role: string;
  profilePicUrl: string | null;
}

// src/types/role.ts
export interface Role {
  id: string;
  name: string; // e.g., "STUDENT", "ADMIN"
  displayName: string; // e.g., "Student role"
  description: string; // e.g., "Student role"
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  forcePasswordChange: boolean;
  token: string | null;
  user: User;
}

export interface LogoutResponse {
  message: string;
}
export interface Schedule {
  scheduleId: number;
  userId: number;
  title: string;
  description: string;
  dueDate: string;
  status: "PENDING" | "COMPLETED" | "OVERDUE";
  createdAt: string;
}

export interface Milestone {
  id: number;
  title: string;
  description: string;
  status: "PENDING" | "UPCOMING" | "COMPLETED"; // adjust based on your backend
  dueDate: string; // ISO date string
  createdAt: string; // ISO date string
}

export interface Task {
  scheduleId: number;
  userId: number;
  title: string;
  description: string;
  dueDate: string; // ISO date string
  status: "PENDING" | "UPCOMING" | "COMPLETED"; // adjust if needed
  createdAt: string; // ISO date string
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
}

// ✅ Paginated tasks response
export interface PaginatedTasks {
  content: Task[];
  pageable: Pageable;
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  number: number;
  size: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

// ✅ Full response wrapper
export interface DashboardResponse {
  milestones: Milestone[];
  tasks: PaginatedTasks;
}

export interface Review {
  id: number;
  reportId: number;
  feedback: string;
  rating: number;
  createdAt: string;
}
export interface Report {
  id: number;
  managerId: number;
  projectId: number;
  internId: number;
  title: string;
  periodTo: string;
  taskCompleted: string;
  challenges: string;
  nextWeekGoals: string;
  createdAt: string;
  review: Review | null;
  projectResponse: {
    projectID: number;
    projectName: string;
    projectDescription: string;
  };
}

export interface ReportsResponse {
  content: Report[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { sorted: boolean; empty: boolean; unsorted: boolean };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: { sorted: boolean; empty: boolean; unsorted: boolean };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface SearchUser {
  id: string;
  firstName: string;
  lastName: string;
  fieldOfStudy: string;
  university: string;
  status: string;
  role: string;
  profilePicUrl: string | null;
}

export interface UsersSearchResponse {
  content: SearchUser[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { sorted: boolean; empty: boolean; unsorted: boolean };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: { sorted: boolean; empty: boolean; unsorted: boolean };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface Room {
  id: number;
  user1Id: number;
  user2Id: number;
  lastMessageAt: string;
  createdAt: string;
}

export interface RoomUserUnreadDTO {
  room: Room;
  user: UserMessage;
  unreadCount: number;
}

export interface Message {
  id: number;
  senderId: number;
  roomId: number;
  receiverId: number;
  content: string;
  status: "SENT" | "DELIVERED" | "READ" | "UNREAD";
  createdAt: string;
  updatedAt: string;
}

export interface MessagesResponse {
  content: Message[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { sorted: boolean; empty: boolean; unsorted: boolean };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: { sorted: boolean; empty: boolean; unsorted: boolean };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface RoomsResponse {
  content: RoomUserUnreadDTO[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { sorted: boolean; empty: boolean; unsorted: boolean };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: { sorted: boolean; empty: boolean; unsorted: boolean };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface UsersResponse {
  content: User[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { sorted: boolean; empty: boolean; unsorted: boolean };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: { sorted: boolean; empty: boolean; unsorted: boolean };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface LeaveRequest {
  id: number;
  userId: number;
  receiverId: number;
  startDate: string;
  endDate: string;
  description?: string;
  type?: string;
  status?: string;
  createdAt: string;
  approvedBy?: string | null;
  rejectionReason?: string | null;
  days?: number;
}

export interface LeaveResponse {
  content: LeaveRequest[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export interface StatusCounts {
  pending: number;
  approved: number;
  rejected: number;
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

export interface Intern {
  name: string;
  role: string;
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
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  institution?: string;
  field_of_study?: string;
  gender?: string;
  duration?: string;
  linkedin_url?: string;
  github_url?: string;
  cv_url?: string;
  created_at: string;
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
export interface Application {
  id: number;
  applicant: Applicant;
  status: string;
  applied_at: string;
  updated_at: string;
}
