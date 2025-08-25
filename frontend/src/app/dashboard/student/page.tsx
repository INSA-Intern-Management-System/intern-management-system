// app/dashboard/student/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { User } from "@/types/entities";
import { api } from "@/api/axios";
import DashboardLayout from "@/app/layout/dashboard-layout";
import StudentDashboardClient from "./StudentDashboardClient";

interface DashboardData {
  recentActivities: any[];
  reportStatus: {
    totalReport: number;
    averageRating: number;
  };
  message: string;
  infos: {
    supervisor: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      fieldOfStudy: string;
      institution: string;
    };
    projectManager: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      fieldOfStudy: string | null;
      institution: string;
    };
  };
  tasks: any[];
}

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

async function getDashboardData(): Promise<DashboardData> {
  const accessToken = (await cookies()).get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  try {
    const response = await api.get<DashboardData>("/users/student/dashboard", {
      params: {
        page: 0,
        size: 5,
      },
      headers: {
        Cookie: `access_token=${accessToken}`,
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);

    // Fallback to mock data if API fails
    return {
      recentActivities: [],
      reportStatus: {
        totalReport: 0,
        averageRating: 0,
      },
      message: "dashboard informations",
      infos: {
        supervisor: {
          id: 0,
          firstName: "Supervisor",
          lastName: "Name",
          email: "supervisor@example.com",
          fieldOfStudy: "Computer Science",
          institution: "University",
        },
        projectManager: {
          id: 0,
          firstName: "Project",
          lastName: "Manager",
          email: "pm@example.com",
          fieldOfStudy: null,
          institution: "Company",
        },
      },
      tasks: [],
    };
  }
}

export default async function StudentDashboardPage() {
  const user = await getUser();
  const dashboardData = await getDashboardData();
  console.log("Dashboard Data:", dashboardData.infos);

  // Transform the API data to match your component's expected props
  const stats = {
    supervisor: dashboardData.infos?.supervisor
      ? `${dashboardData.infos.supervisor.firstName} ${dashboardData.infos.supervisor.lastName}`
      : "N/A",
    mentor: dashboardData.infos?.projectManager
      ? `${dashboardData.infos.projectManager.firstName} ${dashboardData.infos.projectManager.lastName}`
      : "N/A",
    reportsSubmitted: dashboardData.reportStatus?.totalReport ?? 0,
    totalReports: dashboardData.reportStatus?.totalReport ?? 0, // Adjust if you have different logic
    attendance: 0, // This field doesn't exist in the API response
  };

  const recentActivity = dashboardData.recentActivities.map((activity) => ({
    id: activity.id?.toString() || Math.random().toString(),
    title: activity.type || "Activity",
    description: activity.description || "No description",
    time: activity.timestamp || "Recently",
  }));

  const upcomingTasks = dashboardData.tasks.map((task) => ({
    id: task.id?.toString() || Math.random().toString(),
    title: task.title || "Task",
    description: task.description || "No description",
    due_date: task.dueDate || "Soon",
    priority: task.priority || "medium",
  }));

  return (
    <DashboardLayout requiredRole="STUDENT">
      <StudentDashboardClient
        user={user}
        stats={stats}
        recentActivity={recentActivity}
        upcomingTasks={upcomingTasks}
      />
    </DashboardLayout>
  );
}
