"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Report, Review } from "@/types/entities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/app/layout/dashboard-layout";
import { Send, CheckCircle, Clock, Calendar, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function ReportsPage() {
  const [reports, setReports] = React.useState<Report[]>([
    {
      id: 1,
      student_id: 1,
      project_id: 1,
      title: "First Project Update",
      period_to: "2024-01-22",
      review_id: 1,
      task_completed: "Completed initial research and setup for the project.",
      challenges: "Had difficulty finding relevant resources.",
      next_week_goals: "Begin implementation of core features.",
      created_at: "2024-01-21T10:00:00Z",
    },
    {
      id: 2,
      student_id: 1,
      project_id: 1,
      title: "Second Project Update",
      period_to: "2024-01-29",
      review_id: 2,
      task_completed: "Implemented core features and fixed bugs.",
      challenges: "Debugging took longer than expected.",
      next_week_goals:
        "Start working on UI improvements and additional features.",
      created_at: "2024-01-28T09:30:00Z",
    },
  ]);

  // Example reviews array simulating backend data
  const reviews: Review[] = [
    {
      id: 1,
      report_id: 1,
      feedback:
        "Great start! Make sure to document your resources better next time.",
      rating: 4,
      reviewer_id: 2,
      created_at: "2024-01-23T14:30:00Z",
    },
    {
      id: 2,
      report_id: 2,
      feedback: "Excellent progress on the project. Keep up the good work!",
      rating: 5,
      reviewer_id: 2,
      created_at: "2024-01-30T11:15:00Z",
    },
  ];

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    period_to: "",
    task_completed: "",
    challenges: "",
    next_week_goals: "",
  });

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create a valid Report object
    const newReport: Report = {
      id: reports.length + 1, // Simple increment, replace with real ID logic if needed
      student_id: 1, // we will Replace with actual logged-in student ID
      project_id: 1, // we will Replace with actual selected project ID
      title: form.title,
      period_to: form.period_to,
      task_completed: form.task_completed,
      challenges: form.challenges,
      next_week_goals: form.next_week_goals,
      created_at: new Date().toISOString(),
    };
    console.log("Submitted report:", newReport);
    setReports([...reports, newReport]);
    setDialogOpen(false);
    setForm({
      title: "",
      period_to: "",
      task_completed: "",
      challenges: "",
      next_week_goals: "",
    });
  };

  // Search/filter state
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [dateFilter, setDateFilter] = React.useState("all");

  // Filter reports by search and feedback status/date
  const filteredReports = reports.filter((report) => {
    // Search by title or review feedback
    const review = report.review_id
      ? reviews.find((r) => r.id === report.review_id)
      : undefined;
    const searchText = search.toLowerCase();
    const matchesSearch =
      report.title.toLowerCase().includes(searchText) ||
      (review?.feedback?.toLowerCase().includes(searchText) ?? false);

    // Status filter: feedback or no feedback
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "feedback" && review?.feedback) ||
      (statusFilter === "no-feedback" && !review?.feedback);

    // Date filter: current period (today), past periods, or all
    let matchesDate = true;
    if (dateFilter === "current") {
      const today = new Date().toISOString().slice(0, 10);
      matchesDate = report.period_to === today;
    } else if (dateFilter === "past") {
      const today = new Date().toISOString().slice(0, 10);
      matchesDate = report.period_to < today;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const [page, setPage] = React.useState(1);
  const pageSize = 2;
  const totalPages = Math.ceil(filteredReports.length / pageSize);
  const paginatedReports = filteredReports.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const submittedReports = reports.filter((r) => r.created_at);

  const ratedReports = reports.filter((report) => {
    const review = report.review_id
      ? reviews.find((r) => r.id === report.review_id)
      : undefined;
    return typeof review?.rating === "number";
  });

  const avgRating =
    ratedReports.length > 0
      ? ratedReports.reduce((sum, report) => {
          const review = report.review_id
            ? reviews.find((r) => r.id === report.review_id)
            : undefined;
          return sum + (review?.rating ?? 0);
        }, 0) / ratedReports.length
      : 0;

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="pr-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Project Reports
            </h1>
            <p className="text-gray-600">
              Submit and track your project progress reports
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white hover:bg-gray-900 flex items-center px-3 py-2 sm:px-6 sm:py-2 text-sm sm:text-base">
                <Send className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Submit New Report</span>
                <span className="inline sm:hidden">New Report</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full border-none">
              <DialogTitle className="mb-4">Submit New Report</DialogTitle>
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Submit New Report
                </h2>
                <form className="space-y-4" onSubmit={handleFormSubmit}>
                  <Input
                    name="title"
                    placeholder="Report Title"
                    value={form.title}
                    onChange={handleFormChange}
                    required
                  />
                  <Input
                    name="period_to"
                    type="date"
                    placeholder="Period To"
                    value={form.period_to}
                    onChange={handleFormChange}
                    required
                  />
                  <Textarea
                    name="task_completed"
                    placeholder="Tasks Completed"
                    value={form.task_completed}
                    onChange={handleFormChange}
                    rows={3}
                    required
                  />
                  <Textarea
                    name="challenges"
                    placeholder="Challenges Faced"
                    value={form.challenges}
                    onChange={handleFormChange}
                    rows={2}
                    required
                  />
                  <Textarea
                    name="next_week_goals"
                    placeholder="Next Week Goals"
                    value={form.next_week_goals}
                    onChange={handleFormChange}
                    rows={2}
                    required
                  />
                  <div className="flex space-x-2 mt-2">
                    <Button
                      type="submit"
                      className="bg-black text-white hover:bg-gray-900 px-6"
                    >
                      Submit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-black text-black px-6"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Submitted</p>
                  <p className="text-2xl font-bold text-green-600">
                    {submittedReports.length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg. Rating
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {avgRating}/5
                  </p>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Send className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by title or feedback..."
                    className="pl-10 rounded-md bg-white border border-gray-200 w-[100%]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[25%] border border-gray-200 bg-white text-gray-700 rounded-md">
                  <SelectValue placeholder="Filter by feedback" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="feedback">With Feedback</SelectItem>
                  <SelectItem value="no-feedback">No Feedback</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[25%] border border-gray-200 bg-white text-gray-700 rounded-md">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="current">Current Period</SelectItem>
                  <SelectItem value="past">Past Periods</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {paginatedReports.map((report) => {
            // Find the review for this report, if any
            const review = report.review_id
              ? reviews.find((r) => r.id === report.review_id)
              : undefined;
            return (
              <Card
                key={report.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          report.created_at ? "bg-green-100" : "bg-yellow-100"
                        }`}
                      >
                        {report.created_at ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <Clock className="h-6 w-6 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {report.title}
                          </h3>
                          {review?.rating && (
                            <Badge
                              variant="outline"
                              className="flex items-center"
                            >
                              <Star className="h-4 w-4 mr-1 fill-current" />
                              {review.rating}/5
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Period to: {report.period_to}
                          </span>
                          {report.created_at && (
                            <span>
                              Submitted:{" "}
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {review?.feedback && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">
                              Feedback:
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {review.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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

        {/* Report Guidelines */}
        <Card className="bg-white border border-gray-200 rounded-lg mt-6 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Report Guidelines</CardTitle>
            <CardDescription>
              What to include in your project reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Required Sections:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Clear and descriptive title</li>
                  <li>• Tasks completed since last report</li>
                  <li>• Challenges faced and solutions</li>
                  <li>• Goals for the next period</li>
                  <li>• Any blockers or support needed</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Tips for Success:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Be specific and quantitative when possible</li>
                  <li>• Include code snippets or screenshots if relevant</li>
                  <li>• Submit before the deadline</li>
                  <li>• Review feedback from previous reports</li>
                  <li>• Ask questions if you're unsure about requirements</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
