// app/services/messageService.ts
import { messageApi } from "@/api/axios";
import {
  MessagesResponse,
  RoomsResponse,
  UsersSearchResponse,
} from "@/types/entities";
import { cookies } from "next/headers";

export const fetchRooms = async (
  page: number = 0,
  size: number = 20
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
  page: number = 0,
  size: number = 50
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
  page: number = 0,
  size: number = 10
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

// These functions are kept for backward compatibility but will not be used
// in the client component since we're using WebSocket for these operations
export const sendMessage = async (
  roomId: number,
  content: string,
  receiverId: number
): Promise<any> => {
  throw new Error("Use WebSocket for sending messages");
};

export const markMessagesAsRead = async (roomId: number): Promise<void> => {
  throw new Error("Use WebSocket for marking messages as read");
};

export const createRoom = async (participantId: number): Promise<any> => {
  throw new Error("Use WebSocket for creating rooms");
};
