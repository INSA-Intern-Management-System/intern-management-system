"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Bell,
  Plus,
  Send,
  Users,
  Building2,
  University,
  GraduationCap,
  Shield,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"

export default function AdminNotifications() {
  const [user, setUser] = useState<any>(null)
  const [isCreateNotificationOpen, setIsCreateNotificationOpen] = useState(false)
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const router = useRouter()
  // Mock data
  const notifications = [
    {
      id: 1,
      title: "System Maintenance Scheduled",
      message: "The system will be under maintenance tonight from 2 AM to 4 AM.",
      type: "warning",
      recipients: ["all"],
      status: "sent",
      createdAt: "2024-01-15T10:00:00Z",
      sentAt: "2024-01-15T10:05:00Z",
      readCount: 142,
      totalRecipients: 156,
    },
    {
      id: 2,
      title: "New Feature: Video Interviews",
      message: "We've added video interview functionality for companies to interview candidates remotely.",
      type: "info",
      recipients: ["company"],
      status: "sent",
      createdAt: "2024-01-14T14:30:00Z",
      sentAt: "2024-01-14T14:35:00Z",
      readCount: 18,
      totalRecipients: 23,
    },
    {
      id: 3,
      title: "Report Submission Reminder",
      message: "Don't forget to submit your weekly internship reports by Friday.",
      type: "info",
      recipients: ["student"],
      status: "sent",
      createdAt: "2024-01-13T09:00:00Z",
      sentAt: "2024-01-13T09:00:00Z",
      readCount: 78,
      totalRecipients: 89,
    },
    {
      id: 4,
      title: "Security Update Required",
      message: "Please update your passwords to comply with new security policies.",
      type: "alert",
      recipients: ["all"],
      status: "draft",
      createdAt: "2024-01-15T16:00:00Z",
      sentAt: null,
      readCount: 0,
      totalRecipients: 156,
    },
    {
      id: 5,
      title: "Evaluation Deadline Approaching",
      message: "University supervisors: Please complete student evaluations by January 20th.",
      type: "warning",
      recipients: ["university"],
      status: "scheduled",
      createdAt: "2024-01-15T11:00:00Z",
      sentAt: null,
      readCount: 0,
      totalRecipients: 12,
    },
  ]
  const [page, setPage] = useState(1)
  const pageSize = 4
  const totalPages = Math.ceil(notifications.length / pageSize)
  const paginatedNotifications = notifications.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== "admin") {
        router.push("/login")
        return
      }
      setUser(parsedUser)
    } else {
      router.push("/login")
    }
  }, [router])

  if (!user) return null

  const recipientOptions = [
    { value: "all", label: "All Users", icon: Users, count: 156 },
    { value: "student", label: "Students", icon: GraduationCap, count: 89 },
    { value: "company", label: "Companies", icon: Building2, count: 23 },
    { value: "university", label: "Universities", icon: University, count: 12 },
    { value: "admin", label: "Administrators", icon: Shield, count: 4 },
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "info":
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "alert":
        return <Badge className="bg-red-100 text-red-800">Alert</Badge>
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-100 text-green-800">Sent</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRecipientBadge = (recipients: string[]) => {
    if (recipients.includes("all")) {
      return <Badge variant="outline">All Users</Badge>
    }
    return recipients.map((recipient) => {
      const option = recipientOptions.find((opt) => opt.value === recipient)
      return (
        <Badge key={recipient} variant="outline">
          {option?.label}
        </Badge>
      )
    })
  }

  const handleRecipientChange = (recipient: string, checked: boolean) => {
    if (checked) {
      setSelectedRecipients([...selectedRecipients, recipient])
    } else {
      setSelectedRecipients(selectedRecipients.filter((r) => r !== recipient))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Send and manage system notifications</p>
          </div>
          <Dialog open={isCreateNotificationOpen} onOpenChange={setIsCreateNotificationOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Notification</DialogTitle>
                <DialogDescription>Send a notification to selected user groups</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Notification title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Notification message" rows={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select notification type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Recipients</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {recipientOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={option.value}
                            checked={selectedRecipients.includes(option.value)}
                            onCheckedChange={(checked) => handleRecipientChange(option.value, checked as boolean)}
                          />
                          <Label htmlFor={option.value} className="flex items-center space-x-2 cursor-pointer">
                            <Icon className="h-4 w-4" />
                            <span>{option.label}</span>
                            <Badge variant="outline">{option.count}</Badge>
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateNotificationOpen(false)}>
                  Save as Draft
                </Button>
                <Button onClick={() => setIsCreateNotificationOpen(false)}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Now
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
            <CardDescription>Manage and track all system notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedNotifications.map((notification) => (
                <div key={notification.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getTypeIcon(notification.type)}
                        <h3 className="font-semibold">{notification.title}</h3>
                        {getTypeBadge(notification.type)}
                        {getStatusBadge(notification.status)}
                      </div>
                      <p className="text-gray-600 mb-3">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Created: {formatDate(notification.createdAt)}</span>
                        {notification.sentAt && <span>Sent: {formatDate(notification.sentAt)}</span>}
                        <div className="flex items-center space-x-1">
                          <span>Recipients:</span>
                          {getRecipientBadge(notification.recipients)}
                        </div>
                        {notification.status === "sent" && (
                          <span>
                            Read: {notification.readCount}/{notification.totalRecipients} (
                            {Math.round((notification.readCount / notification.totalRecipients) * 100)}%)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {notification.status === "draft" && (
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {paginatedNotifications.length === 0 && (
                <div className="text-center text-gray-500 py-8">No notifications found.</div>
              )}
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
