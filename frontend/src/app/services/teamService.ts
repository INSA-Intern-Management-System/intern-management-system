import { messageApi, projectApi } from "@/api/axios";
import { cookies } from "next/headers";

export interface TeamMember {
  id: number;
  teamId: number;
  memberId: number;
  role: string;
  joinedAt: string;
  fullName?: string;
}

export interface Team {
  id: number;
  projectId: number | null;
  name: string;
  managerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  budget: number;
  technologies: string[];
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamResponseItem {
  project: Project | null;
  teams: Team;
  teamMembers: TeamMember[];
}

export interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface UserSearchResult {
  id: number;
  firstName: string;
  lastName: string;
  fieldOfStudy: string;
  university: string;
  status: string;
  role: string;
}

export interface CreateTeamRequest {
  name: string;
  managerId: number;
  projectId?: number | null;
  members?: Record<string, string>;
}

export interface AddMemberRequest {
  teamId: number;
  memberId: number;
  role: string;
}

// Get access token helper
const getAccessToken = async (): Promise<string> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }
  return accessToken;
};

// Fetch teams with pagination
export const fetchTeams = async (
  page: number = 0,
  size: number = 20
): Promise<PagedResponse<TeamResponseItem>> => {
  const accessToken = await getAccessToken();

  try {
    const response = await projectApi.get<PagedResponse<TeamResponseItem>>(
      "/projects/teams",
      {
        params: { page, size },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch teams:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to fetch teams");
  }
};

// Search projects
export const searchProjects = async (
  keyword: string,
  page: number = 0,
  size: number = 20
): Promise<PagedResponse<Project>> => {
  const accessToken = await getAccessToken();

  try {
    const response = await projectApi.get<PagedResponse<Project>>(
      "/projects/search",
      {
        params: { keyword, page, size },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to search projects:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to search projects"
    );
  }
};

// Search users by name
export const searchUsers = async (
  name: string,
  page: number = 0,
  size: number = 10
): Promise<PagedResponse<UserSearchResult>> => {
  const accessToken = await getAccessToken();

  try {
    const response = await messageApi.get<PagedResponse<UserSearchResult>>(
      "/messages/users/search",
      {
        params: { name, page, size },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to search users:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to search users");
  }
};

// Create team
export const createTeam = async (
  data: CreateTeamRequest
): Promise<TeamResponseItem> => {
  const accessToken = await getAccessToken();

  try {
    const response = await projectApi.post<TeamResponseItem>(
      "/projects/teams",
      data,
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to create team:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to create team");
  }
};

// Add member to team
export const addMember = async (
  data: AddMemberRequest
): Promise<TeamMember[]> => {
  const accessToken = await getAccessToken();

  try {
    const response = await projectApi.post<TeamMember[]>(
      "/projects/teams/members",
      data,
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to add member:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to add member");
  }
};

// Remove member from team
export const removeMember = async (
  teamMemberId: number
): Promise<{ message: string }> => {
  const accessToken = await getAccessToken();

  try {
    const response = await projectApi.delete<{ message: string }>(
      `/projects/teams/members/${teamMemberId}`,
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to remove member:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to remove member");
  }
};

// Assign project to team
export const assignProject = async (
  teamId: number,
  projectId: number
): Promise<TeamResponseItem> => {
  const accessToken = await getAccessToken();

  try {
    const response = await projectApi.patch<TeamResponseItem>(
      `/projects/teams/${teamId}/assign-project/${projectId}`,
      {},
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to assign project:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to assign project"
    );
  }
};

// Remove project from team
export const removeProjectFromTeam = async (
  teamId: number
): Promise<TeamResponseItem> => {
  const accessToken = await getAccessToken();

  try {
    const response = await projectApi.patch<TeamResponseItem>(
      `/projects/teams/${teamId}/remove-project`,
      {},
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to remove project:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to remove project"
    );
  }
};

// Delete team
export const deleteTeam = async (
  teamId: number
): Promise<{ message: string }> => {
  const accessToken = await getAccessToken();

  try {
    const response = await projectApi.delete<{ message: string }>(
      `/projects/teams/${teamId}`,
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to delete team:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to delete team");
  }
};
