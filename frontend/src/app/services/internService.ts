import { api as internApi } from "@/api/axios";
import { cookies } from "next/headers";

export interface Intern {
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
  userStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface InternResponse {
  intern: Intern;
  project: {
    id: number;
    name: string;
    description: string;
    progress: number;
  };
  reportProgress: {
    internId: number;
    totalReports: number;
    averageRating: number;
  };
}

export interface InternsResponse {
  interns: InternResponse[];
  totalInterns: number;
  totalPages: number;
  message: string;
  currentPage: number;
}

export interface PagedInternResponse {
  content: Intern[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface InternStats {
  totalInterns: number;
  activeInterns: number;
  averageRating: number;
  averageProgress: number;
}

// Get access token helper
const getAccessToken = async (): Promise<string> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }
  return accessToken;
};

// Fetch all interns with pagination
export const fetchInterns = async (
  page: number = 0,
  size: number = 10
): Promise<InternsResponse> => {
  const accessToken = await getAccessToken();

  try {
    const response = await internApi.get<InternsResponse>("/users/interns", {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    
    console.log("API Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch interns:", error);
    if (error.response?.status === 403 || error.response?.status === 401) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || error);
  }
};

// Search interns
export const searchInterns = async (
  query: string,
  page: number = 0,
  size: number = 20
): Promise<PagedInternResponse> => {
  const accessToken = await getAccessToken();

  try {
    const response = await internApi.get<PagedInternResponse>(
      "/users/interns/search",
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
    console.error("Failed to search interns:", error);
    if (error.response?.status === 403 || error.response?.status === 401) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to search interns");
  }
};

// Filter interns by university
export const filterInternsByUniversity = async (
  query: string,
  page: number = 0,
  size: number = 20
): Promise<PagedInternResponse> => {
  const accessToken = await getAccessToken();

  try {
    const response = await internApi.get<PagedInternResponse>(
      "/users/filter-interns-by-university",
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
    console.error("Failed to filter interns by university:", error);
    if (error.response?.status === 403 || error.response?.status === 401) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to filter interns by university"
    );
  }
};

// Filter interns by status
export const filterInternsByStatus = async (
  query: string,
  page: number = 0,
  size: number = 20
): Promise<PagedInternResponse> => {
  const accessToken = await getAccessToken();

  try {
    const response = await internApi.get<PagedInternResponse>(
      "/users/filter-interns-by-status",
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
    console.error("Failed to filter interns by status:", error);
    if (error.response?.status === 403 || error.response?.status === 401) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to filter interns by status"
    );
  }
};

// Get intern by ID
export const getInternById = async (id: number): Promise<Intern> => {
  const accessToken = await getAccessToken();

  try {
    const response = await internApi.get<Intern>(`/users/${id}`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch intern:", error);
    if (error.response?.status === 403 || error.response?.status === 401) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    if (error.response?.status === 404) {
      throw new Error("Intern not found.");
    }
    throw new Error(error.response?.data?.message || "Failed to fetch intern");
  }
};

// // Get intern statistics
// export const getInternStats = async (): Promise<InternStats> => {
//   const accessToken = await getAccessToken();

//   try {
//     const response = await internApi.get<InternStats>("/users/interns/stats", {
//       headers: {
//         Cookie: `access_token=${accessToken}`,
//       },
//       withCredentials: true,
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error("Failed to fetch intern stats:", error);
    
//     // Fallback: calculate stats from the interns list
//     try {
//       const internsResponse = await fetchInterns(0, 100);
//       const interns = internsResponse.interns || [];
      
//       const totalInterns = interns.length;
//       const activeInterns = interns.filter(item => 
//         item.intern.userStatus === "ACTIVE"
//       ).length;
      
//       const totalRating = interns.reduce((sum, item) => 
//         sum + (item.reportProgress?.averageRating || 0), 0
//       );
//       const averageRating = interns.length > 0 ? totalRating / interns.length : 0;
      
//       const totalProgress = interns.reduce((sum, item) => 
//         sum + (item.project?.progress || 0), 0
//       );
//       const averageProgress = interns.length > 0 ? totalProgress / interns.length : 0;

//       return {
//         totalInterns,
//         activeInterns,
//         averageRating,
//         averageProgress
//       };
//     } catch (fallbackError) {
//       console.error("Failed to calculate fallback stats:", fallbackError);
//       throw new Error("Failed to fetch intern statistics");
//     }
//   }
// };