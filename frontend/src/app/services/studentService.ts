import { api as studentApi } from "@/api/axios";

export interface Supervisor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  fieldOfStudy: string;
  institution: string;
  phoneNumber: string;
  supervisedInterns: any;
}

export interface ProjectManager {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  fieldOfStudy: string | null;
  institution: string;
}

export interface Roles {
  id: number;
  name: string;
  displayName: string;
  description: string;
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  gender: string;
  notifyEmail: boolean;
  visibility: boolean | null;
  bio: string | null;
  duration: string | null;
  linkedInUrl: string | null;
  githubUrl: string | null;
  cvUrl: string | null;
  profilePicUrl: string | null;
  lastReadNotificationAt: string | null;
  createdAt: string;
  updatedAt: string;
  fieldOfStudy: string;
  institution: string;
  lastLogin: string | null;
  supervisor: Supervisor | null;
  projectManager: ProjectManager | null;
  userStatus: string;
  roles: Roles;
}

export interface StudentsResponse {
  content: Student[];
  currentPage: number;
  totalElements: number;
  totalPages: number;
}

export interface AssignSupervisorRequest {
  studentEmail: string;
  supervisorEmail: string;
}

export interface AssignSupervisorResponse {
  message: string;
  Success: boolean;
}

// Fetch all students
export const fetchStudents = async (
  page: number = 0,
  size: number = 10,
  accessToken: string
): Promise<StudentsResponse> => {
  try {
    console.log("Fetching students with page:", page, "size:", size);
    const response = await studentApi.get(
      "/users/get-student-for-university",
      {
        params: { page, size },
        headers: {
           Cookie: `access_token=${accessToken}`,
        },
      }
    );
    
    console.log("Raw API response:", response.data);
    
    // Handle different possible response structures
    let studentsData = response.data;
    
    // If the response is nested in a 'content' property
    if (studentsData.content && Array.isArray(studentsData.content)) {
      return {
        content: studentsData.content,
        currentPage: studentsData.currentPage || 0,
        totalElements: studentsData.totalElements || studentsData.content.length,
        totalPages: studentsData.totalPages || 1,
      };
    }
    
    // If the response is directly an array
    if (Array.isArray(studentsData)) {
      return {
        content: studentsData,
        currentPage: 0,
        totalElements: studentsData.length,
        totalPages: 1,
      };
    }
    
    // Fallback if structure is unexpected
    console.warn("Unexpected API response structure:", studentsData);
    return {
      content: [],
      currentPage: 0,
      totalElements: 0,
      totalPages: 0,
    };
    
  } catch (error: any) {
    console.error("Failed to fetch students:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Error status:", error.response.status);
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    return {
      content: [],
      currentPage: 0,
      totalElements: 0,
      totalPages: 0,
    };
  }
};

// Search students
export const searchStudents = async (
  query: string,
  page: number = 0,
  size: number = 10,
  accessToken: string
): Promise<StudentsResponse> => {
  try {
    console.log("Searching students with query:", query);
    const response = await studentApi.get(
      "/users/search",
      {
        params: { query, page, size },
        headers: {
           Cookie: `access_token=${accessToken}`,
        },
      }
    );
    
    console.log("Search API response:", response.data);
    
    let searchData = response.data;
    
    if (searchData.content && Array.isArray(searchData.content)) {
      return {
        content: searchData.content,
        currentPage: searchData.currentPage || 0,
        totalElements: searchData.totalElements || searchData.content.length,
        totalPages: searchData.totalPages || 1,
      };
    }
    
    if (Array.isArray(searchData)) {
      return {
        content: searchData,
        currentPage: 0,
        totalElements: searchData.length,
        totalPages: 1,
      };
    }
    
    console.warn("Unexpected search API response structure:", searchData);
    return {
      content: [],
      currentPage: 0,
      totalElements: 0,
      totalPages: 0,
    };
    
  } catch (error: any) {
    console.error("Failed to search students:", error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    return {
      content: [],
      currentPage: 0,
      totalElements: 0,
      totalPages: 0,
    };
  }
};

// Filter students by supervisor
export const filterStudentsBySupervisor = async (
  query: string,
  page: number = 0,
  size: number = 10,
  accessToken: string
): Promise<StudentsResponse> => {
  try {
    console.log("Filtering students by supervisor:", query);
    const response = await studentApi.get(
      "/users/filter-intern-by-supervisor",
      {
        params: { query, page, size },
        headers: {
           Cookie: `access_token=${accessToken}`,
        },
      }
    );
    
    console.log("Filter API response:", response.data);
    
    let filterData = response.data;
    
    if (filterData.content && Array.isArray(filterData.content)) {
      return {
        content: filterData.content,
        currentPage: filterData.currentPage || 0,
        totalElements: filterData.totalElements || filterData.content.length,
        totalPages: filterData.totalPages || 1,
      };
    }
    
    if (Array.isArray(filterData)) {
      return {
        content: filterData,
        currentPage: 0,
        totalElements: filterData.length,
        totalPages: 1,
      };
    }
    
    console.warn("Unexpected filter API response structure:", filterData);
    return {
      content: [],
      currentPage: 0,
      totalElements: 0,
      totalPages: 0,
    };
    
  } catch (error: any) {
    console.error("Failed to filter students by supervisor:", error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    return {
      content: [],
      currentPage: 0,
      totalElements: 0,
      totalPages: 0,
    };
  }
};

// Assign supervisor to student
export const assignSupervisor = async (
  data: AssignSupervisorRequest,
  accessToken: string
): Promise<AssignSupervisorResponse> => {
  try {
    console.log("Assigning supervisor:", data);
    const response = await studentApi.put(
      "/users/assign-supervisor",
      data,
      {
        headers: {
           Cookie: `access_token=${accessToken}`,
        },
      }
    );
    
    console.log("Assign supervisor response:", response.data);
    return response.data;
    
  } catch (error: any) {
    console.error("Failed to assign supervisor:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to assign supervisor"
    );
  }
};


