import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import ApplicationsClient from "./ApplicationsClient";
import {
  fetchApplications,
  fetchAllApplications,
  updateApplicationStatus,
  ApplicationsResponse,
} from "@/app/services/applicationService";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId), accessToken };
}

// Define stats interface since getApplicationStats doesn't exist in your service
interface ApplicationStats {
  totalItems: number;
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    position?: string;
    university?: string;
  };
}) {
  const { userId } = await getUser();

  const searchParamsAwaited = await searchParams;
  const page = Math.max(0, parseInt(searchParamsAwaited.page || "0", 10));
  const search = searchParamsAwaited.search || "";
  const status =
    searchParamsAwaited.status === "all"
      ? undefined
      : searchParamsAwaited.status;
  const position =
    searchParamsAwaited.position === "all"
      ? undefined
      : searchParamsAwaited.position;
  const university =
    searchParamsAwaited.university === "all"
      ? undefined
      : searchParamsAwaited.university;

  // Fetch all applications when any filter is applied, otherwise use paginated fetch
  let applicationsData: ApplicationsResponse;
  const isFiltering =
    !!search ||
    (status && status !== "all") ||
    (position && position !== "all") ||
    (university && university !== "all");

  if (isFiltering) {
    // Show all filtered applications (no pagination)
    const filteredApps = await fetchAllApplications(
      search || undefined,
      status,
      position,
      university
    );
    applicationsData = {
      content: filteredApps,
      totalPages: 1,
      totalElements: filteredApps.length,
      currentPage: 0,
    };
  } else {
    // Default: paginated applications
    applicationsData = await fetchApplications(
      page,
      3, // Set page size to 3 for 3 cards per page
      search || undefined,
      status,
      position,
      university
    );
  }

  // Calculate stats manually since getApplicationStats doesn't exist in your service
  let statsData: ApplicationStats;
  try {
    // Fetch all applications to calculate stats
    const allApplications = await fetchAllApplications();
    statsData = {
      totalItems: allApplications.length,
      pendingCount: allApplications.filter((app) => app.status === "Pending")
        .length,
      acceptedCount: allApplications.filter((app) => app.status === "Accepted")
        .length,
      rejectedCount: allApplications.filter((app) => app.status === "Rejected")
        .length,
    };
  } catch (error: any) {
    console.error("Failed to calculate application stats:", error);
    statsData = {
      totalItems: 0,
      pendingCount: 0,
      acceptedCount: 0,
      rejectedCount: 0,
    };
  }

  const handleUpdateStatus = async (
    applicationId: number,
    status: "Accepted" | "Rejected"
  ) => {
    "use server";
    try {
      const updatedApplication = await updateApplicationStatus(
        applicationId,
        status
      );
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/company/applications");
      return { success: true, data: updatedApplication };
    } catch (error: any) {
      console.error("Server action error:", error);
      return {
        success: false,
        error: error.message || "Failed to update application status",
      };
    }
  };

  const handleExportApplications = async (
    search?: string,
    status?: string,
    position?: string,
    university?: string
  ) => {
    "use server";
    try {
      const exportApps = await fetchAllApplications(
        search || undefined,
        status !== "all" ? status : undefined,
        position !== "all" ? position : undefined,
        university !== "all" ? university : undefined
      );
      return { success: true, data: exportApps };
    } catch (error: any) {
      console.error("Failed to export applications:", error);
      return {
        success: false,
        error: error.message || "Failed to export applications",
      };
    }
  };

  const handleFetchData = async (
    page: number,
    size: number,
    search: string,
    status: string,
    position: string,
    university: string
  ) => {
    "use server";
    try {
      const data = await fetchApplications(
        page,
        size,
        search || undefined,
        status !== "all" ? status : undefined,
        position !== "all" ? position : undefined,
        university !== "all" ? university : undefined
      );

      return {
        applications: data.content,
        pagination: {
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          totalItems: data.totalElements,
          pageSize: size,
        },
      };
    } catch (error: any) {
      console.error("handleFetchData error:", error);
      return {
        applications: [],
        pagination: {
          currentPage: 0,
          totalPages: 0,
          totalItems: 0,
          pageSize: size,
        },
        error: error.message || "Failed to fetch applications",
      };
    }
  };

  return (
    <DashboardLayout requiredRole="company">
      <ApplicationsClient
        initialApplications={applicationsData.content}
        initialStats={statsData}
        pagination={{
          currentPage: applicationsData.currentPage,
          totalPages: applicationsData.totalPages,
          totalItems: applicationsData.totalElements,
          pageSize: 3,
        }}
        initialSearch={search}
        initialStatus={searchParamsAwaited.status || "all"}
        initialPosition={searchParamsAwaited.position || "all"}
        initialUniversity={searchParamsAwaited.university || "all"}
        onUpdateStatus={handleUpdateStatus}
        onExportApplications={handleExportApplications}
        onFetchData={handleFetchData}
      />
    </DashboardLayout>
  );
}
