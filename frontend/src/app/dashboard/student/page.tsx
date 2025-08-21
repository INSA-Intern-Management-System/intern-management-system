// app/dashboard/student/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { User } from "@/types/entities";
import { api } from "@/api/axios";
import DashboardLayout from "@/app/layout/dashboard-layout";
import StudentDashboardClient from "./StudentDashboardClient";

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
    const [internship, activities, tasks] = await Promise.all([
      api.get("/internships/student", {
        headers: { Cookie: `access_token=${accessToken}` },
        withCredentials: true,
      }),
      api.get("/notifications", {
        headers: { Cookie: `access_token=${accessToken}` },
        withCredentials: true,
      }),
      api.get("/tasks", {
        headers: { Cookie: `access_token=${accessToken}` },
        withCredentials: true,
      }),
    ]);

    return {
      stats: internship.data,
      recentActivity: activities.data,
      upcomingTasks: tasks.data,
    };
  } catch (error) {
    // Fallback to mock data if API fails
    return {
      stats: {
        supervisor: "Dr. Smith",
        mentor: "Sarah Wilson",
        reportsSubmitted: 2,
        totalReports: 3,
        attendance: 92,
      },
      recentActivity: [
        {
          id: "1",
          title: "feedback",
          description: "New feedback received for Week 2 report",
          time: "2 hours ago",
        },
        // ... other mock data
      ],
      upcomingTasks: [
        {
          id: "1",
          title: "Submit Week 3 Report",
          description: "This is just the description for each task.",
          due_date: "Tomorrow",
          priority: "high",
        },
        // ... other mock data
      ],
    };
  }
}

export default async function StudentDashboardPage() {
  const user = await getUser();
  const { stats, recentActivity, upcomingTasks } = await getDashboardData();
  console.log("User Data:", user);

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
