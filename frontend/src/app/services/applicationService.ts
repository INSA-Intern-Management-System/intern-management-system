import { applicationApi } from "@/api/axios";
import { cookies } from "next/headers";

export interface Applicant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  institution: string | null;
  fieldOfStudy: string | null;
  gender: string | null;
  duration: string | null;
  linkedInUrl: string | null;
  githubUrl: string | null;
  cvUrl: string | null;
  createdAt: string;
}

export interface Application {
  id: number;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
  applicant: Applicant;
}

export interface ApplicationsResponse {
  content: Application[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageable?: {
    pageNumber: number;
    pageSize: number;
    sort: any[];
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last?: boolean;
  size?: number;
  sort?: any[];
  first?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}

// Get access token helper
const getAccessToken = async (): Promise<string> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }
  return accessToken;
};

// Format application data consistently
const formatApplication = (app: any): Application => ({
  ...app,
  status: (app.status.charAt(0).toUpperCase() +
    app.status.slice(1).toLowerCase()) as "Pending" | "Accepted" | "Rejected",
  applicant: {
    ...app.applicant,
    firstName: app.applicant.firstName
      ? app.applicant.firstName.charAt(0).toUpperCase() +
        app.applicant.firstName.slice(1).toLowerCase()
      : "",
    lastName: app.applicant.lastName
      ? app.applicant.lastName.charAt(0).toUpperCase() +
        app.applicant.lastName.slice(1).toLowerCase()
      : "",
  },
});

export const fetchApplications = async (
  page: number = 0,
  size: number = 10,
  search?: string,
  status?: string,
  position?: string,
  university?: string
): Promise<ApplicationsResponse> => {
  const accessToken = await getAccessToken();


  try {
    let url = "/applications/all";
    const params: Record<string, string | number> = { page, size };

    // Handle search endpoint
    if (search) {
      url = "/applications/search";
      params.query = search;
      if (status && status !== "all") params.status = status;
      if (position && position !== "all") params.position = position;
      if (university && university !== "all") params.university = university;
    }
    // Handle individual filter endpoints
    else if (status && status !== "all") {
      url = "/applications/filter/status";
      params.status = status;
    }
    else if (position && position !== "all") {
      url = "/applications/filter/position";
      params.position = position;
    }
    else if (university && university !== "all") {
      url = "/applications/filter/university";
      params.university = university;
    }

    const response = await applicationApi.get(url, {
      params,
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });

    // Handle different response structures
    let content: any[] = [];
    let totalPages = 1;
    let totalElements = 0;
    let currentPage = page;

    if (Array.isArray(response.data)) {
      // For filter endpoints that return arrays directly
      content = response.data;
      totalElements = response.data.length;
      totalPages = Math.ceil(totalElements / size);
    } else if (response.data && Array.isArray(response.data.content)) {
      // For paginated responses
      content = response.data.content;
      totalPages = response.data.totalPages || 1;
      totalElements = response.data.totalElements || content.length;
      currentPage = response.data.pageable?.pageNumber || page;
    } else if (response.data && response.data.currentPage !== undefined) {
      // For search response structure
      content = response.data.content || [];
      totalPages = response.data.totalPages || 1;
      totalElements = response.data.totalElements || content.length;
      currentPage = response.data.currentPage || page;
    }

    return {
      content: content.map(formatApplication),
      totalPages,
      totalElements,
      currentPage,
      pageable: {
        pageNumber: currentPage,
        pageSize: size,
        sort: [],
        offset: currentPage * size,
        paged: true,
        unpaged: false,
      },
      last: currentPage >= totalPages - 1,
      first: currentPage === 0,
      numberOfElements: content.length,
      empty: content.length === 0,
    };
  } catch (error: any) {
    console.error("Failed to fetch applications:", error);
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      currentPage: page,
      pageable: {
        pageNumber: page,
        pageSize: size,
        sort: [],
        offset: page * size,
        paged: true,
        unpaged: false,
      },
      last: true,
      first: true,
      numberOfElements: 0,
      empty: true,
    };
  }
};

export const updateApplicationStatus = async (
  applicationId: number,
  status: "Accepted" | "Rejected"
): Promise<Application> => {
  const accessToken = await getAccessToken();

  try {
    const response = await applicationApi.put(
      `/applications/${applicationId}/status?status=${status}`,
      {},
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );

    if (response.status !== 200) {
      throw new Error(`Failed to update status: ${response.statusText}`);
    }

    // Refetch the updated application to get complete data
    const updatedApp = await fetchApplicationById(applicationId);
    if (!updatedApp) {
      throw new Error("Failed to fetch updated application");
    }

    return formatApplication(updatedApp);
  } catch (error: any) {
    console.error("Failed to update application status:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to update application status"
    );
  }
};

