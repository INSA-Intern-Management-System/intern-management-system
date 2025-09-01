import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { User } from "@/types/entities";
import { api } from "@/api/axios";
import DashboardLayout from "@/app/layout/dashboard-layout";
import UniversityDashboardClient from "./DashboardClient";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { User } from "@/types/entities";
import { api } from "@/api/axios";
import DashboardLayout from "@/app/layout/dashboard-layout";
import UniversityDashboardClient from "./DashboardClient";
import {
  fetchUniversityDashboard,
  UniversityDashboardResponse,
} from "@/app/services/universityDashboardService";

async function getUser(): Promise<User> {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  const response = await api.get<User>(`/users/me`, {
    headers: {
      Cookie: `access_token=${accessToken}`,
    },
    withCredentials: true,
  });
  return response.data;
}

async function getDashboardData() {
  const accessToken = (await cookies()).get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const dashboardData = await fetchUniversityDashboard();

  // Transform the API data to match the expected format
  fetchUniversityDashboard,
  UniversityDashboardResponse,
} from "@/app/services/universityDashboardService";

async function getUser(): Promise<User> {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  const response = await api.get<User>(`/users/me`, {
    headers: {
      Cookie: `access_token=${accessToken}`,
    },
    withCredentials: true,
  });
  return response.data;
}

async function getDashboardData() {
  const accessToken = (await cookies()).get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const dashboardData = await fetchUniversityDashboard();

  // Transform the API data to match the expected format
  const stats = [
    {
      title: "Active Interns",
      value: dashboardData.internStatusesCount.activeIntern.toString(),
      change: "+0%",
      icon: "Users",
      value: dashboardData.internStatusesCount.activeIntern.toString(),
      change: "+0%",
      icon: "Users",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Supervisors",
      value: dashboardData.supervisorCount.toString(),
      change: "+0",
      icon: "GraduationCap",
      value: dashboardData.supervisorCount.toString(),
      change: "+0",
      icon: "GraduationCap",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Completed Internships",
      value: dashboardData.internStatusesCount.completedIntern.toString(),
      change: "+0%",
      icon: "CheckCircle",
      value: dashboardData.internStatusesCount.completedIntern.toString(),
      change: "+0%",
      icon: "CheckCircle",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const recentActivities = dashboardData.recentActivities.map((activity) => ({
    id: activity.id,
    title: activity.type,
    description: activity.description,
    time: new Date(activity.createdAt).toLocaleDateString(),
  }));

  return {
    stats,
    recentActivities,
  };
}

export default async function UniversityDashboardPage() {
  const user = await getUser();
  const dashboardData = await getDashboardData();

  return (
    <DashboardLayout requiredRole="university">
      <UniversityDashboardClient
        user={user}
        stats={dashboardData.stats}
        recentActivities={dashboardData.recentActivities}
      />
    <DashboardLayout requiredRole="university">
      <UniversityDashboardClient
        user={user}
        stats={dashboardData.stats}
        recentActivities={dashboardData.recentActivities}
      />
    </DashboardLayout>
  );
}