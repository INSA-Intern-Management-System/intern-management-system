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
  Plus,
  X,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AdminNotificationsClientProps {
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
  onCreateNotification: (notificationData: {
    title: string;
    description: string;
    type: string;
    recipients: string[];
  }) => Promise<{ success: boolean; error?: string }>;
}

export default function AdminNotificationsClient({
  initialNotifications,
  pagination,
  onMarkAsRead,
  onMarkAllAsRead,
  onFetchData,
  onCreateNotification,
}: AdminNotificationsClientProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [page, setPage] = useState<number>(pagination.currentPage + 1);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    description: "",
    type: "INFO",
    recipients: [] as string[],
  });

  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(pagination.totalItems / pageSize));

  const currentNotifications = notifications;

  useEffect(() => {
    const fetchPage = async () => {
      setIsLoading(true);
      const data = await onFetchData(page - 1, pageSize);
      setNotifications(data.notifications);
      setIsLoading(false);
    };
    fetchPage();
  }, [page]);

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
    const userRole = "ADMIN"; // This should come from user context
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
        prev.map((n) => (n.id === notificationId ? response.notification! : n))
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

      await loadAllNotifications();
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

  const handleCreateNotification = async () => {
    setIsCreating(true);
    try {
      const response = await onCreateNotification(newNotification);
      if (!response.success) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "Notification created successfully",
      });

      setNewNotification({
        title: "",
        description: "",
        type: "INFO",
        recipients: [],
      });
      setShowCreateDialog(false);

      // Refresh the notifications list
      await loadAllNotifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create notification",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
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
            Manage and create notifications for all users
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Notification</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newNotification.title}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter notification title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newNotification.description}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter notification description"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newNotification.type}
                    onValueChange={(value) =>
                      setNewNotification({
                        ...newNotification,
                        type: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INFO">Info</SelectItem>
                      <SelectItem value="ALERT">Alert</SelectItem>
                      <SelectItem value="SUCCESS">Success</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipients">Recipients</Label>
                  <Select
                    onValueChange={(value) => {
                      if (!newNotification.recipients.includes(value)) {
                        setNewNotification({
                          ...newNotification,
                          recipients: [...newNotification.recipients, value],
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Students</SelectItem>
                      <SelectItem value="COMPANY">Companies</SelectItem>
                      <SelectItem value="UNIVERSITY">Universities</SelectItem>
                      <SelectItem value="ADMIN">Admins</SelectItem>
                      <SelectItem value="ALL">All Users</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newNotification.recipients.map((recipient) => (
                      <Badge
                        key={recipient}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {recipient}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() =>
                            setNewNotification({
                              ...newNotification,
                              recipients: newNotification.recipients.filter(
                                (r) => r !== recipient
                              ),
                            })
                          }
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleCreateNotification}
                  disabled={isCreating || !newNotification.title}
                >
                  {isCreating && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
              <p className="text-gray-600">
                Create your first notification to get started!
              </p>
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
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatDate(notification.createdAt)}</span>
                          <span>•</span>
                          <span>
                            To:{" "}
                            {notification.recipients
                              .map((r) => r.role)
                              .join(", ")}
                          </span>
                        </div>
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
    </div>
  );
}
