"use client";

import { User } from "@/types/entities";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/app/layout/dashboard-layout";
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
import Link from "next/link";

interface CompanyStats {
  applications: number;
  activeInterns: number;
  activeProjects: number;
  pendingReports: number;
}

interface Activity {
  id: number;
  type: string;
  message: string;
  time: string;
}

interface Task {
  id: number;
  task: string;
  count: number;
  priority: "high" | "medium" | "low";
}

interface Intern {
  id: number;
  name: string;
  position: string;
  progress: number;
  rating: number;
}

interface CompanyDashboardClientProps {
  user: User;
  stats: CompanyStats;
  recentActivity: Activity[];
  upcomingTasks: Task[];
  topInterns: Intern[];
}

export default function CompanyDashboardClient({
  user,
  stats,
  recentActivity,
  upcomingTasks,
  topInterns,
}: CompanyDashboardClientProps) {
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Company Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user.firstName || "Manager"}! Here is your internship program overview.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Applications
                </p>
                <p className="text-2xl font-bold">{stats.applications}</p>
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
                  Active Interns
                </p>
                <p className="text-2xl font-bold">{stats.activeInterns}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Projects
                </p>
                <p className="text-2xl font-bold">{stats.activeProjects}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Reports
                </p>
                <p className="text-2xl font-bold">{stats.pendingReports}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
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
              Latest updates from your internship program
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
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border hover:bg-blue-50 transition-colors"
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
                    <div>
                      <p className="font-medium">{task.task}</p>
                      <p className="text-sm text-gray-600">
                        {task.count} item(s)
                      </p>
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

      {/* Top Performing Interns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Top Performing Interns
          </CardTitle>
          <CardDescription>
            Your highest-rated interns this month
          </CardDescription>
        </CardHeader>
        {topInterns.length === 0 ? (
          <CardContent className="text-center text-gray-500">
            No top interns found.
          </CardContent>
        ) : (
          <CardContent>
            <div className="space-y-4">
              {topInterns.map((intern) => (
                <div
                  key={intern.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-blue-50 transition-colors"
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
        )}
      </Card>

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
            <Link href="/dashboard/company/applications" passHref legacyBehavior>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 bg-transparent hover:bg-blue-100 cursor-pointer"
              >
                <FileText className="h-8 w-8 text-blue-600" />
                <span>Review Applications</span>
              </Button>
            </Link>
            <Link href="/dashboard/company/projects" passHref legacyBehavior>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 bg-transparent hover:bg-blue-100 cursor-pointer"
              >
                <Plus className="h-8 w-8 text-purple-600" />
                <span>Add Project</span>
              </Button>
            </Link>
            <Link href="/dashboard/company/messages" passHref legacyBehavior>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 bg-transparent hover:bg-blue-100 cursor-pointer"
              >
                <MessageSquare className="h-8 w-8 text-green-600" />
                <span>Message Interns</span>
              </Button>
            </Link>
            <Link href="/dashboard/company/reports" passHref legacyBehavior>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 bg-transparent hover:bg-blue-100 cursor-pointer"
              >
                <CheckCircle className="h-8 w-8 text-orange-600" />
                <span>Evaluate Reports</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}