"use client";

import { useState, useEffect } from "react";
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
import { User, Search, FileText, Calendar } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { Star, StarHalf } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PerformanceUser {
  id: number;
  student: string;
  supervisor: string;
  attendance: number;
  weeklyReports: { submitted: number; total: number };
  companyFeedback: number;
  academicGrade: string;
  overallScore: number;
  trend: string;
  lastUpdate: string;
  performanceLabel: string;
  lastReviewFeedback: string;
}

interface PerformanceStats {
  totalReports: number;
  averageRating: number;
  score: number;
  attendance: number;
}

interface PerformanceClientProps {
  initialUsers: PerformanceUser[];
  initialStats: PerformanceStats;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  searchParams: { search: string; supervisor: string };
  supervisorsList: any[];
  userId: number;
  onFetchData: (
    page: number,
    size: number,
    search: string,
    supervisor: string
  ) => Promise<{
    users: PerformanceUser[];
    stats: PerformanceStats;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      pageSize: number;
    };
    error?: string;
  }>;
}

export default function PerformanceClient({
  initialUsers,
  initialStats,
  pagination,
  searchParams,
  supervisorsList,
  userId,
  onFetchData,
}: PerformanceClientProps) {
  const router = useRouter();
  const params = useSearchParams();

  const [users, setUsers] = useState<PerformanceUser[]>(initialUsers);
  const [stats, setStats] = useState<PerformanceStats>(initialStats);
  const [searchTerm, setSearchTerm] = useState<string>(
    searchParams.search || ""
  );
  const [supervisorFilter, setSupervisorFilter] = useState<string>(
    searchParams.supervisor || "all"
  );
  const [currentPage, setCurrentPage] = useState<number>(
    pagination.currentPage
  );
  const [totalPages, setTotalPages] = useState<number>(pagination.totalPages);
  const [totalItems, setTotalItems] = useState<number>(pagination.totalItems);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Update state when URL params change
  useEffect(() => {
    const search = params.get("search") || "";
    const supervisor = params.get("supervisor") || "all";
    const pageParam = params.get("page") || "1";

    setSearchTerm(search);
    setSupervisorFilter(supervisor);
    setCurrentPage(parseInt(pageParam));
  }, [params]);

  // Update state when props change (for navigation)
  useEffect(() => {
    setUsers(initialUsers);
    setStats(initialStats);
    setTotalPages(pagination.totalPages);
    setCurrentPage(pagination.currentPage);
    setTotalItems(pagination.totalItems);
  }, [initialUsers, initialStats, pagination]);

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
      D: "bg-orange-100 text-orange-800",
      F: "bg-red-100 text-red-800",
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

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="w-4 h-4 text-yellow-500 fill-yellow-500"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="w-4 h-4 text-yellow-500 fill-yellow-500"
        />
      );
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return <div className="flex items-center space-x-1">{stars}</div>;
  };

  const handleSearch = () => {
    const newParams = new URLSearchParams();
    if (searchTerm) newParams.set("search", searchTerm);
    if (supervisorFilter !== "all")
      newParams.set("supervisor", supervisorFilter);
    newParams.set("page", "1");

    router.push(`/dashboard/university/performance?${newParams.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams();
    if (searchTerm) newParams.set("search", searchTerm);
    if (supervisorFilter !== "all")
      newParams.set("supervisor", supervisorFilter);
    newParams.set("page", newPage.toString());

    router.push(`/dashboard/university/performance?${newParams.toString()}`);
  };

  return (
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

        <Button className="bg-black text-white">
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 md:w-1/2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by student name or supervisor..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <Select
              value={supervisorFilter}
              onValueChange={(value) => {
                setSupervisorFilter(value);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by supervisor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Supervisors</SelectItem>
                {supervisorsList.map((supervisor) => (
                  <SelectItem key={supervisor.id} value={supervisor.firstName}>
                    {supervisor.firstName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? "Loading..." : "Apply"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {stats.attendance}%
              </p>
              <p className="text-sm text-gray-600">Average Attendance</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {stats.totalReports}
              </p>
              <p className="text-sm text-gray-600">Total Reports</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {stats.averageRating.toFixed(1)}/5
              </p>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.score}%</p>
              <p className="text-sm text-gray-600">Overall Score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Details */}
      <Card>
        <CardHeader>
          <CardTitle>Student Performance Details</CardTitle>
          <CardDescription>
            Showing {users.length} of {totalItems} students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">
                  Loading performance data...
                </p>
              </div>
            ) : users.length > 0 ? (
              users.map((student) => (
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
                          Supervisor: {student.supervisor}
                          {student.performanceLabel !== "N/A" && (
                            <span className="ml-2">
                              • {student.performanceLabel}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {getPerformanceBadge(student.overallScore)}
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
                          className={`text-sm ${getAttendanceColor(
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
                        <span className="text-sm text-gray-700">
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
                      <div className="flex items-center space-x-2">
                        {renderStars(student.companyFeedback)}
                        <span className="text-sm text-gray-700">
                          {student.companyFeedback.toFixed(1)}/5
                        </span>
                      </div>
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
                          {student.overallScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {student.lastReviewFeedback !== "N/A" && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Latest Feedback
                      </p>
                      <p className="text-sm text-gray-600">
                        {student.lastReviewFeedback}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>Last updated: {student.lastUpdate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getGradeBadge(student.academicGrade)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/university/messages`)
                        }
                      >
                        Contact Student
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No performance data found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                className={
                  currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === pageNum}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pageNum);
                    }}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages)
                    handlePageChange(currentPage + 1);
                }}
                className={
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
