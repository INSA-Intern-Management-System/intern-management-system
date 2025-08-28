// app/dashboard/student/notifications/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import NotificationsClient from "./NotificationsClient";
import {
  notificationService,
  type ApiNotification,
  type Notification,
} from "@/app/services/notificationService";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId) };
}

async function getNotifications(userId: string): Promise<Notification[]> {
  const accessToken = (await cookies()).get("access_token")?.value;

  try {
    const response = await notificationService.getNotifications(0, 50);

    // Transform API data to match the component's expected format
    const transformedNotifications = response.content.map((apiNotif) =>
      notificationService.transformApiNotification(apiNotif, "STUDENT")
    );

    return transformedNotifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);

    // Fallback to mock data if API fails
    return [
      {
        id: 1,
        title: "The backend is not responsing",
        description: "No result from backend",
        created_at: "2024-02-10T10:30:00Z",
        is_read: false,
        type: "feedback",
        priority: "high",
        role: ["student"],
      },
    ];
  }
}

export default async function NotificationsPage() {
  const user = await getUser();
  const notifications = await getNotifications(String(user.userId));

  return (
    <DashboardLayout requiredRole="student">
      <NotificationsClient initialNotifications={notifications} />
    </DashboardLayout>
  );
}
