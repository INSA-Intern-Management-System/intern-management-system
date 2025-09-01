import { api } from "@/api/axios";
import { cookies } from "next/headers";

export interface AdminDashboardResponse {
  allActivities: Activity[];
  userStats: UserStats;
}

export interface Activity {
  id: number;
  userId: number;
  title: string;
  description: string;
  createdAt: string;
}

export interface UserStats {
  statusCounts: {
    COMPLETED: number;
    ACTIVE: number;
    PENDING: number;
  };
  allUsers: number;
  roleCounts: {
    Supervisor: number;
    Administrator: number;
    University: number;
    HR: number;
    Student: number;
    Project_Manager: number;
  };
}

export const fetchAdminDashboard = async (): Promise<AdminDashboardResponse> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  const response = await api.get<AdminDashboardResponse>(
    "/users/admin/dashboard",
    {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    }
  );
  return response.data;
};