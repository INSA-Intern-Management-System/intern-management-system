
export interface Project {
  id: number;
  name: string;
  description: string;
  status: "ACTIVE" | "COMPLETED" | "PLANNING" | "ONHOLD";
  startDate: string;
  endDate: string;
  budget: number;
  technologies: string[];
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  teams?: any[];
  teamMembers?: Array<{
    name: string;
    role: string;
  }>;
  milestones?: Array<{
    id?: number;
    name: string;
    completed: boolean;
    dueDate?: string;
    description?: string;

  }>;
  progress?: number;
}

  export interface Milestone {
    id?: number;
    projectId?: number;
    title?: string;
    description?: string;
    status?: string;
    dueDate?: string;
    createdAt?: string;
    updatedAt?: string;
    name: string; // Mapped from title
    completed: boolean; // Mapped from status === "COMPLETED"
  }

export interface PaginatedProjects {
  content: Array<{
    project: Project;
    teams: any[];
    teamMembers: Array<{ name: string; role: string }>;
    milestones: Array<{ name: string; completed: boolean }>;
  }>;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  planning: number;
  onhold: number;
  averageProgress?: number;
}