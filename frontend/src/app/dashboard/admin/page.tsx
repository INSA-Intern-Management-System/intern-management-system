import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { User } from "@/types/entities";
import { api } from "@/api/axios";
import DashboardLayout from "@/app/layout/dashboard-layout";
import AdminDashboardClient from "./DashboardClient";
import {
  fetchAdminDashboard,
  AdminDashboardResponse,
} from "@/app/services/adminDashboardService";

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

  const dashboardData = await fetchAdminDashboard();

  // Transform the API data to match the expected format
  const systemStats = {
    totalUsers: dashboardData.userStats.allUsers,
    activeUsers: dashboardData.userStats.statusCounts.ACTIVE,
    pendingApprovals: dashboardData.userStats.statusCounts.PENDING,
    completedUsers: dashboardData.userStats.statusCounts.COMPLETED,
    totalInternships: 45, // You might need to add this to your API response
    studentsCount: dashboardData.userStats.roleCounts.Student,
    companiesCount: dashboardData.userStats.roleCounts.HR, // Assuming HR represents companies
    universitiesCount: dashboardData.userStats.roleCounts.University,
    adminsCount: dashboardData.userStats.roleCounts.Administrator,
    supervisorsCount: dashboardData.userStats.roleCounts.Supervisor,
    projectManagersCount: dashboardData.userStats.roleCounts.Project_Manager,
  };

  const recentActivities = dashboardData.allActivities.slice(0, 4).map(activity => ({
    id: activity.id,
    type: "system_activity", // Default type since your API doesn't provide specific types
    message: `${activity.title}: ${activity.description}`,
    timestamp: new Date(activity.createdAt).toLocaleDateString(),
    status: "active", // Default status
  }));

  const pendingActions = [
    {
      id: 1,
      title: "Pending Approvals",
      count: dashboardData.userStats.statusCounts.PENDING,
      description: "Users waiting for approval",
      priority: "high",
    },
    {
      id: 2,
      title: "Active Users",
      count: dashboardData.userStats.statusCounts.ACTIVE,
      description: "Currently active users",
      priority: "medium",
    },
    {
      id: 3,
      title: "Completed Users",
      count: dashboardData.userStats.statusCounts.COMPLETED,
      description: "Users with completed status",
      priority: "low",
    },
  ];

  return {
    systemStats,
    recentActivities,
    pendingActions,
  };
}

export default async function AdminDashboardPage() {
  const user = await getUser();
  const dashboardData = await getDashboardData();

  return (
    <DashboardLayout requiredRole="admin">
      <AdminDashboardClient
        user={user}
        systemStats={dashboardData.systemStats}
        recentActivities={dashboardData.recentActivities}
        pendingActions={dashboardData.pendingActions}
      />
    </DashboardLayout>
  );
}