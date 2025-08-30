import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  Notification,
} from "@/app/services/notificationService";
import StudentNotificationsClient from "./NotificationsClient";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId), accessToken };
}

export default async function CompanyNotificationsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const { userId } = await getUser();

  const searchParamsAwaited = await searchParams;
  const page = parseInt(searchParamsAwaited.page || "0");

  let notificationsData;
  try {
    notificationsData = await fetchNotifications(page, 10);
  } catch (error: any) {
    console.error("Failed to fetch notifications:", error);
    if (error.message === "Unauthorized access. Please log in again.") {
      redirect("/login");
    }
    notificationsData = {
      content: [],
      number: 0,
      totalPages: 0,
      totalElements: 0,
      size: 10,
    };
  }

  const handleMarkAsRead = async (notificationId: number) => {
    "use server";
    try {
      const updatedNotification = await markAsRead(notificationId);
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/company/notifications");
      return { success: true, notification: updatedNotification };
    } catch (error: any) {
      console.error("handleMarkAsRead error:", error);
      return {
        success: false,
        error: error.message || "Failed to mark notification as read",
      };
    }
  };

  const handleMarkAllAsRead = async () => {
    "use server";
    try {
      await markAllAsRead();
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/company/notifications");
      return { success: true };
    } catch (error: any) {
      console.error("handleMarkAllAsRead error:", error);
      return {
        success: false,
        error: error.message || "Failed to mark all notifications as read",
      };
    }
  };

  const handleFetchData = async (page: number, size: number) => {
    "use server";
    try {
      const data = await fetchNotifications(page, size);
      return {
        notifications: data.content,
        pagination: {
          currentPage: data.number,
          totalPages: data.totalPages,
          totalItems: data.totalElements,
          pageSize: size,
        },
      };
    } catch (error: any) {
      console.error("handleFetchData error:", error);
      return {
        notifications: [],
        pagination: {
          currentPage: 0,
          totalPages: 0,
          totalItems: 0,
          pageSize: size,
        },
        error: error.message || "Failed to fetch notifications",
      };
    }
  };

  return (
    <DashboardLayout requiredRole="student">
      <StudentNotificationsClient
        userRole="STUDENT"
        initialNotifications={notificationsData.content}
        pagination={{
          currentPage: notificationsData.number,
          totalPages: notificationsData.totalPages,
          totalItems: notificationsData.totalElements,
          pageSize: notificationsData.size,
        }}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onFetchData={handleFetchData}
      />
    </DashboardLayout>
  );
}
