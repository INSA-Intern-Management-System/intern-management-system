"use client"

import React, { useRef } from "react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Bell, CheckCircle, Clock, MessageSquare, FileText, Calendar, Settings } from "lucide-react"

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: "feedback",
      title: "New Feedback Received",
      message: "Sarah Wilson provided feedback on your Week 2 report",
      time: "2 hours ago",
      read: false,
      priority: "high",
    },
    {
      id: 2,
      type: "deadline",
      title: "Report Due Tomorrow",
      message: "Week 3 weekly report is due tomorrow at 11:59 PM",
      time: "1 day ago",
      read: false,
      priority: "high",
    },
    {
      id: 3,
      type: "meeting",
      title: "Meeting Scheduled",
      message: "Mentor meeting scheduled for Friday at 2:00 PM",
      time: "2 days ago",
      read: true,
      priority: "medium",
    },
    {
      id: 4,
      type: "application",
      title: "Application Status Update",
      message: "Your application to Tech Corp has been accepted",
      time: "3 days ago",
      read: true,
      priority: "high",
    },
    {
      id: 5,
      type: "system",
      title: "Profile Updated",
      message: "Your profile information has been successfully updated",
      time: "1 week ago",
      read: true,
      priority: "low",
    },
  ]

  const preferencesRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = React.useState(1);
  const pageSize = 3;
  const totalPages = Math.ceil(notifications.length / pageSize);
  const paginatedNotifications = notifications.slice((page - 1) * pageSize, page * pageSize);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "feedback":
        return <MessageSquare className="h-5 w-5 text-blue-600" />
      case "deadline":
        return <Clock className="h-5 w-5 text-red-600" />
      case "meeting":
        return <Calendar className="h-5 w-5 text-purple-600" />
      case "application":
        return <FileText className="h-5 w-5 text-green-600" />
      case "system":
        return <Settings className="h-5 w-5 text-gray-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleSettingsClick = () => {
    preferencesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Stay updated with important information</p>
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
              className={`hover:shadow-md transition-shadow ${
                !notification.read ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`font-semibold ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-sm text-gray-500">{notification.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {!notification.read && (
                      <Button variant="outline" size="sm">
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
              <PaginationPrevious href="#" onClick={e => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }} />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={page === i + 1}
                  onClick={e => { e.preventDefault(); setPage(i + 1); }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={e => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        {/* Notification Preferences */}
        <Card ref={preferencesRef}>
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
    </DashboardLayout>
  )
}
