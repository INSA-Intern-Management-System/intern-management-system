import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import PlansClient from "./PlansClient";
import { fetchSchedules } from "@/app/services/scheduleService";
import { fetchTasks } from "@/app/services/taskService";

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
  const page = parseInt(searchParams.page || "0");

  // Fetch both schedules and tasks in parallel
  const [schedulesData, tasks] = await Promise.all([
    fetchSchedules(page, 10),
    fetchTasks(),
  ]);

  return (
    <DashboardLayout requiredRole="STUDENT">
      <PlansClient
        initialPlans={schedulesData.content}
        initialTasks={tasks}
        pagination={{
          currentPage: schedulesData.pageable.pageNumber,
          totalPages: schedulesData.totalPages,
          totalItems: schedulesData.totalElements,
          pageSize: schedulesData.pageable.pageSize,
        }}
      />
    </DashboardLayout>
  );
}
