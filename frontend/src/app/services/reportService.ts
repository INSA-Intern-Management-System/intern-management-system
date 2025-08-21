import { reportApi } from "@/api/axios";
import { Report, ReportsResponse } from "@/types/entities";
import { cookies } from "next/headers";

export const fetchReports = async (
  page: number = 0,
  size: number = 10,
  search?: string,
  status?: "PENDING" | "GIVEN",
  period?: "week" | "month"
): Promise<ReportsResponse> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    let url = "/reports/my";
    const params: Record<string, string | number> = { page, size };

    // Handle search endpoint
    if (search) {
      url = "/reports/my/search";
      params.keyword = search;
    }
    // Handle filter endpoint (status and/or period)
    else if (status || period) {
      url = "/reports/my/filter";
      if (status) params.status = status;
      if (period) params.period = period;
    }

    const response = await reportApi.get<ReportsResponse>(url, {
      params,
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    // Return empty response instead of mock data to avoid confusion
    return {
      content: [],
      pageable: {
        pageNumber: 0,
        pageSize: size,
        sort: { sorted: false, empty: true, unsorted: true },
        offset: 0,
        paged: true,
        unpaged: false,
      },
      last: true,
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: 0,
      sort: { sorted: false, empty: true, unsorted: true },
      first: true,
      numberOfElements: 0,
      empty: true,
    };
  }
};

export const createReport = async (
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
): Promise<Report> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }
  try {
    const response = await reportApi.post<Report>("/reports", reportData, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create report:", error);
    throw error;
  }
};
