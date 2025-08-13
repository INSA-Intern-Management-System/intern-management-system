// TypeScript interfaces for all major entities based on the database schema


export interface Intern {
   name: string; 
   role: string ;
  };

export interface Milestone { 
  name: string; 
  completed: boolean ;
};

export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  progress: number;
  budget: string;
  interns: Intern[];
  mentor: string;
  technologies: string[];
  milestones: Milestone[];
};

export interface Applicant {
  id: number
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  institution?: string
  field_of_study?: string
  gender?: string
  duration?: string
  linkedin_url?: string
  github_url?: string
  cv_url?: string
  created_at: string
}


export interface Application {
  id:number
  applicant: Applicant
  status: string
  applied_at: string
  updated_at: string
}

