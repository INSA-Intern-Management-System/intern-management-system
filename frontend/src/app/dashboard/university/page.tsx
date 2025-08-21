"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation" 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, CheckCircle, University, Star, GraduationCap, TrendingUp } from "lucide-react"
import  DashboardLayout  from "@/app/layout/dashboard-layout"

export default function UniversityDashboard() {
  const [user, setUser] = useState<any>(null);
    const router = useRouter();

    setUser({
      "organization":"ASTU"
    })
  // useEffect(() => {
  //   const userData = localStorage.getItem("user")
  //   if (userData) {
  //     setUser(JSON.parse(userData))
  //   }
  // }, [])

  // if (!user) return null

  // Mock data for dashboard overview
  const stats = [
    {
      title: "Active Interns",
      value: "24",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Supervisors",
      value: "8",
      change: "+2",
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Completed Internships",
      value: "156",
      change: "+23%",
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Average Rating",
      value: "4.6",
      change: "+0.3",
      icon: Star,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      title: "evaluation",
      description: "New evaluation submitted for John Doe at Tech Corp",
      time: "2 hours ago",
      // status: "pending",
    },
    {
      id: 2,
      title: "assignment",
      description: "Dr. Smith assigned as supervisor for 3 new students",
      time: "4 hours ago",
      // status: "completed",
    },
    {
      id: 3,
      title: "report",
      description: "Weekly report submitted by Jane Smith",
      time: "1 day ago",
      // status: "completed",
    },
    {
      id: 4,
     title: "application",
     description: "New internship application requires supervisor assignment",
      time: "2 days ago",
      // status: "pending",
    },
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      title: "Mid-term Evaluations Due",
      date: "March 15, 2024",
      type: "evaluation",
      priority: "high",
    },
    {
      id: 2,
      title: "Supervisor Meeting",
      date: "March 12, 2024",
      type: "meeting",
      priority: "medium",
    },
    {
      id: 3,
      title: "Final Report Submissions",
      date: "March 20, 2024",
      type: "report",
      priority: "high",
    },
  ];
function goMessage() {

  router.push('/dashboard/university/students');
}
function goMessage1() {

  router.push('/dashboard/university/evaluations');
}
function goMessage2() {

  router.push('/dashboard/university/performance');
}
  return (
    <DashboardLayout requiredRole="university" >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">University Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.organization}</p>
          </div>
          <div className="flex items-center space-x-2">
            <University className="h-8 w-8 text-purple-600" />
          </div>
        </div>

   
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Latest updates from your internship program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                    {/* <Badge
                      variant={activity.status === "pending" ? "secondary" : "default"}
                    <Badge
                      variant={
                        activity.status === "pending" ? "secondary" : "default"
                      }
                      className={
                        activity.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                      }
                    >
                      {activity.status}
                    </Badge> */}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Important dates and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {deadline.title}
                      </p>
                      <p className="text-xs text-gray-500">{deadline.date}</p>
                    </div>
                    <Badge
                      variant={
                        deadline.priority === "high"
                          ? "destructive"
                          : "secondary"
                      }
                      className={
                        deadline.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }
                    >
                      {deadline.priority}
                    </Badge>
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
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <button onClick={goMessage} ><Users className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Assign Supervisor</h3>
                <p className="text-sm text-gray-600">Assign supervisors to new students</p>
              </button></div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-semibold text-gray-900">
                  Assign Supervisor
                </h3>
                <p className="text-sm text-gray-600">
                  Assign supervisors to new students
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <button onClick={goMessage1} ><CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Review Evaluations</h3>
                <p className="text-sm text-gray-600">Review pending evaluations</p>
             </button> </div>
             <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-semibold text-gray-900">
                  Review Evaluations
                </h3>
                <p className="text-sm text-gray-600">
                  Review pending evaluations
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <button onClick={goMessage2} ><Star className="h-8 w-8 text-orange-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Performance Report</h3>
                <p className="text-sm text-gray-600">Generate performance reports</p>
             </button> </div>
             <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <Star className="h-8 w-8 text-orange-600 mb-2" />
                <h3 className="font-semibold text-gray-900">
                  Performance Report
                </h3>
                <p className="text-sm text-gray-600">
                  Generate performance reports
                </p>
              </div>
              
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
