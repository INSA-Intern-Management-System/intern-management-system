import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import PlansClient from "./PlansClient";
import {
  createSchedule,
  deleteSchedule,
  fetchSchedules,
  updateScheduleStatus,
} from "@/app/services/scheduleService"; // ✅ updated import
import { Task } from "@/types/entities";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId };
}

export default async function PlansPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const { userId } = await getUser();
  const searchParamsAwiaited = await searchParams;
  const page = parseInt((await searchParamsAwiaited.page) || "0");

  // ✅ Fetch dashboard data (milestones + tasks)
  const dashboardData = await fetchSchedules(page, 10);

  const handleCreateTask = async (
    scheduleData: Omit<Task, "scheduleId" | "createdAt">
  ) => {
    "use server";
    try {
      return await createSchedule(scheduleData);
    } catch (error) {
      throw new Error("Failed to create task");
    }
  };

  const handleUpdateStatus = async (
    scheduleId: number,
    status: "PENDING" | "UPCOMING" | "COMPLETED"
  ) => {
    "use server";
    try {
      return await updateScheduleStatus(scheduleId, status);
    } catch (error) {
      throw new Error("Failed to update task status");
    }
  };

  const handleDeleteTask = async (scheduleId: number) => {
    "use server";
    try {
      await deleteSchedule(scheduleId);
    } catch (error) {
      throw new Error("Failed to delete task");
    }
  };

  return (
    <DashboardLayout requiredRole="STUDENT">
      <PlansClient
        initialMilestones={dashboardData.milestones}
        initialTasks={dashboardData.tasks.content}
        pagination={{
          currentPage: dashboardData.tasks.pageable.pageNumber,
          totalPages: dashboardData.tasks.totalPages,
          totalItems: dashboardData.tasks.totalElements,
          pageSize: dashboardData.tasks.pageable.pageSize,
        }}
        userId={Number(userId)}
        onCreateTask={handleCreateTask}
        onUpdateStatus={handleUpdateStatus}
        onDeleteTask={handleDeleteTask}
      />
    </DashboardLayout>
  );
}
