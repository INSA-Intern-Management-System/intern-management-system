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
  UserCheck,
  Briefcase,
  UserCog,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  completedUsers: number;
  totalInternships: number;
  studentsCount: number;
  companiesCount: number;
  universitiesCount: number;
  adminsCount: number;
  supervisorsCount: number;
  projectManagersCount: number;
}

interface RecentActivity {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  status: string;
}

interface PendingAction {
  id: number;
  title: string;
  count: number;
  description: string;
  priority: string;
}

interface AdminDashboardClientProps {
  user: User;
  systemStats: SystemStats;
  recentActivities: RecentActivity[];
  pendingActions: PendingAction[];
}

export default function AdminDashboardClient({
  systemStats,
  recentActivities,
  pendingActions,
}: AdminDashboardClientProps) {
  const router = useRouter();

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and management</p>
      </div>

      {/* Quick Stats - Updated to 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{systemStats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{systemStats.activeUsers}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Users</p>
                <p className="text-2xl font-bold">{systemStats.completedUsers}</p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold">{systemStats.pendingApprovals}</p>
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
                  <span className="font-semibold">{systemStats.studentsCount}</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {Math.round((systemStats.studentsCount / systemStats.totalUsers) * 100)}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-green-600" />
                  <span>Companies (HR)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{systemStats.companiesCount}</span>
                  <Badge className="bg-green-100 text-green-800">
                    {Math.round((systemStats.companiesCount / systemStats.totalUsers) * 100)}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <University className="h-5 w-5 text-purple-600" />
                  <span>Universities</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{systemStats.universitiesCount}</span>
                  <Badge className="bg-purple-100 text-purple-800">
                    {Math.round((systemStats.universitiesCount / systemStats.totalUsers) * 100)}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCog className="h-5 w-5 text-orange-600" />
                  <span>Supervisors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{systemStats.supervisorsCount}</span>
                  <Badge className="bg-orange-100 text-orange-800">
                    {Math.round((systemStats.supervisorsCount / systemStats.totalUsers) * 100)}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                  <span>Project Managers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{systemStats.projectManagersCount}</span>
                  <Badge className="bg-indigo-100 text-indigo-800">
                    {Math.round((systemStats.projectManagersCount / systemStats.totalUsers) * 100)}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span>Admins</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{systemStats.adminsCount}</span>
                  <Badge className="bg-red-100 text-red-800">
                    {Math.round((systemStats.adminsCount / systemStats.totalUsers) * 100)}%
                  </Badge>
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
                  className={`border-l-4 pl-4 ${getPriorityColor(action.priority)}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{action.title}</h4>
                      <p className="text-sm text-gray-600">{action.description}</p>
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
              <CardDescription>Latest system activities and events</CardDescription>
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
  );
}