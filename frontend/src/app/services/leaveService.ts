// services/leaveService.ts
import { leaveApi } from "@/api/axios";
import {
  CreateLeaveRequest,
  LeaveRequest,
  LeaveResponse,
  StatusCounts,
} from "@/types/entities";
import { cookies } from "next/headers";

// Get access token helper
const getAccessToken = async (): Promise<string> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }
  return accessToken;
};

// Get all leaves (with optional pagination)
export const fetchLeaves = async (
  page: number = 0,
  size: number = 10
): Promise<LeaveResponse> => {
  const accessToken = await getAccessToken();

  try {
    const response = await leaveApi.get<LeaveResponse>("/leaves", {
      params: { page, size },
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    console.log("Fetched leaves:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch leaves:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to fetch leaves");
  }
};

// Search leaves by reason
export const searchLeaves = async (
  reason: string,
  page: number = 0,
  size: number = 10
): Promise<LeaveResponse> => {
  const accessToken = await getAccessToken();

  try {
    const response = await leaveApi.get<LeaveResponse>("/leaves/search", {
      params: { reason, page, size },
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to search leaves:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to search leaves");
  }
};

// Filter leaves by status and/or type
export const filterLeaves = async (
  leaveStatus?: string,
  leaveType?: string,
  page: number = 0,
  size: number = 10
): Promise<LeaveResponse> => {
  const accessToken = await getAccessToken();

  try {
    const response = await leaveApi.get<LeaveResponse>("/leaves/filter", {
      params: { leaveStatus, leaveType, page, size },
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to filter leaves:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to filter leaves");
  }
};

// Get leave status counts
export const fetchStatusCounts = async (): Promise<StatusCounts> => {
  const accessToken = await getAccessToken();

  try {
    const response = await leaveApi.get<StatusCounts>("/leaves/status-counts", {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch status counts:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch status counts"
    );
  }
};

// Create leave
export const createLeave = async (
  leaveData: CreateLeaveRequest
): Promise<LeaveRequest> => {
  const accessToken = await getAccessToken();

  try {
    const response = await leaveApi.post<LeaveRequest>("/leaves", leaveData, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to create leave:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to create leave");
  }
};

// Delete leave
export const deleteLeave = async (leaveId: number): Promise<void> => {
  const accessToken = await getAccessToken();

  try {
    await leaveApi.delete(`/leaves/${leaveId}`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
  } catch (error: any) {
    console.error("Failed to delete leave:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(error.response?.data?.message || "Failed to delete leave");
  }
};

// Update leave status
export const updateLeaveStatus = async (
  leaveId: number,
  newStatus: "APPROVED" | "REJECTED",
  rejectionReason?: string
): Promise<LeaveRequest> => {
  const accessToken = await getAccessToken();

  try {
    const response = await leaveApi.patch<LeaveRequest>(
      `/leaves/${leaveId}/status?newStatus=${newStatus}`,
      rejectionReason ? { rejectionReason } : {},
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to update leave status:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to update leave status"
    );
  }
};
