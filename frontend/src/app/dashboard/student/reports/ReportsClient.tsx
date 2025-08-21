"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Report } from "@/types/entities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle, Clock, Calendar, Star, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
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
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportsClientProps {
  initialReports: Report[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  userId: number;
  onCreateReport: (
    reportData: Omit<
      Report,
      | "id"
      | "createdAt"
      | "review"
      | "projectResponse"
      | "internId"
      | "managerId"
      | "projectId"
    >
  ) => Promise<{ success: boolean; data?: Report; error?: string }>;
  initialSearch: string;
  initialStatus?: "PENDING" | "GIVEN";
  initialPeriod?: "week" | "month";
  totalSubmittedReports: number;
}

export default function ReportsClient({
  initialReports,
  pagination,
  onCreateReport,
  initialSearch,
  initialStatus,
  initialPeriod,
  totalSubmittedReports,
}: ReportsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [form, setForm] = useState({
    title: "",
    periodTo: "",
    taskCompleted: "",
    challenges: "",
    nextWeekGoals: "",
  });
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<"all" | "PENDING" | "GIVEN">(
    initialStatus || "all"
  );
  const [periodFilter, setPeriodFilter] = useState<"all" | "week" | "month">(
    initialPeriod || "all"
  );
  const [currentPage, setCurrentPage] = useState(pagination.currentPage);
  const [isLoading, setIsLoading] = useState(false);

  // Update reports when initialReports change
  useEffect(() => {
    setReports(initialReports);
    setCurrentPage(pagination.currentPage);
  }, [initialReports, pagination.currentPage]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await onCreateReport({
        title: form.title,
        periodTo: form.periodTo,
        taskCompleted: form.taskCompleted,
        challenges: form.challenges,
        nextWeekGoals: form.nextWeekGoals,
      });
      if (!response.success) {
        throw new Error(response.error);
      }
      setReports([response.data!, ...reports]);
      setDialogOpen(false);
      setForm({
        title: "",
        periodTo: "",
        taskCompleted: "",
        challenges: "",
        nextWeekGoals: "",
      });
      toast({
        title: "Success",
        description: "Report submitted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit report",
        variant: "destructive",
      });
    }
  };

  const updateUrlParams = () => {
    const params = new URLSearchParams();

    // Always reset to first page when filters change
    params.set("page", "0");

    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (periodFilter !== "all") params.set("period", periodFilter);

    router.push(`/dashboard/student/reports?${params.toString()}`);
  };

  // Debounce the search to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== initialSearch) {
        updateUrlParams();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Immediate filter change for status and period
  useEffect(() => {
    if (
      statusFilter !== (initialStatus || "all") ||
      periodFilter !== (initialPeriod || "all")
    ) {
      updateUrlParams();
    }
  }, [statusFilter, periodFilter]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/dashboard/student/reports?${params.toString()}`);
  };

  const submittedReports = reports.filter((r) => r.createdAt);
  const submittedReportsCount = totalSubmittedReports;

  const ratedReports = reports.filter(
    (report) => report.review?.rating != null
  );
  const avgRating =
    ratedReports.length > 0
      ? ratedReports.reduce(
          (sum, report) => sum + (report.review?.rating ?? 0),
          0
        ) / ratedReports.length
      : 0;

  // Professional pagination rendering
  const renderPaginationItems = () => {
    const items = [];
    const totalPages = pagination.totalPages;
    const current = currentPage + 1; // Convert to 1-based for display

    if (totalPages <= 1) return null;

    // Always show first page
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          href="#"
          isActive={current === 1}
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(0);
          }}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if needed
    if (current > 3) {
      items.push(<PaginationEllipsis key="ellipsis-start" />);
    }

    // Calculate visible page range
    let start = Math.max(2, current - 1);
    let end = Math.min(totalPages - 1, current + 1);

    // Add visible pages
    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={current === i}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i - 1);
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    // Show ellipsis if needed
    if (current < totalPages - 2) {
      items.push(<PaginationEllipsis key="ellipsis-end" />);
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            isActive={current === totalPages}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages - 1);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="pr-2">
          <h1 className="text-3xl font-bold text-gray-900">Project Reports</h1>
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
              <h2 className="text-xl font-semibold mb-4">Submit New Report</h2>
              <form className="space-y-4" onSubmit={handleFormSubmit}>
                <Input
                  name="title"
                  placeholder="Report Title"
                  value={form.title}
                  onChange={handleFormChange}
                  required
                />
                <Input
                  name="periodTo"
                  type="date"
                  placeholder="Period To"
                  value={form.periodTo}
                  onChange={handleFormChange}
                  required
                />
                <Textarea
                  name="taskCompleted"
                  placeholder="Tasks Completed"
                  value={form.taskCompleted}
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
                  name="nextWeekGoals"
                  placeholder="Next Week Goals"
                  value={form.nextWeekGoals}
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
                  {submittedReportsCount}
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
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-purple-600">
                  {avgRating.toFixed(1)}/5
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search reports..."
                  className="pl-10 rounded-md bg-white border border-gray-200 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as "all" | "PENDING" | "GIVEN")
                }
              >
                <SelectTrigger className="min-w-[140px] border border-gray-200 bg-white text-gray-700 rounded-md">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="GIVEN">Reviewed</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={periodFilter}
                onValueChange={(value) =>
                  setPeriodFilter(value as "all" | "week" | "month")
                }
              >
                <SelectTrigger className="min-w-[140px] border border-gray-200 bg-white text-gray-700 rounded-md">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <CardContent className="p-6 text-center text-gray-500">
              No reports found matching your criteria
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Dialog
              key={report.id}
              open={viewDialogOpen && selectedReport?.id === report.id}
              onOpenChange={(open) => {
                setViewDialogOpen(open);
                if (open) setSelectedReport(report);
                else setSelectedReport(null);
              }}
            >
              <DialogTrigger asChild>
                <Card
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedReport(report);
                    setViewDialogOpen(true);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            report.review ? "bg-green-100" : "bg-yellow-100"
                          }`}
                        >
                          {report.review ? (
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
                            {report.review?.rating && (
                              <Badge
                                variant="outline"
                                className="flex items-center"
                              >
                                <Star className="h-4 w-4 mr-1 fill-current" />
                                {report.review.rating}/5
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {format(new Date(report.periodTo), "MMM d, yyyy")}
                            </span>
                            {report.createdAt && (
                              <span>
                                Submitted:{" "}
                                {format(
                                  new Date(report.createdAt),
                                  "MMM d, yyyy"
                                )}
                              </span>
                            )}
                          </div>
                          {report.review?.feedback && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-700">
                                Feedback:
                              </p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {report.review.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full border-none max-h-[90vh] overflow-y-auto">
                <DialogTitle className="mb-4">Report Details</DialogTitle>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">{report.title}</h2>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Project</p>
                    <p className="text-sm text-gray-900">
                      {report.projectResponse?.projectName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Period To
                    </p>
                    <p className="text-sm text-gray-900">
                      {format(new Date(report.periodTo), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tasks Completed
                    </p>
                    <p className="text-sm text-gray-900 whitespace-pre-line">
                      {report.taskCompleted}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Challenges Faced
                    </p>
                    <p className="text-sm text-gray-900 whitespace-pre-line">
                      {report.challenges}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Next Week Goals
                    </p>
                    <p className="text-sm text-gray-900 whitespace-pre-line">
                      {report.nextWeekGoals}
                    </p>
                  </div>
                  {report.review && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Feedback
                      </p>
                      <p className="text-sm text-gray-900 whitespace-pre-line">
                        {report.review.feedback}
                      </p>
                      <p className="text-sm font-medium text-gray-600 mt-2">
                        Rating
                      </p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < (report.review?.rating || 0)
                                ? "fill-current text-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          ({report.review.rating}/5)
                        </span>
                      </div>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="border-black text-black px-6 mt-4"
                    onClick={() => setViewDialogOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ))
        )}
      </div>

      {/* Pagination - Only show if there are multiple pages */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 0) {
                      handlePageChange(currentPage - 1);
                    }
                  }}
                  isActive={currentPage > 0}
                />
              </PaginationItem>

              {renderPaginationItems()}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < pagination.totalPages - 1) {
                      handlePageChange(currentPage + 1);
                    }
                  }}
                  isActive={currentPage < pagination.totalPages - 1}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

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
  );
}
