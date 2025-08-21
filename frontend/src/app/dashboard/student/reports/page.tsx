import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import ReportsClient from "./ReportsClient";
import { fetchReports, createReport } from "@/app/services/reportService";
import { Report } from "@/types/entities";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId) };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    period?: string;
  };
}) {
  const { userId } = await getUser();
  const searchParamsAwaited = await searchParams;
  const page = parseInt(searchParamsAwaited.page || "0");
  const search = searchParamsAwaited.search || "";

  // Validate and transform status
  const status =
    searchParamsAwaited.status === "GIVEN" ||
    searchParamsAwaited.status === "PENDING"
      ? searchParamsAwaited.status
      : undefined;

  // Validate and transform period
  const period =
    searchParamsAwaited.period === "week" ||
    searchParamsAwaited.period === "month"
      ? searchParamsAwaited.period
      : undefined;

  // Fetch reports with search and filter params
  const reportsData = await fetchReports(
    page,
    3, // Reasonable page size
    search || undefined,
    status,
    period
  );

  const handleCreateReport = async (
    reportData: Omit<
      Report,
      | "id"
      | "createdAt"
      | "review"
      | "projectResponse"
      | "internId"
      | "managerId"
      | "projectId"
    >
  ) => {
    "use server";
    try {
      const report = await createReport({ ...reportData });
      return { success: true, data: report };
    } catch (error: any) {
      console.error("Server action error:", error);
      return {
        success: false,
        error: error.message || "Failed to create report",
      };
    }
  };

  return (
    <DashboardLayout requiredRole="student">
      <ReportsClient
        initialReports={reportsData.content}
        pagination={{
          currentPage: reportsData.pageable.pageNumber,
          totalPages: reportsData.totalPages,
          totalItems: reportsData.totalElements,
          pageSize: reportsData.pageable.pageSize,
        }}
        userId={userId}
        onCreateReport={handleCreateReport}
        initialSearch={search}
        initialStatus={status}
        initialPeriod={period}
        totalSubmittedReports={reportsData.totalElements}
      />
    </DashboardLayout>
  );
}
