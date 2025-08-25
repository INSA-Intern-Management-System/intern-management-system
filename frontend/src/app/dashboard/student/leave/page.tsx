import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import LeaveClient from "./LeaveClient";
import {
  fetchLeaves,
  fetchStatusCounts,
  createLeave,
  deleteLeave,
} from "@/app/services/leaveService";
import { CreateLeaveRequest } from "@/types/entities";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId) };
}

export default async function LeavesPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    size?: string;
    search?: string;
    status?: string;
    type?: string;
  };
}) {
  const { userId } = await getUser();
  const searchParamsAwaited = await searchParams;
  const page = parseInt(searchParamsAwaited.page || "0");
  const rawSize = searchParamsAwaited.size;
  let size = parseInt(rawSize || "10", 10);
  if (isNaN(size) || size < 1) size = 10;
  const search = searchParamsAwaited.search || "";
  const status = searchParamsAwaited.status || "";
  const type = searchParamsAwaited.type || "";

  // Fetch leaves with search and filter params
  const [leavesData, statusCountsData] = await Promise.all([
    fetchLeaves(
      page,
      size,
      search || undefined,
      status || undefined,
      type || undefined
    ),
    fetchStatusCounts(),
  ]);

  const handleCreateLeave = async (leaveData: CreateLeaveRequest) => {
    "use server";
    try {
      const leave = await createLeave(leaveData);
      return { success: true, data: leave };
    } catch (error: any) {
      console.error("Server action error:", error);
      return {
        success: false,
        error: error.message || "Failed to create leave request",
      };
    }
  };

  const handleDeleteLeave = async (leaveId: number) => {
    "use server";
    try {
      await deleteLeave(leaveId);
      return { success: true };
    } catch (error: any) {
      console.error("Server action error:", error);
      return {
        success: false,
        error: error.message || "Failed to delete leave request",
      };
    }
  };

  return (
    <DashboardLayout requiredRole="student">
      <LeaveClient
        initialLeaves={leavesData.content}
        pagination={{
          currentPage: leavesData.pageable.pageNumber,
          totalPages: leavesData.totalPages,
          totalItems: leavesData.totalElements,
          pageSize: leavesData.pageable.pageSize,
        }}
        statusCounts={statusCountsData}
        onCreateLeave={handleCreateLeave}
        onDeleteLeave={handleDeleteLeave}
        initialSearch={search}
        initialStatus={status}
        initialType={type}
      />
    </DashboardLayout>
  );
}
