import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import CompanyReportsClient from "./CompanyReportsClient";
import {
  fetchReports,
  searchReports,
  filterReports,
  getReportStats,
  createReview,
  ReportStats,
} from "@/app/services/reportService";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId), accessToken };
}

export default async function CompanyReportsPage({
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
  const status = searchParamsAwaited.status || "all";
  const period = searchParamsAwaited.period || "all";

  let reportsData;
  try {
    if (search) {
      reportsData = await searchReports(search, page, 10);
    } else if (status !== "all" || period !== "all") {
      reportsData = await filterReports(status, period, page, 10);
    } else {
      reportsData = await fetchReports(page, 10);
    }
  } catch (error: any) {
    console.error("Failed to fetch reports:", error);
    if (error.message === "Unauthorized access. Please log in again.") {
      redirect("/login");
    }
    reportsData = {
      content: [],
      number: 0,
      totalPages: 0,
      totalElements: 0,
      size: 10,
    };
  }

  let statsData: ReportStats;
  try {
    statsData = await getReportStats();
  } catch (error: any) {
    console.error("Failed to fetch report stats:", error);
    statsData = {
      totalReports: 0,
      pendingReports: 0,
      reviewedReports: 0,
      averageRating: 0,
    };
  }

  const handleCreateReview = async (data: {
    reportId: number;
    feedback: string;
    rating: number;
  }) => {
    "use server";
    try {
      const updatedReport = await createReview(data);
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/company/reports");
      return { success: true, report: updatedReport };
    } catch (error: any) {
      console.error("handleCreateReview error:", error);
      return {
        success: false,
        error: error.message || "Failed to create review",
      };
    }
  };

  const handleFetchData = async (
    page: number,
    size: number,
    search: string,
    status: string,
    period: string
  ) => {
    "use server";
    try {
      let data;
      if (search) {
        data = await searchReports(search, page, size);
      } else if (status !== "all" || period !== "all") {
        data = await filterReports(status, period, page, size);
      } else {
        data = await fetchReports(page, size);
      }

      return {
        reports: data.content,
        pagination: {
          currentPage: data.number,
          totalPages: data.totalPages,
          totalItems: data.totalElements,
          pageSize: size,
        },
      };
    } catch (error: any) {
      console.error("handleFetchData error:", error);
      return {
        reports: [],
        pagination: {
          currentPage: 0,
          totalPages: 0,
          totalItems: 0,
          pageSize: size,
        },
        error: error.message || "Failed to fetch reports",
      };
    }
  };

  return (
    <DashboardLayout requiredRole="company">
      <CompanyReportsClient
        initialReports={reportsData.content}
        initialStats={statsData}
        pagination={{
          currentPage: reportsData.number,
          totalPages: reportsData.totalPages,
          totalItems: reportsData.totalElements,
          pageSize: reportsData.size,
        }}
        onCreateReview={handleCreateReview}
        onFetchData={handleFetchData}
      />
    </DashboardLayout>
  );
}
