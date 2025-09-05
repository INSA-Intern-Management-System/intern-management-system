"use client";

import { User } from "@/types/entities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, GraduationCap, Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface Stat {
  title: string;
  value: string;
  change: string;
  icon: string;
  color: string;
  bgColor: string;
}

interface RecentActivity {
  id: number;
  title: string;
  description: string;
  time: string;
}

interface UniversityDashboardClientProps {
  user: User;
  stats: Stat[];
  recentActivities: RecentActivity[];
}

const iconMap = {
  Users: Users,
  GraduationCap: GraduationCap,
  CheckCircle: CheckCircle,
  Star: Star,
};

export default function UniversityDashboardClient({
  stats,
  recentActivities,
}: UniversityDashboardClientProps) {
  const router = useRouter();

  const goToStudents = () => router.push('/dashboard/university/students');
  const goToSupervisors = () => router.push('/dashboard/university/supervisors');
  const goToPerformance = () => router.push('/dashboard/university/performance');

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">University Dashboard</h1>
          <p className="text-gray-600">Welcome back</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const IconComponent = iconMap[stat.icon as keyof typeof iconMap];
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* Recent Activities */}

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest updates from your internship program</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activities</p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <button onClick={goToStudents} className="w-full text-left">
                <Users className="h-7 w-7 text-blue-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Manage Students</h3>
                <p className="text-sm text-gray-600">View and manage student records</p>
              </button>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <button onClick={goToSupervisors} className="w-full text-left">
                <GraduationCap className="h-7 w-7 text-purple-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Manage Supervisors </h3>
                <p className="text-sm text-gray-600">View and manage Supervisors records</p>
              </button>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <button onClick={goToPerformance} className="w-full text-left">
                <Star className="h-7 w-7 text-green-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Performance Report</h3>
                <p className="text-sm text-gray-600">Generate performance reports</p>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}