import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { User } from "@/types/entities";
import { api } from "@/api/axios";
import DashboardLayout from "@/app/layout/dashboard-layout";
import CompanyDashboardClient from "./CompanyDashboardClient";
import {
  fetchCompanyDashboardV1,
  fetchCompanyDashboardV2,
  RecentActivity,
  Task,
} from "@/app/services/companyDashboardService";

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

  if (!accessToken) {
    redirect("/login");
  }

  try {
    const [dashboardV1, dashboardV2] = await Promise.all([
      fetchCompanyDashboardV1(),
      fetchCompanyDashboardV2(),
    ]);

    // Transform the API data to match the expected format
    const stats = {
      applications: dashboardV1.Application,
      activeInterns: dashboardV1.ActiveIntern,
      activeProjects: dashboardV1.project,
      pendingReports: dashboardV1.report,
    };

    const recentActivity: RecentActivity[] = dashboardV1.recentActivities;

    // const upcomingTasks = [
    //   {
    //     id: 1,
    //     task: dashboardV1.tasks.tasksForApps.description,
    //     count: dashboardV1.tasks.tasksForApps.totalPending,
    //     priority:
    //       dashboardV1.tasks.tasksForApps.priority === "coming soon"
    //         ? "medium"
    //         : "high",
    //   },
    //   {
    //     id: 2,
    //     task: dashboardV1.tasks.tasksForReports.description,
    //     count: dashboardV1.tasks.tasksForReports.totalPending,
    //     priority:
    //       dashboardV1.tasks.tasksForReports.priority === "coming soon"
    //         ? "medium"
    //         : "high",
    //   },
    // ];

    const topInterns = dashboardV2.map((intern, index) => ({
      id: intern.user.id,
      name: `${intern.user.firstName} ${intern.user.lastName}`,
      position: intern.user.fieldOfStudy || "Intern",
      progress:
        intern.milestoneStats.total > 0
          ? Math.round(
              (intern.milestoneStats.completed / intern.milestoneStats.total) *
                100
            )
          : 0,
      rating: intern.rating,
      university: intern.user.university,
    }));

    return {
      stats,
      recentActivity,
      // upcomingTasks,
      topInterns,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);

    // Fallback to mock data if API fails
    return {
      stats: {
        applications: 25,
        activeInterns: 14,
        activeProjects: 5,
        pendingReports: 10,
      },
      recentActivity: [
        {
          id: 52,
          userId: 3,
          title: "Project created",
          description: "Project Duressa created successfully.",
          createdAt: "2025-08-14T22:50:10.005735",
        },
        {
          id: 48,
          userId: 3,
          title: "ADD_TEAM_MEMBER",
          description:
            "Member with ID 3 added to team 'Backend Team' with role 'Developer'.",
          createdAt: "2025-08-12T11:17:41.051915",
        },
      ],
      //   upcomingTasks: [
      //     {
      //       id: 1,
      //       task: "Review pending applications",
      //       count: 10,
      //       priority: "medium",
      //     },
      //     {
      //       id: 2,
      //       task: "Evaluate weekly reports",
      //       count: 10,
      //       priority: "medium",
      //     },
      //   ],
      topInterns: [
        {
          id: 7,
          name: "John Doe",
          position: "Computer Science",
          progress: 0, // No milestones completed
          rating: 4.0,
          university: "ASTU",
        },
      ],
    };
  }
}

export default async function CompanyDashboardPage() {
  const user = await getUser();
  const { stats, recentActivity, topInterns } = await getDashboardData();

  return (
    <DashboardLayout requiredRole="company">
      <CompanyDashboardClient
        user={user}
        stats={stats}
        recentActivity={recentActivity}
        // upcomingTasks={upcomingTasks}
        topInterns={topInterns}
      />
    </DashboardLayout>
  );
}
