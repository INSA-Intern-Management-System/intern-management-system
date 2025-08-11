"use client";

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
  FileText,
  MessageSquare,
  Calendar,
  Bell,
  Send,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
  // const router = useRouter();
  // Mock data
  const stats = {
    supervisor: "Dr. Smith",
    mentor: "Sarah Wilson",
    reportsSubmitted: 2,
    totalReports: 3,
    attendance: 92,
  };

  const recentActivity = [
    {
      id: 1,
      title: "feedback",
      description: "New feedback received for Week 2 report",
      time: "2 hours ago",
    },
    {
      id: 2,
      title: "deadline",
      description: "Week 3 report due tomorrow",
      time: "1 day ago",
    },
    {
      id: 3,
      title: "meeting",
      description: "Meeting scheduled with mentor",
      time: "2 days ago",
    },
    {
      id: 4,
      title: "application",
      description: "Application accepted by Tech Corp",
      time: "3 days ago",
    },
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: "Submit Week 3 Report",
      description: "This is just the description for each task.",
      due_date: "Tomorrow",
      priority: "high",
    },
    {
      id: 2,
      title: "Mentor Meeting",
      description: "This is just the description for each task.",
      due_date: "Friday",
      priority: "medium",
    },
    {
      id: 3,
      title: "Monthly Evaluation",
      description: "This is just the description for each task.",
      due_date: "Next Week",
      priority: "low",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's your internship overview.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Name of Supervisor
                  </p>
                  <p className="text-2xl font-bold">{stats.supervisor}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Name of Project Manager
                  </p>
                  <p className="text-2xl font-bold">{stats.mentor}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 transition-transform">
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

          <Card className="hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Attendance
                  </p>
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
              <CardDescription>
                Your latest updates and notifications
              </CardDescription>
            </CardHeader>
            {recentActivity.length === 0 ? (
              <CardContent className="text-center text-gray-500">
                No recent activity found.
              </CardContent>
            ) : (
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 bg-gray-50 border-2 border-blue-100 p-3 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1 ">
                        <h1 className="font-bold">{activity.title}</h1>
                        <p className="text-sm font-medium">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-700" />
                Upcoming Tasks
              </CardTitle>
              <CardDescription>Tasks that need your attention</CardDescription>
            </CardHeader>
            {upcomingTasks.length === 0 ? (
              <CardContent className="text-center text-gray-500">
                No upcoming tasks found.
              </CardContent>
            ) : (
              <CardContent>
                <div className="space-y-4">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-blue-50 transition-colors"
                    >
                      <div className="task-desc flex flex-col">
                        <div>
                          <h1 className="font-bold">{task.title}</h1>
                          <p className="text-sm font-medium">
                            {task.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {task.due_date}
                          </p>
                        </div>
                      </div>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used actions for easy access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/dashboard/student/plans" passHref legacyBehavior>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2 bg-transparent hover:bg-blue-100 cursor-pointer"
                >
                  <FileText className="h-8 w-8 text-blue-600" />
                  <span>New Plan & Task</span>
                </Button>
              </Link>
              <Link href="/dashboard/student/reports" passHref legacyBehavior>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2 bg-transparent hover:bg-blue-100 cursor-pointer"
                >
                  <Send className="h-8 w-8 text-green-600" />
                  <span>Submit Report</span>
                </Button>
              </Link>
              <Link href="/dashboard/student/messages" passHref legacyBehavior>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2 bg-transparent hover:bg-blue-100 cursor-pointer"
                >
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                  <span>Send Message</span>
                </Button>
              </Link>
              <Link href="/dashboard/student/leave" passHref legacyBehavior>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2 bg-transparent hover:bg-blue-100 cursor-pointer"
                >
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <span>Request Leave</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
