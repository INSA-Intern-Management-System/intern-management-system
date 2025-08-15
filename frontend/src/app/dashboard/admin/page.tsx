"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  Bell,
  GraduationCap,
  Building2,
  University,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/layout/dashboard-layout";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "admin") {
        router.push("/login");
        return;
      }
      setUser(parsedUser);
    } else {
      router.push("/login");
    }
  }, [router]);

  if (!user) return null;

  // Mock data
  const systemStats = {
    totalUsers: 156,
    activeUsers: 142,
    pendingApprovals: 8,
    totalInternships: 45,
    studentsCount: 89,
    companiesCount: 23,
    universitiesCount: 12,
    adminsCount: 4,
  };

  const recentActivities = [
    {
      id: 1,
      type: "user_registration",
      message: "New company Tech Corp registered",
      timestamp: "2 hours ago",
      status: "pending",
    },
    {
      id: 2,
      type: "internship_application",
      message: "Student John Doe applied for internship at Innovation Labs",
      timestamp: "4 hours ago",
      status: "active",
    },
    {
      id: 3,
      type: "evaluation_submitted",
      message: "Company evaluation submitted for student Jane Smith",
      timestamp: "6 hours ago",
      status: "completed",
    },
    {
      id: 4,
      type: "system_alert",
      message: "System maintenance scheduled for tonight",
      timestamp: "1 day ago",
      status: "warning",
    },
  ];

  const pendingActions = [
    {
      id: 1,
      title: "Company Approvals",
      count: 5,
      description: "New companies waiting for approval",
      priority: "high",
    },
    {
      id: 2,
      title: "User Verifications",
      count: 12,
      description: "User accounts pending verification",
      priority: "medium",
    },
    {
      id: 3,
      title: "System Updates",
      count: 3,
      description: "Critical system updates available",
      priority: "high",
    },
    {
      id: 4,
      title: "Report Reviews",
      count: 8,
      description: "Internship reports awaiting review",
      priority: "low",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registration":
        return <Users className="h-4 w-4" />;
      case "internship_application":
        return <GraduationCap className="h-4 w-4" />;
      case "evaluation_submitted":
        return <CheckCircle className="h-4 w-4" />;
      case "system_alert":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "warning":
        return <Badge className="bg-red-100 text-red-800">Warning</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and management</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold">{systemStats.totalUsers}</p>
                  <p className="text-xs text-green-600">+12% from last month</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Users
                  </p>
                  <p className="text-2xl font-bold">
                    {systemStats.activeUsers}
                  </p>
                  <p className="text-xs text-green-600">91% active rate</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Approvals
                  </p>
                  <p className="text-2xl font-bold">
                    {systemStats.pendingApprovals}
                  </p>
                  <p className="text-xs text-orange-600">Requires attention</p>
                </div>
                <Bell className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Breakdown of users by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <span>Students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">
                      {systemStats.studentsCount}
                    </span>
                    <Badge className="bg-blue-100 text-blue-800">57%</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-green-600" />
                    <span>Companies</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">
                      {systemStats.companiesCount}
                    </span>
                    <Badge className="bg-green-100 text-green-800">15%</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <University className="h-5 w-5 text-purple-600" />
                    <span>Universities</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">
                      {systemStats.universitiesCount}
                    </span>
                    <Badge className="bg-purple-100 text-purple-800">8%</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    <span>Admins</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">
                      {systemStats.adminsCount}
                    </span>
                    <Badge className="bg-red-100 text-red-800">3%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Actions</CardTitle>
              <CardDescription>Items requiring admin attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingActions.map((action) => (
                  <div
                    key={action.id}
                    className={`border-l-4 pl-4 ${getPriorityColor(
                      action.priority
                    )}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{action.title}</h4>
                        <p className="text-sm text-gray-600">
                          {action.description}
                        </p>
                      </div>
                      <Badge variant="outline">{action.count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>
                  Latest system activities and events
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="font-medium">{activity.message}</p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(activity.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                className="h-20 flex-col space-y-2 bg-transparent"
                variant="outline"
                onClick={() => router.push("/dashboard/admin/users")}
              >
                <Users className="h-6 w-6" />
                <span>Manage Users</span>
              </Button>
              <Button
                className="h-20 flex-col space-y-2 bg-transparent"
                variant="outline"
                onClick={() => router.push("/dashboard/admin/roles")}
              >
                <Shield className="h-6 w-6" />
                <span>Role Settings</span>
              </Button>
              <Button
                className="h-20 flex-col space-y-2 bg-transparent"
                variant="outline"
                onClick={() => router.push("/dashboard/admin/notifications")}
              >
                <Bell className="h-6 w-6" />
                <span>Send Notification</span>
              </Button>
              <Button
                className="h-20 flex-col space-y-2 bg-transparent"
                variant="outline"
                onClick={() => router.push("/dashboard/admin/settings")}
              >
                <TrendingUp className="h-6 w-6" />
                <span>View Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
