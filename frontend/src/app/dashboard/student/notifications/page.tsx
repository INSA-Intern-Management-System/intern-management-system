// app/dashboard/student/notifications/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { User } from "@/types/entities";
import { api } from "@/api/axios";
import DashboardLayout from "@/app/layout/dashboard-layout";
import NotificationsClient from "./NotificationsClient";

interface Notification {
  id: number;
  title: string;
  description: string;
  created_at: string;
  is_read: boolean;
  type: string;
  priority: string;
  role: string[];
}

async function getUser(): Promise<User> {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  try {
    const response = await api.get<User>(`/users/${userId}`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    redirect("/login");
  }
}

async function getNotifications(userId: string): Promise<Notification[]> {
  const accessToken = (await cookies()).get("access_token")?.value;

  try {
    const response = await api.get<Notification[]>("/notifications", {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    // Fallback to mock data if API fails
    return [
      {
        id: 1,
        title: "New Feedback Received",
        description: "Sarah Wilson provided feedback on your Week 2 report",
        created_at: "2024-02-10T10:30:00Z",
        is_read: false,
        type: "feedback",
        priority: "high",
        role: ["student"],
      },
      // ... other mock notifications
    ];
  }
}

export default async function NotificationsPage() {
  const user = await getUser();
  const notifications = await getNotifications(user.id);

  return (
    <DashboardLayout requiredRole="STUDENT">
      <NotificationsClient initialNotifications={notifications} />
    </DashboardLayout>
  );
}
