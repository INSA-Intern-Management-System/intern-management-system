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
  status: "Pending" | "Accepted" | "Rejected" | "all";
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

export interface CreateApplicationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  institution?: string;
  fieldOfStudy?: string;
  gender?: string;
  duration?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  cvFile?: File;
}

const getAccessToken = async (): Promise<string> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }
  return accessToken;
};

const formatApplication = (app: any): Application => {
  let statusValue = app.status;

  if (typeof statusValue === "string") {
    statusValue =
      statusValue.charAt(0).toUpperCase() + statusValue.slice(1).toLowerCase();
  }

  return {
    id: app.id,
    status: statusValue as "Pending" | "Accepted" | "Rejected" | "all",
    createdAt: app.createdAt,
    applicant: {
      id: app.applicant?.id || app.id,
      firstName: app.applicant?.firstName || "",
      lastName: app.applicant?.lastName || "",
      email: app.applicant?.email || "",
      phoneNumber: app.applicant?.phoneNumber || null,
      institution: app.applicant?.institution || null,
      fieldOfStudy: app.applicant?.fieldOfStudy || null,
      gender: app.applicant?.gender || null,
      duration: app.applicant?.duration || null,
      linkedInUrl: app.applicant?.linkedInUrl || null,
      githubUrl: app.applicant?.githubUrl || null,
      cvUrl: app.applicant?.cvUrl || null,
      createdAt: app.applicant?.createdAt || app.createdAt,
    },
  };
};

export const fetchUniversityApplications = async (
  page: number = 0,
  size: number = 5,
  search?: string,
  status?: string
): Promise<ApplicationsResponse> => {
  const accessToken = await getAccessToken();

  try {
    let url: string;
    const params: Record<string, string | number> = {};

    if (search) {
      url = "/applications/search";
      params.query = search;
      params.page = page;
      params.size = size;
    } else if (status && status !== "all") {
      url = "/applications/filter/status";
      params.status = status;
    } else {
      url = "/applications/filter/for-university";
    }

    const response = await applicationApi.get(url, {
      params: Object.keys(params).length > 0 ? params : undefined,
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });

    console.log("API Response:", { url, params, data: response.data });

    let content: any[] = [];
    let totalPages = 1;
    let totalElements = 0;
    let currentPage = page;

    if (url === "/applications/search") {
      const data = response.data;
      content = data.content || [];
      totalPages = data.totalPages || 1;
      totalElements = data.totalElements || 0;
      currentPage = data.currentPage || page;
    } else if (url === "/applications/filter/status") {
      content = Array.isArray(response.data) ? response.data : [];
      totalElements = content.length;
      totalPages = Math.ceil(totalElements / size);

      const startIndex = page * size;
      const endIndex = startIndex + size;
      content = content.slice(startIndex, endIndex);
    } else {
      if (Array.isArray(response.data)) {
        content = response.data;
        totalElements = response.data.length;
        totalPages = Math.ceil(totalElements / size);

        const startIndex = page * size;
        const endIndex = startIndex + size;
        content = content.slice(startIndex, endIndex);
      } else if (response.data && Array.isArray(response.data.content)) {
        content = response.data.content;
        totalPages = response.data.totalPages || 1;
        totalElements = response.data.totalElements || content.length;
        currentPage = response.data.pageable?.pageNumber || page;
      } else if (response.data && response.data.currentPage !== undefined) {
        content = response.data.content || [];
        totalPages = response.data.totalPages || 1;
        totalElements = response.data.totalElements || content.length;
        currentPage = response.data.currentPage || page;
      } else {
        content = Array.isArray(response.data) ? response.data : [];
        totalElements = content.length;
        totalPages = Math.ceil(totalElements / size);

        const startIndex = page * size;
        const endIndex = startIndex + size;
        content = content.slice(startIndex, endIndex);
      }
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
    console.error("Failed to fetch university applications:", error);
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

export const createApplication = async (
  applicationData: CreateApplicationRequest
): Promise<Application> => {
  const accessToken = await getAccessToken();

  try {
    const formData = new FormData();

    formData.append("firstName", applicationData.firstName);
    formData.append("lastName", applicationData.lastName);
    formData.append("email", applicationData.email);

    if (applicationData.phoneNumber) {
      formData.append("phoneNumber", applicationData.phoneNumber);
    }
    if (applicationData.institution) {
      formData.append("institution", applicationData.institution);
    }
    if (applicationData.fieldOfStudy) {
      formData.append("fieldOfStudy", applicationData.fieldOfStudy);
    }
    if (applicationData.gender) {
      formData.append("gender", applicationData.gender);
    }
    if (applicationData.duration) {
      formData.append("duration", applicationData.duration);
    }
    if (applicationData.linkedInUrl) {
      formData.append("linkedInUrl", applicationData.linkedInUrl);
    }
    if (applicationData.githubUrl) {
      formData.append("githubUrl", applicationData.githubUrl);
    }
    if (applicationData.cvFile) {
      formData.append("cvFile", applicationData.cvFile);
    }

    const response = await applicationApi.post("/apply", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });

    return formatApplication(response.data);
  } catch (error: any) {
    console.error("Failed to create application:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create application"
    );
  }
};

export const batchImportApplications = async (file: File): Promise<any[]> => {
  const accessToken = await getAccessToken();

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await applicationApi.post("/application/batch", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });

    return response.data.application || [];
  } catch (error: any) {
    console.error("Failed to batch import applications:", error);
    throw new Error(
      error.response?.data?.message || "Failed to batch import applications"
    );
  }
};

