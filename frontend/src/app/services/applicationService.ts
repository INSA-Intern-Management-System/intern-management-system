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
  status: "Pending" | "Accepted" | "Rejected"; // Updated status values
  createdAt: string;
  applicant: Applicant;
}

export interface ApplicationsResponse {
  content: Application[];
  totalPages: number;
  totalElements: number;
  currentPage: number; // Changed from 'number' to 'currentPage'
  pageable?: {
    pageNumber: number;
    pageSize: number;
    sort: { sorted: boolean; empty: boolean; unsorted: boolean };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last?: boolean;
  size?: number;
  sort?: { sorted: boolean; empty: boolean; unsorted: boolean };
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

export const fetchApplications = async (
  page: number = 0,
  size: number = 10,
  search?: string,
  status?: string
): Promise<ApplicationsResponse> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    let url = "/applications/filter/for-university";
    const params: Record<string, string | number> = { page, size };

    if (search) {
      url = "/applications/search";
      params.query = search;
    } else if (status && status !== "all") {
      url = "/applications/filter/status";
      params.status = status;
    }

    const response = await applicationApi.get<ApplicationsResponse>(url, {
      params,
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });

    // Transform status values to match our expected format
    const transformedData = {
      ...response.data,
      content: response.data.content.map((app) => ({
        ...app,
        status: app.status.toUpperCase() as "Pending" | "Accepted" | "Rejected",
      })),
    };

    return transformedData;
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      currentPage: page,
    };
  }
};

export const createApplication = async (
  applicationData: CreateApplicationRequest
): Promise<Application> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const formData = new FormData();
    formData.append("firstName", applicationData.firstName);
    formData.append("lastName", applicationData.lastName);
    formData.append("email", applicationData.email);

    if (applicationData.phoneNumber)
      formData.append("phoneNumber", applicationData.phoneNumber);
    if (applicationData.institution)
      formData.append("institution", applicationData.institution);
    if (applicationData.fieldOfStudy)
      formData.append("fieldOfStudy", applicationData.fieldOfStudy);
    if (applicationData.gender)
      formData.append("gender", applicationData.gender);
    if (applicationData.duration)
      formData.append("duration", applicationData.duration);
    if (applicationData.linkedInUrl)
      formData.append("linkedInUrl", applicationData.linkedInUrl);
    if (applicationData.githubUrl)
      formData.append("githubUrl", applicationData.githubUrl);
    if (applicationData.cvFile)
      formData.append("cvFile", applicationData.cvFile);

    const response = await applicationApi.post<{ application: Application }>(
      "/apply",
      formData,
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    // Transform status to uppercase
    return {
      ...response.data.application,
      status: response.data.application.status.toUpperCase() as
        | "Pending"
        | "Accepted"
        | "Rejected",
    };
  } catch (error) {
    console.error("Failed to create application:", error);
    throw error;
  }
};

export const batchImportApplications = async (
  file: File
): Promise<Applicant[]> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await applicationApi.post<{ applicants: Applicant[] }>(
      "/application/batch",
      formData,
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );
    return response.data.applicants;
  } catch (error) {
    console.error("Failed to batch import applications:", error);
    throw error;
  }
};
