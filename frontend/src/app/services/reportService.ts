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
    console.log(url, params);
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

export interface ReportReview {
  id: number;
  reportId: number;
  feedback: string;
  rating: number;
  createdAt: string;
}

export interface ProjectResponse {
  projectID: number;
  projectName: string;
  projectDescription: string;
}

export interface ReportStats {
  totalReports: number;
  pendingReports: number;
  reviewedReports: number;
  averageRating: number;
}

export interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface CreateReviewRequest {
  reportId: number;
  feedback: string;
  rating: number;
}

// Get access token helper
const getAccessToken = async (): Promise<string> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }
  return accessToken;
};

// Search reports
export const searchReports = async (
  keyword: string,
  page: number = 0,
  size: number = 20
): Promise<PagedResponse<Report>> => {
  const accessToken = await getAccessToken();

  try {
    const response = await reportApi.get<PagedResponse<Report>>(
      "/reports/my/search",
      {
        params: { keyword, page, size },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to search reports:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to search reports"
    );
  }
};

// Filter reports
export const filterReports = async (
  status: string,
  period: string,
  page: number = 0,
  size: number = 20
): Promise<PagedResponse<Report>> => {
  const accessToken = await getAccessToken();

  try {
    const response = await reportApi.get<PagedResponse<Report>>(
      "/reports/my/filter",
      {
        params: { status, period, page, size },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to filter reports:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to filter reports"
    );
  }
};

// Get report statistics
export const getReportStats = async (): Promise<ReportStats> => {
  const accessToken = await getAccessToken();

  try {
    const response = await reportApi.get<ReportStats>("/reports/my/stats", {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch report stats:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch report stats"
    );
  }
};

// Create review
export const createReview = async (
  data: CreateReviewRequest
): Promise<Report> => {
  const accessToken = await getAccessToken();

  try {
    const response = await reportApi.post<Report>(
      "/reports/manager/review",
      data,
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to create review:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to create review");
  }
};
