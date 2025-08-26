import { projectApi } from "@/api/axios";
import { PaginatedProjects, Project, ProjectStats } from "@/types/project";
import { cookies } from "next/headers";

// Create a new project
export const createProject = async (
  projectData: Omit<Project, "id" | "createdBy" | "createdAt" | "updatedAt" | "teams" | "teamMembers" | "progress" |"milestone" >
): Promise<Project> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await projectApi.post<Project>("/projects", {
      ...projectData,
      status: projectData.status.toUpperCase(),
    }, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create project:", error);
    throw error;
  }
};

// Get paginated projects
export const fetchProjects = async (
  page: number = 0,
  size: number = 100
): Promise<PaginatedProjects> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await projectApi.get<PaginatedProjects>("/projects", {
      params: { page, size },
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size,
      number: page,
    };
  }
};

// Get single project by ID
export const fetchProjectById = async (id: number): Promise<Project> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await projectApi.get<Project>(`/projects/${id}`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch project with id ${id}:`, error);
    throw error;
  }
};

// Update project status
export const updateProjectStatus = async (id: number, newStatus: string): Promise<Project> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await projectApi.put<Project>(
      `/projects/${id}/status`,
      {},
      {
        params: { newStatus: newStatus.toUpperCase() },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to update project status for id ${id}:`, error);
    throw error;
  }
};

// Update project details
export const updateProject = async (id: number, projectData: Partial<Project>): Promise<Project> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await projectApi.patch<Project>(
      `/projects/${id}/status`,
      {}, 
      {
        params: { 
          newStatus: projectData.status?.toUpperCase(),
          description: projectData.description,
        },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Failed to update project with id ${id}:`, error);
    throw error;
  }
};

// Delete project
export const deleteProject = async (id: number): Promise<void> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    await projectApi.delete<void>(`/projects/${id}`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
  } catch (error) {
    console.error(`Failed to delete project with id ${id}:`, error);
    throw error;
  }
};

// Search projects by keyword
export const searchProjects = async (
  keyword: string,
  page: number = 0,
  size: number = 20
): Promise<PaginatedProjects> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await projectApi.get<PaginatedProjects>("/projects/search", {
      params: { keyword, page, size },
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to search projects:", error);
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size,
      number: page,
    };
  }
};

// Get project stats
export const fetchProjectStats = async (): Promise<ProjectStats> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await projectApi.get<ProjectStats>("/projects/stats", {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch project stats:", error);
    return {
      total: 0,
      active: 0,
      completed: 0,
      planning: 0,
      onhold: 0,
      averageProgress: 0,
    };
  }
};

// Create a new milestone
export const createMilestone = async (

  milestoneData: {
      projectId: number,
    title: string;
    description: string;
    status: string;
    dueDate: string;
  }
): Promise<any> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await projectApi.post(
      "/projects/milestones",
      {
      
        ...milestoneData,
        status: milestoneData.status.toUpperCase(),
      },
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create milestone:", error);
    throw error;
  }
};

// Get milestones for a project
export const fetchMilestones = async (projectId: number): Promise<any[]> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await projectApi.get(`/projects/${projectId}/milestones`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch milestones for project ${projectId}:`, error);
    throw error;
  }
};

// Update milestone status
export const updateMilestoneStatus = async (
  milestoneId: number,
  newStatus: string
): Promise<any> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await projectApi.patch(
      `/projects/milestones/${milestoneId}/status`,
      {},
      {
        params: { newStatus: newStatus.toUpperCase() },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to update milestone status for id ${milestoneId}:`, error);
    throw error;
  }
};

// Delete milestone
export const deleteMilestone = async (milestoneId: number): Promise<any> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await projectApi.delete(`/projects/milestones/${milestoneId}`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to delete milestone with id ${milestoneId}:`, error);
    throw error;
  }
};