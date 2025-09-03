import { api as performanceApi } from "@/api/axios";
import { cookies } from "next/headers";

export interface PerformanceUser {
  userId: number;
  fullName: string;
  supervisorName: string;
  attendance: number;
  totalReports: number;
  lastReviewFeedback: string;
  lastReviewTime: string;
  lastRating: number;
  grade: string;
  performanceLabel: string;
}

export interface PerformanceStats {
  totalReports: number;
  averageRating: number;
  score: number;
  attendance: number;
}

export interface PaginatedPerformance {
  users: PerformanceUser[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

// Get access token helper
const getAccessToken = async (): Promise<string> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }
  return accessToken;
};

// Get performance data
export const fetchPerformanceData = async (
  page: number = 0,
  size: number = 20
): Promise<PaginatedPerformance> => {
  const accessToken = await getAccessToken();

  try {
    const response = await performanceApi.get<PaginatedPerformance>(
      "/users/performance",
      {
        params: { page, size },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch performance data:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch performance data"
    );
  }
};

// Get performance stats
export const fetchPerformanceStats = async (): Promise<PerformanceStats> => {
  const accessToken = await getAccessToken();

  try {
    const response = await performanceApi.get<PerformanceStats>(
      "/users/performance/stat",
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch performance stats:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch performance stats"
    );
  }
};

// Filter performance by supervisor
export const filterPerformanceBySupervisor = async (
  supervisor: string,
  page: number = 0,
  size: number = 20
): Promise<PaginatedPerformance> => {
  const accessToken = await getAccessToken();

  console.log("Filtering performance by supervisor:", supervisor);

  try {
    const response = await performanceApi.get<PaginatedPerformance>(
      "/users/performance/filter",
      {
        params: { filter: supervisor, page, size },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to filter performance data:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to filter performance data"
    );
  }
};

// Search performance
export const searchPerformance = async (
  keyword: string,
  page: number = 0,
  size: number = 20
): Promise<PaginatedPerformance> => {
  const accessToken = await getAccessToken();

  try {
    const response = await performanceApi.get<PaginatedPerformance>(
      "/users/performance/search",
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
    console.error("Failed to search performance data:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to search performance data"
    );
  }
};

export const fetchSupervisorsList = async (): Promise<any> => {
  const accessToken = await getAccessToken();

  try {
    const response = await performanceApi.get<any>( // Use 'any' type since the response structure is complex
      "/users/supervisors", // Adjust this endpoint based on your API
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );

    // Extract supervisor id, firstName, and lastName from the response
    const supervisors = response.data.content.map((supervisor: any) => ({
      id: supervisor.id,
      firstName: supervisor.firstName,
      lastName: supervisor.lastName,
    }));

    return supervisors;
  } catch (error: any) {
    console.error("Failed to fetch supervisors list:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    // Return an empty array instead of throwing an error
    return [];
  }
};
