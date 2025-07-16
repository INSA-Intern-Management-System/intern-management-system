"use client";

import React, { useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Bell,
  CheckCircle,
  // Clock,
  MessageSquare,
  FileText,
  Calendar,
  Settings,
  AlertTriangle,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: string;
  actionRequired: boolean;
};

export default function CompanyNotificationsPage() {
  const notifications: Notification[] = [
    {
      id: 1,
      type: "application",
      title: "New Internship Application",
      message: "Marie Dubois applied for Software Developer position",
      time: "30 minutes ago",
      read: false,
      priority: "high",
      actionRequired: true,
    },
    {
      id: 2,
      type: "report",
      title: "Weekly Report Submitted",
      message:
        "Sophie Laurent submitted Week 8 report for Mobile App Redesign project",
      time: "2 hours ago",
      read: false,
      priority: "medium",
      actionRequired: true,
    },
    {
      id: 3,
      type: "leave",
      title: "Leave Request Pending",
      message: "Pierre Martin requested 1 day personal leave for February 20th",
      time: "4 hours ago",
      read: true,
      priority: "medium",
      actionRequired: true,
    },
    {
      id: 4,
      type: "deadline",
      title: "Report Review Deadline",
      message: "3 weekly reports are pending review and due for feedback",
      time: "1 day ago",
      read: false,
      priority: "high",
      actionRequired: true,
    },
    {
      id: 5,
      type: "system",
      title: "Intern Onboarding Reminder",
      message:
        "Lucas Bernard's internship starts tomorrow - prepare onboarding materials",
      time: "1 day ago",
      read: true,
      priority: "medium",
      actionRequired: false,
    },
    {
      id: 6,
      type: "message",
      title: "New Message from Intern",
      message: "Marie Dubois sent a message about API integration issues",
      time: "2 days ago",
      read: true,
      priority: "low",
      actionRequired: false,
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "application":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "report":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "leave":
        return <Calendar className="h-5 w-5 text-purple-600" />;
      case "deadline":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case "system":
        return <Settings className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Medium Priority
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-green-100 text-green-800">Low Priority</Badge>
        );
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const preferencesRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const totalPages = Math.ceil(notifications.length / pageSize);
  const paginatedNotifications = notifications.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  // const handleSettingsClick = () => {
  //   preferencesRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

  return (
    <DashboardLayout requiredRole="company">
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
            <Button variant="outline">Mark All Read</Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {paginatedNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                !notification.read
                  ? "border-l-4 border-l-blue-500 bg-blue-50/30"
                  : ""
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
                            !notification.read
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                        {getPriorityBadge(notification.priority)}
                      </div>
                      <p className="text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-500">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {!notification.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300"
                        aria-label="Mark as read"
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Pagination */}
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
                aria-label="Previous page"
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
                  aria-label={`Page ${i + 1}`}
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
                aria-label="Next page"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

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
        <Card
          ref={preferencesRef}
          className="bg-white border border-gray-200 rounded-lg"
        >
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Choose how you want to be notified
            </CardDescription>
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
    </DashboardLayout>
  );
}
