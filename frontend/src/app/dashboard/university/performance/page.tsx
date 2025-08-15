"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { DashboardLayout } from "@/app/layout/dashboard-layout";
import {
  User,
  Search,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function PerformancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [supervisorFilter, setSupervisorFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 3;

  // Mock data
  const performanceData = [
    {
      id: 1,
      student: "John Doe",
      company: "Tech Corp",
      supervisor: "Dr. Smith",
      attendance: 95,
      weeklyReports: { submitted: 8, total: 8 },
      companyFeedback: "Excellent",
      academicGrade: "A",
      overallScore: 92,
      trend: "up",
      lastUpdate: "2024-03-10",
    },
    {
      id: 2,
      student: "Jane Smith",
      company: "Innovation Labs",
      supervisor: "Dr. Johnson",
      attendance: 98,
      weeklyReports: { submitted: 8, total: 8 },
      companyFeedback: "Outstanding",
      academicGrade: "A+",
      overallScore: 96,
      trend: "up",
      lastUpdate: "2024-03-09",
    },
    {
      id: 3,
      student: "Mike Johnson",
      company: "StartupXYZ",
      supervisor: "Dr. Brown",
      attendance: 92,
      weeklyReports: { submitted: 7, total: 8 },
      companyFeedback: "Good",
      academicGrade: "B+",
      overallScore: 85,
      trend: "down",
      lastUpdate: "2024-03-08",
    },
    {
      id: 4,
      student: "Sarah Wilson",
      company: "Digital Agency",
      supervisor: "Dr. Davis",
      attendance: 88,
      weeklyReports: { submitted: 6, total: 8 },
      companyFeedback: "Satisfactory",
      academicGrade: "B",
      overallScore: 78,
      trend: "up",
      lastUpdate: "2024-03-07",
    },
  ];

  // Unique values for filters
  const supervisorsList = Array.from(
    new Set(performanceData.map((s) => s.supervisor))
  );
  const gradesList = Array.from(
    new Set(performanceData.map((s) => s.academicGrade))
  );

  // Filtering logic
  const filteredData = performanceData.filter(
    (item) =>
      (supervisorFilter === "all" || item.supervisor === supervisorFilter) &&
      (gradeFilter === "all" || item.academicGrade === gradeFilter) &&
      (item.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supervisor.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const getPerformanceBadge = (score: number) => {
    if (score >= 90)
      return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 80)
      return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    if (score >= 70)
      return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  const getGradeBadge = (grade: string) => {
    const gradeColors: { [key: string]: string } = {
      "A+": "bg-green-100 text-green-800",
      A: "bg-green-100 text-green-800",
      "B+": "bg-blue-100 text-blue-800",
      B: "bg-blue-100 text-blue-800",
      "C+": "bg-yellow-100 text-yellow-800",
      C: "bg-yellow-100 text-yellow-800",
    };
    return (
      <Badge className={gradeColors[grade] || "bg-gray-100 text-gray-800"}>
        {grade}
      </Badge>
    );
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 95) return "text-green-600";
    if (attendance >= 90) return "text-blue-600";
    if (attendance >= 85) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <DashboardLayout requiredRole="university">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Performance Tracking
            </h1>
            <p className="text-gray-600">
              Monitor student performance and attendance
            </p>
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by student name, company, or supervisor..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <select
                className="border rounded px-2 py-1"
                value={supervisorFilter}
                onChange={(e) => {
                  setSupervisorFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Supervisors</option>
                {supervisorsList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                className="border rounded px-2 py-1"
                value={gradeFilter}
                onChange={(e) => {
                  setGradeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Grades</option>
                {gradesList.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">92.5%</p>
                <p className="text-sm text-gray-600">Average Attendance</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">87.8</p>
                <p className="text-sm text-gray-600">Average Score</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">29/32</p>
                <p className="text-sm text-gray-600">Reports Submitted</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">4.6/5</p>
                <p className="text-sm text-gray-600">Company Rating</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Details */}
        <Card>
          <CardHeader>
            <CardTitle>Student Performance Details</CardTitle>
            <CardDescription>
              Detailed performance metrics for each student
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {paginatedData.map((student) => (
                <div key={student.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {student.student}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {student.company} • Supervisor: {student.supervisor}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPerformanceBadge(student.overallScore)}
                      {getGradeBadge(student.academicGrade)}
                      {student.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Attendance */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Attendance
                      </p>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={student.attendance}
                          className="flex-1"
                        />
                        <span
                          className={`text-sm font-medium ${getAttendanceColor(
                            student.attendance
                          )}`}
                        >
                          {student.attendance}%
                        </span>
                      </div>
                    </div>

                    {/* Weekly Reports */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Weekly Reports
                      </p>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={
                            (student.weeklyReports.submitted /
                              student.weeklyReports.total) *
                            100
                          }
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-gray-600">
                          {student.weeklyReports.submitted}/
                          {student.weeklyReports.total}
                        </span>
                      </div>
                    </div>

                    {/* Company Feedback */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Company Feedback
                      </p>
                      <Badge
                        variant="outline"
                        className="w-full justify-center"
                      >
                        {student.companyFeedback}
                      </Badge>
                    </div>

                    {/* Overall Score */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Overall Score
                      </p>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={student.overallScore}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {student.overallScore}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>Last updated: {student.lastUpdate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Contact Student
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {paginatedData.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No results found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Pagination */}
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={page === i + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </DashboardLayout>
  );
}