export const fetchApplicationById = async (
  applicationId: number
): Promise<Application | null> => {
  const accessToken = await getAccessToken();

  try {
    const response = await applicationApi.get(
      `/applications/${applicationId}`,
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return formatApplication(response.data);
  } catch (error: any) {
    console.error(`Failed to fetch application with id ${applicationId}:`, error);
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch application"
    );
  }
};

export const fetchAllApplications = async (
  search?: string,
  status?: string,
  position?: string,
  university?: string
): Promise<Application[]> => {
  const accessToken = await getAccessToken();

  try {
    let allApps: Application[] = [];
    let page = 0;
    const size = 1000;
    let hasMore = true;

    while (hasMore) {
      let url = "/applications/all";
      const params: Record<string, string | number> = { page, size };

      if (search) {
        url = "/applications/search";
        params.query = search;
        if (status && status !== "all") params.status = status;
        if (position && position !== "all") params.position = position;
        if (university && university !== "all") params.university = university;
      }
      else if (status && status !== "all") {
        url = "/applications/filter/status";
        params.status = status;
      }
      else if (position && position !== "all") {
        url = "/applications/filter/position";
        params.position = position;
      }
      else if (university && university !== "all") {
        url = "/applications/filter/university";
        params.university = university;
      }

      const response = await applicationApi.get(url, {
        params,
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      });

      let content: any[] = [];
      
      if (Array.isArray(response.data)) {
        content = response.data;
        hasMore = false; // Filter endpoints return all data at once
      } else if (response.data && Array.isArray(response.data.content)) {
        content = response.data.content;
        hasMore = !response.data.last && page < (response.data.totalPages || 1) - 1;
      } else if (response.data && response.data.currentPage !== undefined) {
        content = response.data.content || [];
        hasMore = !response.data.last && page < (response.data.totalPages || 1) - 1;
      }

      allApps = [...allApps, ...content.map(formatApplication)];
      page++;

      // Break if we've fetched all pages or if it's a filter endpoint that returns all data
      if (!hasMore || Array.isArray(response.data)) {
        break;
      }
    }

    return allApps;
  } catch (error: any) {
    console.error("Failed to fetch all applications:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch all applications"
    );
  }
};

// Individual filter functions for more specific use cases
export const searchApplications = async (
  query: string,
  page: number = 0,
  size: number = 20
): Promise<ApplicationsResponse> => {
  const accessToken = await getAccessToken();

  try {
    const response = await applicationApi.get(
      "/applications/search",
      {
        params: { query, page, size },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );

    const data = response.data;
    return {
      content: (data.content || []).map(formatApplication),
      totalPages: data.totalPages || 1,
      totalElements: data.totalElements || (data.content?.length || 0),
      currentPage: data.currentPage || page,
    };
  } catch (error: any) {
    console.error("Failed to search applications:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to search applications"
    );
  }
};

export const filterApplicationsByStatus = async (
  status: string,
  page: number = 0,
  size: number = 20
): Promise<Application[]> => {
  const accessToken = await getAccessToken();

  try {
    const response = await applicationApi.get(
      "/applications/filter/status",
      {
        params: { status, page, size },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );

    // Status filter returns array directly
    return (Array.isArray(response.data) ? response.data : []).map(formatApplication);
  } catch (error: any) {
    console.error("Failed to filter applications by status:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to filter applications by status"
    );
  }
};

export const filterApplicationsByPosition = async (
  position: string,
  page: number = 0,
  size: number = 20
): Promise<Application[]> => {
  const accessToken = await getAccessToken();

  try {
    const response = await applicationApi.get(
      "/applications/filter/position",
      {
        params: { position, page, size },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );

    // Position filter returns array directly
    return (Array.isArray(response.data) ? response.data : []).map(formatApplication);
  } catch (error: any) {
    console.error("Failed to filter applications by position:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to filter applications by position"
    );
  }
};

export const filterApplicationsByUniversity = async (
  university: string,
  page: number = 0,
  size: number = 20
): Promise<Application[]> => {
  const accessToken = await getAccessToken();

  try {
    const response = await applicationApi.get(
      "/applications/filter/university",
      {
        params: { university, page, size },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );

    // University filter returns array directly
    return (Array.isArray(response.data) ? response.data : []).map(formatApplication);
  } catch (error: any) {
    console.error("Failed to filter applications by university:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to filter applications by university"
    );
  }
};