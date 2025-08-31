import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import InternClient from "./InternClient";
import {
  fetchInterns,
  searchInterns,
  filterInternsByUniversity,
  filterInternsByStatus,
  InternsResponse,
  PagedInternResponse,
} from "@/app/services/internService";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId), accessToken };
}

export default async function CompanyInternsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    institution?: string;
    fieldOfStudy?: string;
  };
}) {
  const { userId } = await getUser();

  const searchParamsAwaited = await searchParams;
  const page = parseInt(searchParamsAwaited.page || "0");
  const search = searchParamsAwaited.search || "";
  const status = searchParamsAwaited.status || "all";
  const institution = searchParamsAwaited.institution || "all";
  const fieldOfStudy = searchParamsAwaited.fieldOfStudy || "all";

  let internsData: any[] = [];
  let totalInterns = 0;
  let totalPages = 0;
  let currentPage = 0;

  try {
    console.log("Fetching interns with params:", { page, search, status, institution, fieldOfStudy });
    
    if (search) {
      const response: PagedInternResponse = await searchInterns(search, page, 10);
      console.log("Search response:", response);
      internsData = response.content || [];
      totalInterns = response.totalElements || 0;
      totalPages = response.totalPages || 0;
      currentPage = response.number || 0;
    } else if (status !== "all") {
      const response: PagedInternResponse = await filterInternsByStatus(status, page, 10);
      console.log("Status filter response:", response);
      internsData = response.content || [];
      totalInterns = response.totalElements || 0;
      totalPages = response.totalPages || 0;
      currentPage = response.number || 0;
    } else if (institution !== "all") {
      const response: PagedInternResponse = await filterInternsByUniversity(institution, page, 10);
      console.log("Institution filter response:", response);
      internsData = response.content || [];
      totalInterns = response.totalElements || 0;
      totalPages = response.totalPages || 0;
      currentPage = response.number || 0;
    } else {
      const response: InternsResponse = await fetchInterns(page, 10);
      console.log("Fetch interns response:", response);
      internsData = response.interns || [];
      totalInterns = response.totalInterns || 0;
      totalPages = response.totalPages || 0;
      currentPage = response.currentPage || 0;
    }

    console.log("Processed data:", { 
      internsCount: internsData.length, 
      totalInterns, 
      totalPages,
      currentPage
    });

  } catch (error: any) {
    console.error("Failed to fetch interns:", error);
    if (error.message === "Unauthorized access. Please log in again.") {
      redirect("/login");
    }
    internsData = [];
    totalInterns = 0;
    totalPages = 0;
    currentPage = 0;
  }

  return (
    <DashboardLayout requiredRole="company">
      <InternClient
        initialInterns={internsData}
        pagination={{
          currentPage: currentPage,
          totalPages: totalPages,
          totalItems: totalInterns,
          pageSize: 3,
        }}
      />
    </DashboardLayout>
  );
}