import { api } from "@/api/axios";
import { cookies } from "next/headers";

export interface DashboardV1Response {
  ActiveIntern: number;
  recentActivities: RecentActivity[];
  report: number;
  project: number;
  message: string;
  Application: number;
  tasks: {
    tasksForApps: Task;
    tasksForReports: Task;
  };
}

export interface DashboardV2Response {
  milestoneStats: {
    total: number;
    pending: number;
    completed: number;
    projectId: number;
  };
  rating: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    fieldOfStudy: string | null;
    university: string;
    role: {
      id: number;
      name: string;
      displayName: string;
      description: string;
    };
    status: string;
  };
}

export interface RecentActivity {
  id: number;
  userId: number;
  title: string;
  description: string;
  createdAt: string;
}

export interface Task {
  totalPending: number;
  description: string;
  priority: string;
}

export interface TopIntern {
  milestoneStats: {
    total: number;
    pending: number;
    completed: number;
    projectId: number;
  };
  rating: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    fieldOfStudy: string | null;
    university: string;
    role: {
      id: number;
      name: string;
      displayName: string;
      description: string;
    };
    status: string;
  };
}

export const fetchCompanyDashboardV1 =
  async (): Promise<DashboardV1Response> => {
    const accessToken = (await cookies()).get("access_token")?.value;
    if (!accessToken) {
      throw new Error("Access token is missing");
    }

    try {
      const response = await api.get<DashboardV1Response>(
        "/users/company/v1/dashboard",
        {
          params: {
            page: 0,
            size: 5,
          },
          headers: {
            Cookie: `access_token=${accessToken}`,
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch company dashboard v1:", error);
      throw error;
    }
  };

export const fetchCompanyDashboardV2 = async (): Promise<
  DashboardV2Response[]
> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await api.get<DashboardV2Response[]>(
      "/users/company/v2/dashboard",
      {
        params: {
          page: 0,
          size: 5,
        },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch company dashboard v2:", error);
    throw error;
  }
};
