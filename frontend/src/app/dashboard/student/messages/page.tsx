import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import MessagesClient from "./MessagesClient";
import {
  fetchRooms,
  fetchRoomMessages,
  sendMessage,
  markMessagesAsRead,
  searchUsersByName,
  createRoom,
} from "@/app/services/messageService";
import type {
  Message,
  SearchUser,
  RoomUserUnreadDTO,
  Room,
} from "@/types/entities";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId) };
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: {
    roomId?: string;
    page?: string;
  };
}) {
  async function getUser() {
    const accessToken = (await cookies()).get("access_token")?.value;
    const userId = (await cookies()).get("userId")?.value;

    if (!accessToken || !userId) {
      redirect("/login");
    }

    return { userId: Number(userId), accessToken };
  }
  const { userId, accessToken } = await getUser();

  const searchParamsAwaited = await searchParams;
  const roomId = searchParamsAwaited.roomId
    ? parseInt(searchParamsAwaited.roomId)
    : undefined;
  const page = parseInt(searchParamsAwaited.page || "0");

  // Fetch rooms
  const roomsData = await fetchRooms(page, 20);

  // Fetch messages for the selected room if roomId is provided
  let roomMessages = null;
  if (roomId) {
    roomMessages = await fetchRoomMessages(roomId, 0, 50);
  }

  // Server actions
  const handleSendMessage = async (
    roomId: number,
    content: string,
    receiverId: number
  ): Promise<{
    success: boolean;
    data?: Message | undefined;
    error?: string | undefined;
  }> => {
    "use server";
    try {
      const result = await sendMessage(roomId, content, receiverId);
      return { success: true, data: result as Message };
    } catch (error: any) {
      console.error("Server action error:", error);
      return {
        success: false,
        error: error.message || "Failed to send message",
      };
    }
  };

  const handleMarkAsRead = async (roomId: number) => {
    "use server";
    try {
      await markMessagesAsRead(roomId);
      return { success: true };
    } catch (error: any) {
      console.error("Server action error:", error);
      return {
        success: false,
        error: error.message || "Failed to mark messages as read",
      };
    }
  };

  const handleSearchUsers = async (
    name: string
  ): Promise<{
    success: boolean;
    data?: SearchUser[];
    error?: string;
  }> => {
    "use server";
    try {
      const result = await searchUsersByName(name);
      return { success: true, data: result.content };
    } catch (error: any) {
      console.error("Search error:", error);
      return {
        success: false,
        error: error.message || "Failed to search users",
      };
    }
  };

  const handleCreateRoom = async (
    otherUserId: number
  ): Promise<{
    success: boolean;
    data?: Room | undefined;
    error?: string;
  }> => {
    "use server";
    try {
      const result = await createRoom(otherUserId);
      return { success: true, data: result };
    } catch (error: any) {
      console.error("Create room error:", error);
      return {
        success: false,
        error: error.message || "Failed to create conversation",
      };
    }
  };

  return (
    <DashboardLayout requiredRole="student">
      <MessagesClient
        initialRooms={roomsData.content}
        initialMessages={roomMessages?.content || []}
        pagination={{
          currentPage: roomsData.pageable.pageNumber,
          totalPages: roomsData.totalPages,
          totalItems: roomsData.totalElements,
          pageSize: roomsData.pageable.pageSize,
        }}
        userId={userId}
        accessToken={accessToken} // Add this prop
        initialRoomId={roomId}
        onSendMessage={handleSendMessage}
        onMarkAsRead={handleMarkAsRead}
        onSearchUsers={handleSearchUsers}
        onCreateRoom={handleCreateRoom}
      />
    </DashboardLayout>
  );
}
