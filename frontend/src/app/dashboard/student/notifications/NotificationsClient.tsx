"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCircle,
  MessageSquare,
  FileText,
  Calendar,
  Settings,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "@/components/ui/use-toast";
import { Notification } from "@/app/services/notificationService";

interface StudentNotificationsClientProps {
  userRole: string;
  initialNotifications: Notification[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  onMarkAsRead: (notificationId: number) => Promise<{
    success: boolean;
    notification?: Notification;
    error?: string;
  }>;
  onMarkAllAsRead: () => Promise<{ success: boolean; error?: string }>;
  onFetchData: (
    page: number,
    size: number
  ) => Promise<{
    notifications: Notification[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      pageSize: number;
    };
    error?: string;
  }>;
}

export default function StudentNotificationsClient({
  userRole,
  initialNotifications,
  pagination,
  onMarkAsRead,
  onMarkAllAsRead,
  onFetchData,
}: StudentNotificationsClientProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [page, setPage] = useState<number>(pagination.currentPage + 1);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState<number | null>(null);

  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(pagination.totalItems / pageSize));

  const currentNotifications = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return notifications.slice(start, end);
  }, [notifications, page, pageSize]);

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  const loadAllNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await onFetchData(0, 10000);
      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      } else {
        setNotifications(data.notifications);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ALERT":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "SUCCESS":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "INFO":
        return <Bell className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "ALERT":
        return <Badge className="bg-red-100 text-red-800">Alert</Badge>;
      case "SUCCESS":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case "INFO":
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const isNotificationRead = (notification: Notification): boolean => {
    const recipient = notification.recipients.find((r) => r.role === userRole);
    return recipient?.read || false;
  };

  const handleMarkAsRead = async (notificationId: number) => {
    setIsMarkingRead(notificationId);
    try {
      const response = await onMarkAsRead(notificationId);
      if (!response.success) {
        throw new Error(response.error);
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? {
                ...n,
                recipients: n.recipients.map((r) => {
                  toast({
                    title: "Role check",
                    description: `Recipient role: ${r.role}, userRole: ${userRole}`,
                  });
                  return r.role === userRole ? { ...r, read: true } : r;
                }),
              }
            : n
        )
      );

      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark notification as read",
        variant: "destructive",
      });
    } finally {
      setIsMarkingRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await onMarkAllAsRead();
      if (!response.success) {
        throw new Error(response.error);
      }

      // 👇 Instead of re-fetching, update local state
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          recipients: n.recipients.map((r) =>
            r.role === userRole ? { ...r, read: true } : r
          ),
        }))
      );

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            Stay updated with intern activities and important events
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-gray-600">You're all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          currentNotifications.map((notification) => {
            const isRead = isNotificationRead(notification);

            return (
              <Card
                key={notification.id}
                className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                  !isRead ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between relative">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3
                            className={`font-semibold ${
                              !isRead ? "text-gray-900" : "text-gray-700"
                            }`}
                          >
                            {notification.title}
                          </h3>
                          {!isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                          {getTypeBadge(notification.type)}
                        </div>
                        <p className="text-gray-600 mb-2">
                          {notification.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {!isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={isMarkingRead === notification.id}
                        >
                          {isMarkingRead === notification.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={page === i + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
                className={
                  page === totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Quick Actions */}
      <Card className="bg-white border border-gray-200 rounded-lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common actions based on your notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2 bg-transparent"
            >
              <FileText className="h-6 w-6" />
              <span>Review Applications</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2 bg-transparent"
            >
              <CheckCircle className="h-6 w-6" />
              <span>Evaluate Reports</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2 bg-transparent"
            >
              <Calendar className="h-6 w-6" />
              <span>Approve Leave</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2 bg-transparent"
            >
              <MessageSquare className="h-6 w-6" />
              <span>Send Messages</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="bg-white border border-gray-200 rounded-lg">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Email Notifications</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Report Deadlines</li>
                <li>• Feedback Received</li>
                <li>• Meeting Reminders</li>
                <li>• Weekly Digest</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Push Notifications</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Urgent Messages</li>
                <li>• Application Updates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
