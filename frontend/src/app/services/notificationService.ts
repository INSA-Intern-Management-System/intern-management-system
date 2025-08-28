// app/services/notificationService.ts
import { notificationApi } from "@/api/axios";

export interface ApiNotification {
  id: number;
  title: string;
  description: string;
  type: string;
  roles: string[];
  recipients: {
    id: number;
    role: string;
    read: boolean;
  }[];
  createdAt: string;
}

export interface NotificationsResponse {
  content: ApiNotification[];
  totalPages: number;
  totalElements: number;
}

export interface Notification {
  id: number;
  title: string;
  description: string;
  created_at: string;
  is_read: boolean;
  type: string;
  priority: string;
  role: string[];
}

class NotificationService {
  async getNotifications(): Promise<NotificationsResponse> {
    const response = await notificationApi.get<NotificationsResponse>(
      "/notifications"
    );
    return response.data;
  }

  transformApiNotification(apiNotif: ApiNotification): Notification {
    return {
      id: apiNotif.id,
      title: apiNotif.title,
      description: apiNotif.description,
      created_at: apiNotif.createdAt,
      is_read: false, // Default to false since we don't have read status logic
      type: apiNotif.type.toLowerCase(),
      priority: "medium", // Default priority
      role: apiNotif.roles,
    };
  }
}

export const notificationService = new NotificationService();