export const updateApplicationStatus = async (
  applicationId: number,
  status: "Accepted" | "Rejected"
): Promise<Application> => {
  const accessToken = await getAccessToken();

  try {
    const response = await applicationApi.put(
      `/applications/${applicationId}/status`,
      {},
      {
        params: { status },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );

    return formatApplication(response.data);
  } catch (error: any) {
    console.error("Failed to update application status:", error);
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
    console.error(
      `Failed to fetch application with id ${applicationId}:`,
      error
    );
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch application"
    );
  }
};

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
  status: "Pending" | "Accepted" | "Rejected" | "all";
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


export const fetchApplications = async (
  page: number = 0,
  size: number = 5,
  query?: string,
  status?: string,
  position?: string,
  university?: string
): Promise<ApplicationsResponse> => {
  const accessToken = await getAccessToken();

  try {
    let url = "/applications/all";
    const params: Record<string, string | number> = { page, size };

    if (query) {
      url = "/applications/search";
      params.query = query;
      if (status && status !== "all") params.status = status;
      if (position && position !== "all") params.position = position;
      if (university && university !== "all") params.university = university;
    }

    else if (status && status !== "all") {
      url = "/applications/filter/status";
      params.status = status;
    } else if (position && position !== "all") {
      url = "/applications/filter/position";
      params.position = position;
    } else if (university && university !== "all") {
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
      } else if (status && status !== "all") {
        url = "/applications/filter/status";
        params.status = status;
      } else if (position && position !== "all") {
        url = "/applications/filter/position";
        params.position = position;
      } else if (university && university !== "all") {
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
        hasMore = false; 
      } else if (response.data && Array.isArray(response.data.content)) {
        content = response.data.content;
        hasMore =
          !response.data.last && page < (response.data.totalPages || 1) - 1;
      } else if (response.data && response.data.currentPage !== undefined) {
        content = response.data.content || [];
        hasMore =
          !response.data.last && page < (response.data.totalPages || 1) - 1;
      }

      allApps = [...allApps, ...content.map(formatApplication)];
      page++;

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

export const searchApplications = async (
  query: string,
  page: number = 0,
  size: number = 20
): Promise<ApplicationsResponse> => {
  const accessToken = await getAccessToken();

  try {
    const response = await applicationApi.get("/applications/search", {
      params: { query, page, size },
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });

    const data = response.data;
    return {
      content: (data.content || []).map(formatApplication),
      totalPages: data.totalPages || 1,
      totalElements: data.totalElements || data.content?.length || 0,
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
  size: number = 5
): Promise<Application[]> => {
  const accessToken = await getAccessToken();

  try {
    const response = await applicationApi.get("/applications/filter/status", {
      params: { status, page, size },
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });

    // Status filter returns array directly
    return (Array.isArray(response.data) ? response.data : []).map(
      formatApplication
    );
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
    const response = await applicationApi.get("/applications/filter/position", {
      params: { position, page, size },
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });

    // Position filter returns array directly
    return (Array.isArray(response.data) ? response.data : []).map(
      formatApplication
    );
  } catch (error: any) {
    console.error("Failed to filter applications by position:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message ||
        "Failed to filter applications by position"
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
    return (Array.isArray(response.data) ? response.data : []).map(
      formatApplication
    );
  } catch (error: any) {
    console.error("Failed to filter applications by university:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message ||
        "Failed to filter applications by university"
    );
  }
};
