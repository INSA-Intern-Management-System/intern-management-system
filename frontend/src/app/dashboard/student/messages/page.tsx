// app/dashboard/student/messages/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import MessagesClient from "./MessagesClient";
import {
  fetchRooms,
  fetchRoomMessages,
  searchUsersByName,
} from "@/app/services/messageService";
import type { SearchUser } from "@/types/entities";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId), accessToken };
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: {
    roomId?: string;
    page?: string;
  };
}) {
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

  // Server action for searching users
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
        accessToken={accessToken}
        initialRoomId={roomId}
        onSearchUsers={handleSearchUsers}
      />
    </DashboardLayout>
  );
}
