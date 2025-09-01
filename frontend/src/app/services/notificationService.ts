import { notificationApi } from "@/api/axios";
import { cookies } from "next/headers";

export interface RecipientResponse {
  id: number;
  role: string;
  read: boolean;
}

export interface Notification {
  id: number;
  title: string;
  description: string;
  type: string;
  roles: string[];
  recipients: RecipientResponse[];
  createdAt: string;
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

// Get access token helper
const getAccessToken = async (): Promise<string> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }
  return accessToken;
};

// Fetch notifications with pagination
export const fetchNotifications = async (
  page: number = 0,
  size: number = 10
): Promise<PagedResponse<Notification>> => {
  const accessToken = await getAccessToken();

  try {
    const response = await notificationApi.get<PagedResponse<Notification>>(
      "/notifications",
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
    console.error("Failed to fetch notifications:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch notifications"
    );
  }
};

// Mark notification as read
export const markAsRead = async (
  notificationId: number
): Promise<Notification> => {
  const accessToken = await getAccessToken();

  try {
    const response = await notificationApi.put<Notification>(
      `/notifications/mark-as-read/${notificationId}`,
      {},
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to mark notification as read:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to mark notification as read"
    );
  }
};

// Mark all notifications as read
export const markAllAsRead = async (): Promise<{ message: string }> => {
  const accessToken = await getAccessToken();

  try {
    const response = await notificationApi.put<{ message: string }>(
      "/notifications/mark-all-as-read",
      {},
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to mark all notifications as read:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message ||
        "Failed to mark all notifications as read"
    );
  }
};
