import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import ApplicationsClient from "./ApplicationsClient";
import {
  fetchUniversityApplications,
  createApplication,
  batchImportApplications,
  CreateApplicationRequest,
} from "@/app/services/applicationService";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId) };
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
  };
}) {
  const { userId } = await getUser();
  const searchParamsAwaited = await searchParams;
  const page = parseInt(searchParamsAwaited.page || "0");
  const search = searchParamsAwaited.search || "";
  const status = searchParamsAwaited.status || "";

  // Fetch university applications with search and filter params
  const applicationsData = await fetchUniversityApplications(
    page,
    10 // Page size
  );
  console.log("Fetched applications data:", applicationsData);

  const handleCreateApplication = async (
    applicationData: CreateApplicationRequest
  ) => {
    "use server";
    try {
      const application = await createApplication(applicationData);
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/university/applications");
      return { success: true, data: application };
    } catch (error: any) {
      console.error("Server action error:", error);
      return {
        success: false,
        error: error.message || "Failed to create application",
      };
    }
  };

  const handleBatchImport = async (file: File) => {
    "use server";
    try {
      const applicants = await batchImportApplications(file);
      return { success: true, data: applicants };
    } catch (error: any) {
      console.error("Server action error:", error);
      return {
        success: false,
        error: error.message || "Failed to import applications",
      };
    }
  };

  return (
    <DashboardLayout requiredRole="university">
      <ApplicationsClient
        initialApplications={applicationsData.content}
        pagination={{
          currentPage: applicationsData.currentPage || 0,
          totalPages: applicationsData.totalPages || 1,
          totalItems: applicationsData.totalElements || 0,
          pageSize: 10,
        }}
        onCreateApplication={handleCreateApplication}
        onBatchImport={handleBatchImport}
        initialSearch={search}
        initialStatus={status}
      />
    </DashboardLayout>
  );
}
