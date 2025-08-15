"use client";

import React, { useRef, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/app/layout/dashboard-layout";
import {
  Bell,
  CheckCircle,
  Clock,
  MessageSquare,
  FileText,
  Calendar,
  Settings,
  Mail,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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

export default function NotificationsPage() {
  const initialNotifications: Notification[] = [
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
    {
      id: 2,
      title: "Report Due Tomorrow",
      description: "Week 3 weekly report is due tomorrow at 11:59 PM",
      created_at: "2024-02-09T14:15:00Z",
      is_read: false,
      type: "deadline",
      priority: "high",
      role: ["student"],
    },
    {
      id: 3,
      title: "Meeting Scheduled",
      description: "Mentor meeting scheduled for Friday at 2:00 PM",
      created_at: "2024-02-08T09:45:00Z",
      is_read: true,
      type: "meeting",
      priority: "medium",
      role: ["student"],
    },
    {
      id: 4,
      title: "Application Status Update",
      description: "Your application to Tech Corp has been accepted",
      created_at: "2024-02-07T16:20:00Z",
      is_read: true,
      type: "application",
      priority: "high",
      role: ["student"],
    },
    {
      id: 5,
      title: "Profile Updated",
      description: "Your profile information has been successfully updated",
      created_at: "2024-02-01T11:10:00Z",
      is_read: true,
      type: "system",
      priority: "low",
      role: ["student"],
    },
  ];

  const preferencesRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [page, setPage] = useState(1);
  const [emailPrefs, setEmailPrefs] = useState({
    reportDeadlines: true,
    feedbackReceived: true,
    meetingReminders: true,
    weeklyDigest: true,
  });
  const [pushPrefs, setPushPrefs] = useState({
    urgentMessages: true,
    applicationUpdates: true,
  });

  const pageSize = 3;
  const totalPages = Math.ceil(notifications.length / pageSize);
  const paginatedNotifications = notifications.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "feedback":
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case "deadline":
        return <Clock className="h-5 w-5 text-red-600" />;
      case "meeting":
        return <Calendar className="h-5 w-5 text-purple-600" />;
      case "application":
        return <FileText className="h-5 w-5 text-green-600" />;
      case "system":
        return <Settings className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
  };

  const handleSettingsClick = () => {
    preferencesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6 px-2 sm:px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
          <div className="w-full md:w-auto">
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0
                ? `${unreadCount} unread notification${
                    unreadCount !== 1 ? "s" : ""
                  }`
                : "All caught up!"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full md:w-auto md:justify-end">
            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="w-full sm:w-auto"
            >
              Mark All Read
            </Button>
            <Button
              variant="outline"
              onClick={handleSettingsClick}
              className="w-full sm:w-auto"
            >
              Notification Settings
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {paginatedNotifications.length > 0 ? (
            paginatedNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                  !notification.is_read
                    ? "border-l-4 border-l-blue-500 bg-blue-50/30"
                    : ""
                }`}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex flex-row items-start gap-4 w-full">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3
                            className={`font-semibold truncate ${
                              !notification.is_read
                                ? "text-gray-900"
                                : "text-gray-700"
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                            {getPriorityBadge(notification.priority)}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2 break-words">
                          {notification.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 w-full sm:w-auto mt-2 sm:mt-0"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white border border-gray-200 rounded-lg">
              <CardContent className="p-6 text-center text-gray-500">
                No notifications to display
              </CardContent>
            </Card>
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
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </DashboardLayout>
  );
}
