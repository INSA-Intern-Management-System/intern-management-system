import { leaveApi } from "@/api/axios";
import {
  CreateLeaveRequest,
  LeaveRequest,
  LeaveResponse,
  StatusCounts,
} from "@/types/entities";
import { cookies } from "next/headers";

export const fetchLeaves = async (
  page: number = 0,
  size: number = 10,
  search?: string,
  status?: string,
  type?: string
): Promise<LeaveResponse> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    let url = "/leaves";
    const params: Record<string, string | number> = { page, size };

    // Handle search endpoint
    if (search) {
      url = "/leaves/search";
      params.reason = search;
      if (type && type !== "all") params.leaveType = type;
    }
    // Handle filter endpoint (status and/or type)
    else if (status || type) {
      url = "/leaves/filter";
      if (status && status !== "all") params.leaveStatus = status.toUpperCase();
      if (type && type !== "all") params.leaveType = type;
    }

    const response = await leaveApi.get<LeaveResponse>(url, {
      params,
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch leaves:", error);
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

export const fetchStatusCounts = async (): Promise<StatusCounts> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await leaveApi.get<StatusCounts>("/leaves/status-counts", {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch status counts:", error);
    return {
      total: 0,
      approved: 0,
      rejected: 0,
      pending: 0,
    };
  }
};

export const createLeave = async (
  leaveData: CreateLeaveRequest
): Promise<LeaveRequest> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await leaveApi.post<LeaveRequest>("/leaves", leaveData, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create leave:", error);
    throw error;
  }
};

export const deleteLeave = async (leaveId: number): Promise<void> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    await leaveApi.delete(`/leaves/${leaveId}`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
  } catch (error) {
    console.error("Failed to delete leave:", error);
    throw error;
  }
};
