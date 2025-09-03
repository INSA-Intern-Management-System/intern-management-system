import { api } from "@/api/axios";

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

export interface User {
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

export interface UsersResponse {
  users: User[];
  currentPage: number;
  totalElements: number;
  totalPages: number;
  totalUser?: number;
  message?: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  gender: string;
  fieldOfStudy: string;
  duration: string;
  bio: string;
  notifyEmail: boolean;
  visibility: boolean;
  institution: string;
  linkedInUrl: string;
  githubUrl: string;
  cvUrl: string;
  profilePicUrl: string;
  lastReadNotificationAt: string;
  role: string;
  userStatus: string;
}

export interface ResetPasswordRequest {
  targetUserEmail: string;
  newPassword: string;
}

// Fetch all users with pagination
export const fetchUsers = async (
  page: number = 0,
  size: number = 5,
  accessToken: string
): Promise<UsersResponse> => {
  try {
    const response = await api.get(
      "/users",
      {
        params: { page, size },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Cookie: `access_token=${accessToken}`,
        },
      }
    );
    
    return {
      users: response.data.users || [],
      currentPage: response.data.currentPage || 0,
      totalElements: response.data.totalElements || response.data.totalUser || 0,
      totalPages: response.data.totalPages || 1,
      totalUser: response.data.totalUser,
      message: response.data.message,
    };
    
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
};

// Search users with pagination
export const searchUsers = async (
  query: string,
  page: number = 0,
  size: number = 5,
  accessToken: string
): Promise<UsersResponse> => {
  try {
    const response = await api.get(
      "/users/search",
      {
        params: { query, page, size },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Cookie: `access_token=${accessToken}`,
        },
      }
    );
    
    return {
      users: response.data.content || [],
      currentPage: response.data.currentPage || 0,
      totalElements: response.data.totalElements || 0,
      totalPages: response.data.totalPages || 1,
    };
    
  } catch (error: any) {
    console.error("Failed to search users:", error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to search users");
  }
};

// Filter users by status with pagination
export const filterUsersByStatus = async (
  status: string,
  page: number = 0,
  size: number = 5,
  accessToken: string
): Promise<UsersResponse> => {
  try {
    const response = await api.get(
      "/users/filter-all-users-by-status",
      {
        params: { query: status, page, size },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Cookie: `access_token=${accessToken}`,
        },
      }
    );
    
    return {
      users: response.data.content || [],
      currentPage: response.data.currentPage || 0,
      totalElements: response.data.totalElements || 0,
      totalPages: response.data.totalPages || 1,
    };
    
  } catch (error: any) {
    console.error("Failed to filter users by status:", error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to filter users");
  }
};

// Filter users by role with pagination
export const filterUsersByRole = async (
  role: string,
  page: number = 0,
  size: number = 5,
  accessToken: string
): Promise<UsersResponse> => {
  try {
    const response = await api.get(
      "/users/filter-by-role",
      {
        params: { query: role, page, size },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Cookie: `access_token=${accessToken}`,
        },
      }
    );
    
    return {
      users: response.data.content || [],
      currentPage: response.data.currentPage || 0,
      totalElements: response.data.totalElements || 0,
      totalPages: response.data.totalPages || 1,
    };
    
  } catch (error: any) {
    console.error("Failed to filter users by role:", error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to filter users by role");
  }
};

// Create user
export const createUser = async (
  userData: Partial<CreateUserRequest>,
  accessToken: string
): Promise<{ message: string; user: User }> => {
  try {
    const response = await api.post(
      "/auth/register",
      userData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Cookie: `access_token=${accessToken}`,
        },
      }
    );
    
    return response.data;
    
  } catch (error: any) {
    console.error("Failed to create user:", error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to create user");
  }
};

// Delete user
export const deleteUser = async (
  userId: number,
  accessToken: string
): Promise<{ message: string }> => {
  try {
    const response = await api.delete(
      `/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Cookie: `access_token=${accessToken}`,
        },
      }
    );
    
    return response.data;
    
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to delete user");
  }
};

// Reset password
export const resetPassword = async (
  resetData: ResetPasswordRequest,
  accessToken: string
): Promise<{ message: string }> => {
  try {
    const response = await api.post(
      "/users/admin/reset-password",
      resetData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Cookie: `access_token=${accessToken}`,
        },
      }
    );
    
    return response.data;
    
  } catch (error: any) {
    console.error("Failed to reset password:", error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to reset password");
  }
};