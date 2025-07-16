"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { FileText, MessageSquare, Calendar, Bell, Send, CheckCircle, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

export default function StudentDashboard() {
  const router = useRouter();
  // Mock data
  const stats = {
    supervisor: "Dr. Smith",
    mentor: "Sarah Wilson",
    reportsSubmitted: 2,
    totalReports: 3,
    attendance: 92,
  }

  const recentActivity = [
    { id: 1, type: "feedback", message: "New feedback received for Week 2 report", time: "2 hours ago" },
    { id: 2, type: "deadline", message: "Week 3 report due tomorrow", time: "1 day ago" },
    { id: 3, type: "meeting", message: "Meeting scheduled with mentor", time: "2 days ago" },
    { id: 4, type: "application", message: "Application accepted by Tech Corp", time: "3 days ago" },
  ]

  const upcomingTasks = [
    { id: 1, task: "Submit Week 3 Report", due: "Tomorrow", priority: "high" },
    { id: 2, task: "Mentor Meeting", due: "Friday", priority: "medium" },
    { id: 3, task: "Monthly Evaluation", due: "Next Week", priority: "low" },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your internship overview.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Name of Supervisor</p>
                  <p className="text-2xl font-bold">{stats.supervisor}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Name of Mentor</p>
                  <p className="text-2xl font-bold">{stats.mentor}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reports</p>
                  <p className="text-2xl font-bold">
                    {stats.reportsSubmitted}/{stats.totalReports}
                  </p>
                </div>
                <Send className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Attendance</p>
                  <p className="text-2xl font-bold">{stats.attendance}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Upcoming Tasks
              </CardTitle>
              <CardDescription>Tasks that need your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{task.task}</p>
                      <p className="text-sm text-gray-600">Due: {task.due}</p>
                    </div>
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used actions for easy access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="h-20 flex-col space-y-2" onClick={() => router.push('/dashboard/student/applications')}>
                <FileText className="h-6 w-6" />
                <span>New Plan & Task</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent" onClick={() => router.push('/dashboard/student/reports')}>
                <Send className="h-6 w-6" />
                <span>Submit Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent" onClick={() => router.push('/dashboard/student/messages')}>
                <MessageSquare className="h-6 w-6" />
                <span>Send Message</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent" onClick={() => router.push('/dashboard/student/leave')}>
                <Calendar className="h-6 w-6" />
                <span>Request Leave</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
