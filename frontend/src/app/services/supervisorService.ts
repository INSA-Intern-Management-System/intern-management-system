// services/supervisorService.ts
import { api } from "@/api/axios";
import { cookies } from "next/headers";

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  gender: string;
  fieldOfStudy: string;
  institution: string;
  bio: string | null;
  duration: string | null;
  linkedInUrl: string | null;
  githubUrl: string | null;
  cvUrl: string | null;
  profilePicUrl: string | null;
  userStatus: "ACTIVE" | "PENDING";
  supervisorId?: number;
}

export interface Supervisor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  gender: string;
  fieldOfStudy: string;
  institution: string;
  bio: string | null;
  linkedInUrl: string | null;
  githubUrl: string | null;
  profilePicUrl: string | null;
  userStatus: "ACTIVE" | "PENDING";
  supervisedInterns: Student[];
}

export interface SupervisorFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  gender: string;
  fieldOfStudy: string;
  institution: string;
  bio: string;
  linkedInUrl: string;
  githubUrl: string;
  profilePicUrl: string;
  notifyEmail: boolean;
  visibility: boolean;
  cvUrl: string | null;
  userStatus: "ACTIVE" | "PENDING";
  roles: {
    id: number;
    name: string;
    displayName: string;
    description: string;
  };
}

export interface SupervisorResponse {
  totalElements: number;
  totalPages: number;
  content: Supervisor[];
  currentPage: number;
}

export interface SupervisorStats {
  totalSupervisors: number;
  activeSupervisors: number;
  pendingSupervisors: number;
}

// Get access token helper
const getAccessToken = async (): Promise<string> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }
  return accessToken;
};

// Get all supervisors
export const fetchSupervisors = async (
  page: number = 0,
  size: number = 10
): Promise<SupervisorResponse> => {
  const accessToken = await getAccessToken();

  try {
    const response = await api.get<SupervisorResponse>("/users/supervisors", {
      params: { page, size },
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    console.log("Fetched supervisors:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch supervisors:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch supervisors"
    );
  }
};

// Search supervisors by name or field
export const searchSupervisors = async (
  query: string,
  page: number = 0,
  size: number = 10
): Promise<SupervisorResponse> => {
  const accessToken = await getAccessToken();

  try {
    const response = await api.get<SupervisorResponse>(
      "/users/search-supervisors",
      {
        params: { query, page, size },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to search supervisors:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to search supervisors"
    );
  }
};

// Filter supervisors by status or field
export const filterSupervisors = async (
  status?: string,
  field?: string,
  page: number = 0,
  size: number = 10
): Promise<SupervisorResponse> => {
  const accessToken = await getAccessToken();

  try {
    const response = await api.get<SupervisorResponse>(
      status
        ? "/users/filter-supervisor-by-status"
        : "/users/filter-supervisor-by-field-of-study",
      {
        params: { query: status || field, page, size },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to filter supervisors:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to filter supervisors"
    );
  }
};

// Get supervisor status counts
export const fetchSupervisorStats = async (): Promise<SupervisorStats> => {
  const accessToken = await getAccessToken();

  try {
    const response = await api.get<SupervisorResponse>("/users/supervisors", {
      params: { page: 0, size: 1000 },
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    const totalSupervisors = response.data.totalElements;
    const activeSupervisors = response.data.content.filter(
      (supervisor) => supervisor.userStatus === "ACTIVE"
    ).length;
    const pendingSupervisors = response.data.content.filter(
      (supervisor) => supervisor.userStatus === "PENDING"
    ).length;

    return {
      totalSupervisors,
      activeSupervisors,
      pendingSupervisors,
    };
  } catch (error: any) {
    console.error("Failed to fetch supervisor stats:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch supervisor stats"
    );
  }
};

// Create supervisor
export const createSupervisor = async (
  supervisorData: SupervisorFormData
): Promise<Supervisor> => {
  const accessToken = await getAccessToken();

  try {
    const response = await api.post("/auth/register", supervisorData, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data.user;
  } catch (error: any) {
    console.error("Failed to create supervisor:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to create supervisor"
    );
  }
};

// Update supervisor
export const updateSupervisor = async (
  supervisor: Supervisor
): Promise<Supervisor> => {
  const accessToken = await getAccessToken();

  try {
    const response = await api.put(`/users/${supervisor.id}`, supervisor, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to update supervisor:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to update supervisor"
    );
  }
};
