// app/dashboard/company/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { User } from "@/types/entities";
import { api } from "@/api/axios";
import DashboardLayout from "@/app/layout/dashboard-layout";
import CompanyDashboardClient from "./companyDashboardClient";

async function getUser(): Promise<User> {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }
  
  try {
    const response = await api.get<User>(`/users/me`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    redirect("/login");
  }
}

async function getDashboardData() {
  const accessToken = (await cookies()).get("access_token")?.value;

  try {
    const [companyStats, recentActivity, tasks, topInterns] = await Promise.all([
      api.get("/company/dashboard/stats", {
        headers: { Cookie: `access_token=${accessToken}` },
        withCredentials: true,
      }),
      api.get("/company/notifications", {
        headers: { Cookie: `access_token=${accessToken}` },
        withCredentials: true,
      }),
      api.get("/company/tasks/upcoming", {
        headers: { Cookie: `access_token=${accessToken}` },
        withCredentials: true,
      }),
      api.get("/company/interns/top", {
        headers: { Cookie: `access_token=${accessToken}` },
        withCredentials: true,
      }),
    ]);

    return {
      stats: companyStats.data,
      recentActivity: recentActivity.data,
      upcomingTasks: tasks.data,
      topInterns: topInterns.data,
    };
  } catch (error) {
    // Fallback to mock data if API fails
    return {
      stats: {
        applications: 8,
        activeInterns: 5,
        activeProjects: 3,
        pendingReports: 2,
      },
      recentActivity: [
        {
          id: 1,
          type: "application",
          message: "New application from Marie Dubois for Software Developer position",
          time: "1 hour ago",
        },
        {
          id: 2,
          type: "report",
          message: "Weekly report submitted by John Smith",
          time: "3 hours ago",
        },
        {
          id: 3,
          type: "intern",
          message: "Alice Brown started her internship today",
          time: "1 day ago",
        },
        {
          id: 4,
          type: "project",
          message: "E-commerce Platform project milestone completed",
          time: "2 days ago",
        },
      ],
      upcomingTasks: [
        { id: 1, task: "Review pending applications", count: 3, priority: "high" },
        { id: 2, task: "Evaluate weekly reports", count: 2, priority: "medium" },
        { id: 3, task: "Schedule mentor meetings", count: 1, priority: "low" },
      ],
      topInterns: [
        {
          id: 1,
          name: "John Smith",
          position: "Software Developer",
          progress: 85,
          rating: 4.8,
        },
        {
          id: 2,
          name: "Alice Brown",
          position: "Data Analyst",
          progress: 78,
          rating: 4.6,
        },
        {
          id: 3,
          name: "Mike Johnson",
          position: "UI/UX Designer",
          progress: 92,
          rating: 4.9,
        },
      ],
    };
  }
}

export default async function CompanyDashboardPage() {
  const user = await getUser();
  const { stats, recentActivity, upcomingTasks, topInterns } = await getDashboardData();
  console.log("User Data:", user);

  return (
    <DashboardLayout requiredRole="company">
      <CompanyDashboardClient
        user={user}
        stats={stats}
        recentActivity={recentActivity}
        upcomingTasks={upcomingTasks}
        topInterns={topInterns}
      />
    </DashboardLayout>
  );
}