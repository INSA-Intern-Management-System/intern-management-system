import { projectApi } from "@/api/axios";
import { PaginatedProjects, Project, ProjectStats } from "@/types/project";
import { cookies } from "next/headers";

// Create a new project
export const createProject = async (
  projectData: Omit<
    Project,
    | "id"
    | "createdBy"
    | "createdAt"
    | "updatedAt"
    | "teams"
    | "teamMembers"
    | "progress"
    | "milestone"
  >
): Promise<Project> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await projectApi.post<Project>(
      "/projects",
      {
        ...projectData,
        status: projectData.status.toUpperCase(),
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

// Update project status with milestones
export const updateProjectStatus = async (
  projectId: number,
  projectStatus: string,
  milestoneIds: number[] = [],
  milestoneStatuses: string[] = []
): Promise<Project> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await projectApi.put<Project>(
      `/projects/update/status`,
      {
        projectId,
        projectStatus: projectStatus.toUpperCase(),
        milestoneIds,
        milestoneStatuses: milestoneStatuses.map((status) =>
          status.toUpperCase()
        ),
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
    console.error(
      `Failed to update project status for id ${projectId}:`,
      error
    );
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
    const response = await projectApi.get<PaginatedProjects>(
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
export const createMilestone = async (milestoneData: {
  projectId: number;
  title: string;
  description: string;
  status: string;
  dueDate: string;
}): Promise<any> => {
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
    console.error(
      `Failed to fetch milestones for project ${projectId}:`,
      error
    );
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
    const response = await projectApi.delete(
      `/projects/milestones/${milestoneId}`,
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to delete milestone with id ${milestoneId}:`, error);
    throw error;
  }
};

// Update multiple milestones status along with project status
export const updateProjectAndMilestonesStatus = async (
  projectId: number,
  projectStatus: string,
  milestoneUpdates: Array<{
    milestoneId: number;
    status: string;
  }>
): Promise<Project> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const milestoneIds = milestoneUpdates.map((m) => m.milestoneId);
    const milestoneStatuses = milestoneUpdates.map((m) =>
      m.status.toUpperCase()
    );

    const response = await projectApi.patch<Project>(
      `/projects/update/status`,
      {
        projectId,
        projectStatus: projectStatus.toUpperCase(),
        milestoneIds,
        milestoneStatuses,
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
    console.error(
      `Failed to update project and milestones status for project ${projectId}:`,
      error
    );
    throw error;
  }
};

export const updateProject = async (
  id: number,
  projectData: Partial<Project>
): Promise<Project> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    // Prepare the update data
    const updatePayload: any = {};

    if (projectData.description !== undefined) {
      updatePayload.description = projectData.description;
    }
    if (projectData.budget !== undefined) {
      updatePayload.budget = projectData.budget;
    }
    if (projectData.technologies !== undefined) {
      updatePayload.technologies = projectData.technologies;
    }
    if (projectData.startDate !== undefined) {
      updatePayload.startDate = projectData.startDate;
    }
    if (projectData.endDate !== undefined) {
      updatePayload.endDate = projectData.endDate;
    }
    if (projectData.name !== undefined) {
      updatePayload.name = projectData.name;
    }
    if (projectData.status !== undefined) {
      updatePayload.status = projectData.status.toUpperCase();
    }

    // Use PUT or PATCH depending on your API
    const response = await projectApi.put<Project>(
      `/projects/${id}`,
      updatePayload,
      {
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

// Update project status with milestones - SEPARATE FUNCTION
export const updateProjectStatusWithMilestones = async (
  projectId: number,
  projectStatus: string,
  milestoneIds: number[] = [],
  milestoneStatuses: string[] = []
): Promise<{ message: string }> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await projectApi.patch<{ message: string }>(
      `/projects/update/status`,
      {
        projectId,
        projectStatus: projectStatus.toUpperCase(),
        milestoneIds,
        milestoneStatuses: milestoneStatuses.map((status) =>
          status.toUpperCase()
        ),
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
    console.error(
      `Failed to update project status for id ${projectId}:`,
      error
    );
    throw error;
  }
};

// Update milestone status - SEPARATE FUNCTION
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
    console.error(
      `Failed to update milestone status for id ${milestoneId}:`,
      error
    );
    throw error;
  }
};
