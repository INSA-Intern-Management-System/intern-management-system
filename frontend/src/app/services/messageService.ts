// app/services/messageService.ts
import { messageApi } from "@/api/axios";
import type {
  MessagesResponse,
  RoomsResponse,
  UsersSearchResponse,
} from "@/types/entities";
import { cookies } from "next/headers";

export const fetchRooms = async (
  page = 0,
  size = 20
): Promise<RoomsResponse> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await messageApi.get<RoomsResponse>("/messages/rooms", {
      params: { page, size },
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    return {
      content: [],
      pageable: {
        pageNumber: page,
        pageSize: size,
        sort: { sorted: false, empty: true, unsorted: true },
        offset: page * size,
        paged: true,
        unpaged: false,
      },
      last: true,
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page,
      sort: { sorted: false, empty: true, unsorted: true },
      first: true,
      numberOfElements: 0,
      empty: true,
    };
  }
};

export const fetchRoomMessages = async (
  roomId: number,
  page = 0,
  size = 50
): Promise<MessagesResponse> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await messageApi.get<MessagesResponse>(
      `/messages/rooms/${roomId}/messages`,
      {
        params: { page, size },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to fetch room messages:", error);
    return {
      content: [],
      pageable: {
        pageNumber: page,
        pageSize: size,
        sort: { sorted: false, empty: true, unsorted: true },
        offset: page * size,
        paged: true,
        unpaged: false,
      },
      last: true,
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page,
      sort: { sorted: false, empty: true, unsorted: true },
      first: true,
      numberOfElements: 0,
      empty: true,
    };
  }
};

export const searchUsersByName = async (
  name: string,
  page = 0,
  size = 10
): Promise<UsersSearchResponse> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await messageApi.get<UsersSearchResponse>(
      "messages/users/search",
      {
        params: { name, page, size },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to search users:", error);
    return {
      content: [],
      pageable: {
        pageNumber: page,
        pageSize: size,
        sort: { sorted: false, empty: true, unsorted: true },
        offset: page * size,
        paged: true,
        unpaged: false,
      },
      last: true,
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page,
      sort: { sorted: false, empty: true, unsorted: true },
      first: true,
      numberOfElements: 0,
      empty: true,
    };
  }
};

// The backend automatically creates rooms when the first message is sent
// No need for explicit room creation or mark as read via REST API
// Add this function to your messageService.ts
export const createRoom = async (
  userId: number,
  otherUserId: number
): Promise<{ roomId: number }> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    // This endpoint should be created in your backend
    const response = await messageApi.post<{ roomId: number }>(
      "/messages/rooms",
      { userId, otherUserId },
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create room:", error);
    throw new Error("Failed to create conversation");
  }
};
