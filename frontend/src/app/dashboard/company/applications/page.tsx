import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import ApplicationsClient from "./ApplicationsClient";
import {
  fetchAllApplications,
  updateApplicationStatus,
} from "@/app/services/applicationService";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId), accessToken };
}

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

  // Fetch all applications for client-side filtering and pagination
  const allApplications = await fetchAllApplications();

  // Calculate stats
  let statsData: ApplicationStats;
  try {
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
      console.log("Updated application:", updatedApplication);
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

  return (
    <DashboardLayout requiredRole="company">
      <ApplicationsClient
        allApplications={allApplications}
        initialStats={statsData}
        initialSearch={search}
        initialStatus={searchParamsAwaited.status || "all"}
        initialPosition={searchParamsAwaited.position || "all"}
        initialUniversity={searchParamsAwaited.university || "all"}
        onUpdateStatus={handleUpdateStatus}
        onExportApplications={handleExportApplications}
      />
    </DashboardLayout>
  );
}
