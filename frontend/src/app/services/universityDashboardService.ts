import { api } from "@/api/axios";
import { cookies } from "next/headers";

export interface UniversityDashboardResponse {
  supervisorCount: number;
  recentActivities: RecentActivity[];
  internStatusesCount: {
    activeIntern: number;
    completedIntern: number;
  };
}

export interface RecentActivity {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  type: string;
}

export const fetchUniversityDashboard = async (): Promise<UniversityDashboardResponse> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  const response = await api.get<UniversityDashboardResponse>(
    "/users/university/dashboard",
    {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    }
  );
  return response.data;
};