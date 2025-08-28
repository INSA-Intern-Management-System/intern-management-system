// app/dashboard/student/notifications/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import NotificationsClient from "./NotificationsClient";
import { notificationService } from "@/app/services/notificationService";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId) };
}

async function getNotifications(): Promise<any[]> {
  try {
    const response = await notificationService.getNotifications();
    const transformedNotifications = response.content.map((apiNotif) =>
      notificationService.transformApiNotification(apiNotif)
    );
    return transformedNotifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export default async function NotificationsPage() {
  await getUser();
  const notifications = await getNotifications();

  return (
    <DashboardLayout requiredRole="student">
      <NotificationsClient initialNotifications={notifications} />
    </DashboardLayout>
  );
}
