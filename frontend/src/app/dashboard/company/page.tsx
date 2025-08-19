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
import { DashboardLayout } from "@/app/layout/dashboard-layout";
import {
  Users,
  FileText,
  MessageSquare,
  Bell,
  Plus,
  CheckCircle,
  Clock,
  Building2,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CompanyDashboard() {
  const router = useRouter();
  // Mock data
  const stats = {
    applications: 8,
    activeInterns: 5,
    activeProjects: 3,
    pendingReports: 2,
  };

  const recentActivity = [
    {
      id: 1,
      type: "application",
      message:
        "New application from Marie Dubois for Software Developer position",
      time: "1 hour ago",
    },
    {
      id: 2,
      type: "report",
      message: "Weekly report submitted by John Smith",
      time: "3 hours ago",
    },
    {
      id: 3,
      type: "intern",
      message: "Alice Brown started her internship today",
      time: "1 day ago",
    },
    {
      id: 4,
      type: "project",
      message: "E-commerce Platform project milestone completed",
      time: "2 days ago",
    },
  ];

  const upcomingTasks = [
    { id: 1, task: "Review pending applications", count: 3, priority: "high" },
    { id: 2, task: "Evaluate weekly reports", count: 2, priority: "medium" },
    { id: 3, task: "Schedule mentor meetings", count: 1, priority: "low" },
  ];

  const topInterns = [
    {
      id: 1,
      name: "John Smith",
      position: "Software Developer",
      progress: 85,
      rating: 4.8,
    },
    {
      id: 2,
      name: "Alice Brown",
      position: "Data Analyst",
      progress: 78,
      rating: 4.6,
    },
    {
      id: 3,
      name: "Mike Johnson",
      position: "UI/UX Designer",
      progress: 92,
      rating: 4.9,
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
    <DashboardLayout requiredRole="company">
      <div className="space-y-8 bg-gray-50 min-h-screen p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Company Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back! Here is your internship program overview.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 border-gray-200 shadow-sm rounded-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Applications
                  </p>
                  <p className="text-3xl font-bold">{stats.applications}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 shadow-sm rounded-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Interns
                  </p>
                  <p className="text-3xl font-bold">{stats.activeInterns}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 shadow-sm rounded-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Projects
                  </p>
                  <p className="text-3xl font-bold">{stats.activeProjects}</p>
                </div>
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 shadow-sm rounded-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Reports
                  </p>
                  <p className="text-3xl font-bold">{stats.pendingReports}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="border-2 border-gray-200 shadow-sm rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates from your internship program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="border-2 border-gray-200 shadow-sm rounded-xl bg-white">
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
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{task.task}</p>
                      <p className="text-sm text-gray-600">
                        {task.count} item(s)
                      </p>
                    </div>
                    <Badge
                      className={
                        getPriorityColor(task.priority) +
                        " px-3 py-1 rounded-full text-xs font-semibold"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Interns */}
        <Card className="border-2 border-gray-200 shadow-sm rounded-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Top Performing Interns
            </CardTitle>
            <CardDescription>
              Your highest-rated interns this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topInterns.map((intern) => (
                <div
                  key={intern.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{intern.name}</h4>
                      <p className="text-sm text-gray-600">{intern.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {intern.progress}% Complete
                      </p>
                      <p className="text-sm text-gray-600">
                        ⭐ {intern.rating}/5.0
                      </p>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${intern.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-2 border-gray-200 shadow-sm rounded-xl bg-white">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used actions for easy access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                className="h-24 flex-col space-y-2 rounded-lg text-base font-medium border border-gray-200 bg-black text-white hover:bg-gray-900 hover:text-white transition-all duration-150"
                style={{ boxShadow: "none" }}
                onClick={() => router.push("/dashboard/company/applications")}
              >
                <FileText className="h-6 w-6 mb-1" />
                <span>Review Applications</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col space-y-2 rounded-lg text-base font-medium border border-gray-200 bg-white text-black hover:bg-gray-100 hover:text-black transition-all duration-150"
                style={{ boxShadow: "none" }}
                onClick={() => router.push("/dashboard/company/projects")}
              >
                <Plus className="h-6 w-6 mb-1" />
                <span>Add Project</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col space-y-2 rounded-lg text-base font-medium border border-gray-200 bg-white text-black hover:bg-gray-100 hover:text-black transition-all duration-150"
                style={{ boxShadow: "none" }}
                onClick={() => router.push("/dashboard/company/messages")}
              >
                <MessageSquare className="h-6 w-6 mb-1" />
                <span>Message Interns</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col space-y-2 rounded-lg text-base font-medium border border-gray-200 bg-white text-black hover:bg-gray-100 hover:text-black transition-all duration-150"
                style={{ boxShadow: "none" }}
                onClick={() => router.push("/dashboard/company/reports")}
              >
                <CheckCircle className="h-6 w-6 mb-1" />
                <span>Evaluate Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
