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
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/app/layout/dashboard-layout";
import {
  User,
  Search,
  Star,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function EvaluationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supervisorFilter, setSupervisorFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 3;

  // Mock data
  const evaluations = [
    {
      id: 1,
      student: "John Doe",
      company: "Tech Corp",
      supervisor: "Dr. Smith",
      companyRating: 4.5,
      companyFeedback:
        "Excellent performance, shows great initiative and technical skills.",
      finalGrade: "A",
      academicComments:
        "Outstanding work on the final project. Demonstrates deep understanding.",
      status: "completed",
      submissionDate: "2024-03-10",
      evaluationDate: "2024-03-12",
    },
    {
      id: 2,
      student: "Jane Smith",
      company: "Innovation Labs",
      supervisor: "Dr. Johnson",
      companyRating: 4.8,
      companyFeedback:
        "Exceptional analytical skills and professional attitude.",
      finalGrade: "A+",
      academicComments:
        "Exceeded expectations in all areas. Highly recommended.",
      status: "completed",
      submissionDate: "2024-03-09",
      evaluationDate: "2024-03-11",
    },
    {
      id: 3,
      student: "Mike Johnson",
      company: "StartupXYZ",
      supervisor: "Dr. Brown",
      companyRating: 4.2,
      companyFeedback:
        "Good design skills, needs improvement in time management.",
      finalGrade: "",
      academicComments: "",
      status: "pending",
      submissionDate: "2024-03-08",
      evaluationDate: "",
    },
    {
      id: 4,
      student: "Sarah Wilson",
      company: "Digital Agency",
      supervisor: "Dr. Davis",
      companyRating: 4.0,
      companyFeedback:
        "Solid performance with room for growth in leadership skills.",
      finalGrade: "",
      academicComments: "",
      status: "in_review",
      submissionDate: "2024-03-07",
      evaluationDate: "",
    },
  ];

  // Unique values for filters
  const statusesList = Array.from(new Set(evaluations.map((e) => e.status)));
  const supervisorsList = Array.from(
    new Set(evaluations.map((e) => e.supervisor))
  );
  const gradesList = Array.from(
    new Set(evaluations.map((e) => e.finalGrade).filter(Boolean))
  );

  // Filtering logic
  const filteredEvaluations = evaluations.filter(
    (evaluation) =>
      (statusFilter === "all" || evaluation.status === statusFilter) &&
      (supervisorFilter === "all" ||
        evaluation.supervisor === supervisorFilter) &&
      (gradeFilter === "all" || evaluation.finalGrade === gradeFilter) &&
      (evaluation.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.supervisor.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredEvaluations.length / pageSize);
  const paginatedEvaluations = filteredEvaluations.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "in_review":
        return <Badge className="bg-blue-100 text-blue-800">In Review</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getGradeBadge = (grade: string) => {
    if (!grade) return null;
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-2">({rating})</span>
      </div>
    );
  };

  return (
    <DashboardLayout requiredRole="university">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Evaluations</h1>
            <p className="text-gray-600">
              Review company evaluations and assign final grades
            </p>
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Export Report
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
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                {statusesList.map((s) => (
                  <option key={s} value={s}>
                    {s
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
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

        {/* Evaluation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">2</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">1</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Review</p>
                  <p className="text-2xl font-bold text-blue-600">1</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg. Rating
                  </p>
                  <p className="text-2xl font-bold text-orange-600">4.4</p>
                </div>
                <Star className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Evaluations List */}
        <div className="space-y-6">
          {paginatedEvaluations.map((evaluation) => (
            <Card key={evaluation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {evaluation.student}
                      </CardTitle>
                      <CardDescription>
                        {evaluation.company} • Supervisor:{" "}
                        {evaluation.supervisor}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(evaluation.status)}
                    {evaluation.finalGrade &&
                      getGradeBadge(evaluation.finalGrade)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Company Evaluation */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">
                      Company Evaluation
                    </h4>
                    {renderStars(evaluation.companyRating)}
                  </div>
                  <p className="text-sm text-gray-700">
                    {evaluation.companyFeedback}
                  </p>
                  <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>Submitted: {evaluation.submissionDate}</span>
                  </div>
                </div>

                {/* Academic Evaluation */}
                {evaluation.status === "completed" ? (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">
                        Academic Evaluation
                      </h4>
                      {evaluation.finalGrade &&
                        getGradeBadge(evaluation.finalGrade)}
                    </div>
                    <p className="text-sm text-gray-700">
                      {evaluation.academicComments}
                    </p>
                    <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>Evaluated: {evaluation.evaluationDate}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Academic Evaluation
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Final Grade
                        </label>
                        <select className="w-full p-2 border border-gray-300 rounded-md">
                          <option value="">Select Grade</option>
                          <option value="A+">A+</option>
                          <option value="A">A</option>
                          <option value="B+">B+</option>
                          <option value="B">B</option>
                          <option value="C+">C+</option>
                          <option value="C">C</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Academic Comments
                        </label>
                        <Textarea
                          placeholder="Enter your evaluation comments..."
                          className="min-h-[80px]"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm">Submit Evaluation</Button>
                        <Button variant="outline" size="sm">
                          Save Draft
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>Status: {evaluation.status.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      View Full Report
                    </Button>
                    {evaluation.status !== "completed" && (
                      <Button size="sm">
                        {evaluation.status === "pending"
                          ? "Start Review"
                          : "Continue Review"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {paginatedEvaluations.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No results found.
            </div>
          )}
        </div>
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
