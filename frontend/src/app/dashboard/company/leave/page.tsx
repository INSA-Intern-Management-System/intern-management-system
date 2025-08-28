// app/company/leave/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import CompanyLeavePageClient from "./CompanyLeavePageClient";
import {
  fetchLeaves,
  searchLeaves,
  filterLeaves,
  fetchStatusCounts,
  updateLeaveStatus,
} from "@/app/services/leaveService";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId), accessToken };
}

export default async function CompanyLeavePage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    type?: string;
  };
}) {
  const { userId } = await getUser();

  const searchParamsAwaited = await searchParams;
  const page = parseInt(searchParamsAwaited.page || "1") - 1;
  const pageSize = 3;
  const search = searchParamsAwaited.search || "";
  const status = searchParamsAwaited.status || "all";
  const type = searchParamsAwaited.type || "all";

  let leaveResponse;
  try {
    // Use separate endpoints based on the parameters
    if (search) {
      leaveResponse = await searchLeaves(search, page, pageSize);
    } else if (status !== "all" || type !== "all") {
      // Only pass non-"all" values to the filter
      const filterStatus = status !== "all" ? status.toUpperCase() : undefined;
      const filterType = type !== "all" ? type : undefined;
      leaveResponse = await filterLeaves(
        filterStatus,
        filterType,
        page,
        pageSize
      );
    } else {
      leaveResponse = await fetchLeaves(page, pageSize);
    }
  } catch (error: any) {
    console.error("Failed to fetch leaves:", error);
    if (error.message === "Unauthorized access. Please log in again.") {
      redirect("/login");
    }
    leaveResponse = {
      content: [],
      pageable: {
        pageNumber: 0,
        pageSize: pageSize,
        sort: { sorted: false, empty: true, unsorted: true },
        offset: 0,
        paged: true,
        unpaged: false,
      },
      last: true,
      totalPages: 0,
      totalElements: 0,
      size: pageSize,
      number: 0,
      sort: { sorted: false, empty: true, unsorted: true },
      first: true,
      numberOfElements: 0,
      empty: true,
    };
  }

  let statusCounts;
  try {
    statusCounts = await fetchStatusCounts();
  } catch (error: any) {
    console.error("Failed to fetch status counts:", error);
    statusCounts = {
      total: 0,
      approved: 0,
      rejected: 0,
      pending: 0,
    };
  }

  // Server action for updating leave status
  const handleUpdateLeaveStatus = async (
    leaveId: number,
    newStatus: "APPROVED" | "REJECTED",
    rejectionReason?: string
  ) => {
    "use server";
    try {
      await updateLeaveStatus(leaveId, newStatus, rejectionReason);

      // Revalidate the page to show updated data
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/company/leave");

      return { success: true };
    } catch (error: any) {
      console.error("handleUpdateLeaveStatus error:", error);
      return {
        success: false,
        error: error.message || "Failed to update leave status",
      };
    }
  };

  // Server action for fetching data with proper endpoint selection
  const handleFetchData = async (
    page: number,
    size: number,
    search: string,
    status: string,
    type: string
  ) => {
    "use server";
    try {
      let data;

      if (search) {
        data = await searchLeaves(search, page, size);
      } else if (status !== "all" || type !== "all") {
        const filterStatus =
          status !== "all" ? status.toUpperCase() : undefined;
        const filterType = type !== "all" ? type : undefined;
        data = await filterLeaves(filterStatus, filterType, page, size);
      } else {
        data = await fetchLeaves(page, size);
      }

      return {
        leaves: data.content,
        pagination: {
          currentPage: data.number + 1,
          totalPages: data.totalPages,
          totalItems: data.totalElements,
          pageSize: size,
        },
      };
    } catch (error: any) {
      console.error("handleFetchData error:", error);
      return {
        leaves: [],
        pagination: {
          currentPage: 0,
          totalPages: 0,
          totalItems: 0,
          pageSize: size,
        },
        error: error.message || "Failed to fetch leaves",
      };
    }
  };

  return (
    <DashboardLayout requiredRole="company">
      <CompanyLeavePageClient
        initialLeaveRequests={leaveResponse.content}
        initialTotalPages={leaveResponse.totalPages}
        initialCurrentPage={page + 1}
        statusCounts={statusCounts}
        searchParams={{ search, status, type }}
        onUpdateLeaveStatus={handleUpdateLeaveStatus}
        onFetchData={handleFetchData}
      />
    </DashboardLayout>
  );
}
