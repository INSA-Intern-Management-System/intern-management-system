import { cookies } from "next/headers";
import { projectApi, messageApi } from "@/api/axios";

interface PagedResponse<T> {
  content: T[];
  number: number;
  totalPages: number;
  totalElements: number;
  size: number;
}

interface ProjectResponse {
  id: number;
  name: string;
}

interface MemberResponse {
  id: number;
  fullName: string;
}

interface TeamResponseItem {
  teams: { id: number; name: string };
  project: { id: number; name: string } | null;
  teamMembers: { id: number; memberId: number; role: string; fullName?: string }[];
}

interface AddMemberByEmailResponse {
  userId: number;
  fullName: string;
}

export const addMemberByEmail = async (email: string, accessToken: string): Promise<AddMemberByEmailResponse> => {
  try {
    const response = await messageApi.post<AddMemberByEmailResponse>(
      "/users/by-email",
      { email },
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to add member by email:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    if (error.response?.status === 404) {
      throw new Error("User with this email not found");
    }
    throw new Error(error.response?.data?.message || "Failed to add member by email");
  }
};

export const fetchProjects = async (
  page: number = 0,
  size: number = 100,
  accessToken: string
): Promise<PagedResponse<ProjectResponse>> => {
  try {
    const response = await projectApi.get<PagedResponse<any>>("/projects", {
      params: { page, size },
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
    });
    const content = response.data.content
      .filter((p: any) => p != null && p.id != null)
      .map((p: any, index: number) => ({
        id: p.id || index + 1,
        name: p.name || `Project ${p.id || index + 1}`,
      }));
    return {
      content,
      number: response.data.number ?? page,
      totalPages: response.data.totalPages ?? 1,
      totalElements: response.data.totalElements ?? content.length,
      size: response.data.size ?? size,
    };
  } catch (error: any) {
    console.error("Failed to fetch projects:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    return {
      content: [],
      number: page,
      totalPages: 0,
      totalElements: 0,
      size: size,
    };
  }
};

export const fetchTeams = async (
  page: number = 0,
  size: number = 3,
  accessToken: string
): Promise<PagedResponse<TeamResponseItem>> => {
  try {
    const response = await projectApi.get<PagedResponse<TeamResponseItem>>("/projects/teams", {
      params: { page, size },
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
    });
    const content = response.data.content
      .filter((t: any) => t != null && t.teams != null && t.teams.id != null)
      .map((t: any) => ({
        teams: {
          id: t.teams?.id || 0,
          name: t.teams?.name || "Unnamed Team",
        },
        project: t.project
          ? {
              id: t.project.id || 0,
              name: t.project.name || `Project ${t.project.id || 'unknown'}`,
            }
          : null,
        teamMembers: t.teamMembers?.map((tm: any) => ({
          id: tm.id || 0,
          memberId: tm.memberId || 0,
          role: tm.role || "Unknown",
          fullName: tm.fullName || `User ${tm.memberId || 'unknown'}`,
        })) || [],
      }));
    return {
      content,
      number: response.data.number ?? page,
      totalPages: response.data.totalPages ?? 1,
      totalElements: response.data.totalElements ?? content.length,
      size: response.data.size ?? size,
    };
  } catch (error: any) {
    console.error("Failed to fetch teams:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    return {
      content: [],
      number: page,
      totalPages: 0,
      totalElements: 0,
      size: size,
    };
  }
};

export const createTeam = async (data: { name: string; projectId: number | null; memberEmail?: string; managerId: number }, accessToken: string) => {
  try {
    const members: Record<string, string> = {};
    if (data.memberEmail) {
      const user = await addMemberByEmail(data.memberEmail, accessToken);
      members[user.userId.toString()] = "Developer";
    }
    const response = await projectApi.post(
      "/projects/teams",
      {
        name: data.name,
        projectId: data.projectId,
        members,
        managerId: data.managerId,
      },
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
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

export const addMember = async (data: { teamId: number; memberId: number; role: string }, accessToken: string) => {
  try {
    const response = await projectApi.post(
      "/projects/teams/members",
      {
        teamId: data.teamId,
        memberId: data.memberId,
        role: data.role,
      },
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
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

export const removeMember = async (teamMemberId: number, accessToken: string) => {
  try {
    const response = await projectApi.delete(`/projects/teams/members/${teamMemberId}`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to remove member:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || "Invalid request to remove member");
    }
    throw new Error(error.response?.data?.message || "Failed to remove member");
  }
};

export const assignProject = async (teamId: number, projectId: number, accessToken: string) => {
  try {
    const response = await projectApi.patch(
      `/projects/teams/${teamId}/assign-project/${projectId}`,
      {},
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to assign project:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to assign project");
  }
};

export const deleteTeam = async (teamId: number, accessToken: string) => {
  try {
    const response = await projectApi.delete(`/teams/${teamId}`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to delete team:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to delete team");
  }
};