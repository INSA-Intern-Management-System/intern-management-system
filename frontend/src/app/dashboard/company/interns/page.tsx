import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import InternClient from "./InternClient";
import {
  fetchInterns,
  searchInterns,
  filterInternsByUniversity,
  filterInternsByStatus,
  Intern,
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

  let internsData: { intern: Intern; projects: any[] }[] = [];
  let totalInterns = 0;
  let totalPages = 0;

  try {
    if (search) {
      const response = await searchInterns(search, page, 10);
      internsData = response.content.map(intern => ({
        intern: intern,
        projects: []
      }));
      totalInterns = response.totalElements;
      totalPages = response.totalPages;
    } else if (status !== "all") {
      const response = await filterInternsByStatus(status, page, 10);
      internsData = response.content.map(intern => ({
        intern: intern,
        projects: []
      }));
      totalInterns = response.totalElements;
      totalPages = response.totalPages;
    } else if (institution !== "all") {
      const response = await filterInternsByUniversity(institution, page, 10);
      internsData = response.content.map(intern => ({
        intern: intern,
        projects: []
      }));
      totalInterns = response.totalElements;
      totalPages = response.totalPages;
    } else {
      const response = await fetchInterns(page, 10);
      internsData = response.interns;
      totalInterns = response.totalInterns;
      totalPages = response.totalPages;
    }
  } catch (error: any) {
    console.error("Failed to fetch interns:", error);
    if (error.message === "Unauthorized access. Please log in again.") {
      redirect("/login");
    }
    internsData = [];
    totalInterns = 0;
    totalPages = 0;
  }

 
  const handleFetchData = async (
    page: number,
    size: number,
    search: string,
    status: string,
    institution: string,
    fieldOfStudy: string
  ) => {
    "use server";
    try {
      let data;
      let totalElements = 0;
      let totalPages = 0;

      if (search) {
        const response = await searchInterns(search, page, size);
        data = response.content.map(intern => ({
          intern: intern,
          projects: []
        }));
        totalElements = response.totalElements;
        totalPages = response.totalPages;
      } else if (status !== "all") {
        const response = await filterInternsByStatus(status, page, size);
        data = response.content.map(intern => ({
          intern: intern,
          projects: []
        }));
        totalElements = response.totalElements;
        totalPages = response.totalPages;
      } else if (institution !== "all") {
        const response = await filterInternsByUniversity(institution, page, size);
        data = response.content.map(intern => ({
          intern: intern,
          projects: []
        }));
        totalElements = response.totalElements;
        totalPages = response.totalPages;
      } else {
        const response = await fetchInterns(page, size);
        data = response.interns;
        totalElements = response.totalInterns;
        totalPages = response.totalPages;
      }

      return {
        interns: data,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalElements,
          pageSize: size,
        },
      };
    } catch (error: any) {
      console.error("handleFetchData error:", error);
      return {
        interns: [],
        pagination: {
          currentPage: 0,
          totalPages: 0,
          totalItems: 0,
          pageSize: size,
        },
        error: error.message || "Failed to fetch interns",
      };
    }
  };

  return (
    <DashboardLayout requiredRole="company">
      <InternClient
        initialInterns={internsData}
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalInterns,
          pageSize: 10,
        }}
      />
    </DashboardLayout>
  );
}