"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Search,
  Star,
  CheckCircle,
  Clock,
  Download,
  MessageSquare,
  AlertTriangle,
  Mail,
  Eye,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "@/components/ui/use-toast";
import { ReportStats } from "@/app/services/reportService";
import { Report } from "@/types/entities";

interface CompanyReportsClientProps {
  initialReports: Report[];
  initialStats: ReportStats;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  onCreateReview: (data: {
    reportId: number;
    feedback: string;
    rating: number;
  }) => Promise<{ success: boolean; report?: Report; error?: string }>;
  onFetchData: (
    page: number,
    size: number,
    search: string,
    status: string,
    period: string
  ) => Promise<{
    reports: Report[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      pageSize: number;
    };
    error?: string;
  }>;
}

export default function CompanyReportsClient({
  initialReports,
  initialStats,
  pagination,
  onCreateReview,
  onFetchData,
}: CompanyReportsClientProps) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [stats, setStats] = useState<ReportStats>(initialStats);
  const [ratingModal, setRatingModal] = useState<{
    open: boolean;
    report: Report | null;
  }>({ open: false, report: null });
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [feedbackValue, setFeedbackValue] = useState<string>("");
  const [page, setPage] = useState<number>(pagination.currentPage + 1);
  const [expandedReportId, setExpandedReportId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [searchValue, setSearchValue] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");

  const pageSize = 3;

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const data = await onFetchData(
        0,
        10000,
        searchValue,
        statusFilter,
        periodFilter
      );
      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      } else {
        setReports(data.reports);
        setPage(1);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setReports(initialReports);
    setStats(initialStats);
  }, [initialReports, initialStats]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        searchValue === "" ||
        report.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        report.projectResponse.projectName
          .toLowerCase()
          .includes(searchValue.toLowerCase()) ||
        report.taskCompleted.toLowerCase().includes(searchValue.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && !report.review) ||
        (statusFilter === "reviewed" && report.review);

      return matchesSearch && matchesStatus;
    });
  }, [reports, searchValue, statusFilter]);

  const totalItems = filteredReports.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const currentReports = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredReports.slice(start, end);
  }, [filteredReports, page, pageSize]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPage(1);
  };

  const handleFilterChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (value: string) => {
      setter(value);
      setPage(1);
    };

  const handleExportReports = () => {
    const exportData = filteredReports.map((report) => ({
      Title: report.title,
      Project: report.projectResponse.projectName,
      "Period To": report.periodTo,
      "Submitted On": report.createdAt.split("T")[0],
      Status: report.review ? "Reviewed" : "Pending",
      Rating: report.review?.rating || "N/A",
      Feedback: report.review?.feedback || "N/A",
      "Tasks Completed": report.taskCompleted,
      Challenges: report.challenges,
      "Next Week Goals": report.nextWeekGoals,
    }));

    const csvContent = [
      Object.keys(exportData[0]).join(","),
      ...exportData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `reports-export-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendReminder = (report: Report) => {
    toast({
      title: "Reminder Sent",
      description: `Reminder sent for report: ${report.title}`,
    });
  };

  const handleReviewAndRate = (report: Report) => {
    setRatingModal({ open: true, report });
    setRatingValue(report.review?.rating || 0);
    setFeedbackValue(report.review?.feedback || "");
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModal.report || ratingValue === 0) return;

    setIsSubmitting(true);
    try {
      const response = await onCreateReview({
        reportId: ratingModal.report.id,
        feedback: feedbackValue,
        rating: ratingValue,
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      setReports((prev) =>
        prev.map((r) =>
          r.id === ratingModal.report!.id ? response.report! : r
        )
      );

      setRatingModal({ open: false, report: null });
      toast({
        title: "Success",
        description: "Review submitted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (report: Report) => {
    if (report.review) {
      return <Badge className="bg-green-100 text-green-800">Reviewed</Badge>;
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
    );
  };

  const getStatusIcon = (report: Report) => {
    if (report.review) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    return <Clock className="h-5 w-5 text-yellow-600" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weekly Reports</h1>
          <p className="text-gray-600">
            Review and evaluate intern progress reports
          </p>
        </div>
        <Button variant="outline" onClick={handleExportReports}>
          <Download className="h-4 w-4 mr-2" />
          Export Reports
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Reports
                </p>
                <p className="text-2xl font-bold">{stats.totalReports}</p>
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
                  Pending Review
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pendingReports}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reviewed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.reviewedReports}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.averageRating.toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by title, project, or tasks..."
                  className="pl-10"
                  value={searchValue}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={handleFilterChange(setStatusFilter)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={periodFilter}
              onValueChange={handleFilterChange(setPeriodFilter)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No reports found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          currentReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      {getStatusIcon(report)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {report.title}
                        </h3>
                        {getStatusBadge(report)}
                        {report.review?.rating && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                              {report.review.rating}/5
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Project:</strong>{" "}
                            {report.projectResponse.projectName}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Period:</strong>{" "}
                            {formatDate(report.periodTo)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Submitted:</strong>{" "}
                            {formatDate(report.createdAt)}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Intern ID:</strong> {report.internId}
                          </p>
                        </div>
                        {/* <div>
                          {report.review ? (
                            <Badge className="bg-green-100 text-green-800">
                              Reviewed
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Pending
                            </Badge>
                          )}
                        </div> */}
                      </div>

                      {expandedReportId === report.id && (
                        <>
                          <div className="mb-3">
                            <h4 className="font-semibold text-sm mb-2">
                              Tasks Completed:
                            </h4>
                            <p className="text-sm text-gray-600">
                              {report.taskCompleted}
                            </p>
                          </div>
                          {report.challenges && (
                            <div className="mb-3">
                              <h4 className="font-semibold text-sm mb-2">
                                Challenges:
                              </h4>
                              <p className="text-sm text-gray-600">
                                {report.challenges}
                              </p>
                            </div>
                          )}
                          {report.nextWeekGoals && (
                            <div className="mb-3">
                              <h4 className="font-semibold text-sm mb-2">
                                Next Week Goals:
                              </h4>
                              <p className="text-sm text-gray-600">
                                {report.nextWeekGoals}
                              </p>
                            </div>
                          )}
                          {report.review?.feedback && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <h4 className="font-semibold text-sm mb-2 text-blue-900">
                                Feedback:
                              </h4>
                              <p className="text-sm text-blue-800">
                                {report.review.feedback}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setExpandedReportId(
                          expandedReportId === report.id ? null : report.id
                        )
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {!report.review ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReviewAndRate(report)}
                        >
                          Review & Rate
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm">
                        Reviewed
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
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
                className={
                  page === totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Rating Modal */}
      <Dialog
        open={ratingModal.open}
        onOpenChange={(open) =>
          setRatingModal({ open, report: open ? ratingModal.report : null })
        }
      >
        <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>
              {ratingModal.report?.review
                ? "Update Review"
                : "Review & Rate Report"}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-6" onSubmit={handleRatingSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rating (1-5 stars)
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`h-8 w-8 transition-colors ${
                      star <= ratingValue
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                    onClick={() => setRatingValue(star)}
                  >
                    <Star className="h-8 w-8" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback
              </label>
              <textarea
                className="w-full border rounded p-2 min-h-[100px]"
                placeholder="Enter your feedback for this report..."
                value={feedbackValue}
                onChange={(e) => setFeedbackValue(e.target.value)}
                required
              />
            </div>
            <div className="flex space-x-2">
              <Button
                type="submit"
                disabled={isSubmitting || ratingValue === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Submit Review
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRatingModal({ open: false, report: null })}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Report Evaluation Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Report Evaluation Guidelines</CardTitle>
          <CardDescription>
            Criteria for evaluating intern weekly reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Evaluation Criteria:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  • <strong>Task Completion (30%):</strong> Quality and quantity
                  of completed work
                </li>
                <li>
                  • <strong>Problem Solving (25%):</strong> Approach to
                  challenges and solutions
                </li>
                <li>
                  • <strong>Learning Progress (20%):</strong> Skill development
                  and knowledge gain
                </li>
                <li>
                  • <strong>Communication (15%):</strong> Clarity and detail in
                  reporting
                </li>
                <li>
                  • <strong>Initiative (10%):</strong> Proactive behavior and
                  self-direction
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Rating Scale:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  • <strong>5 Stars:</strong> Exceptional performance, exceeds
                  expectations
                </li>
                <li>
                  • <strong>4 Stars:</strong> Good performance, meets
                  expectations well
                </li>
                <li>
                  • <strong>3 Stars:</strong> Satisfactory performance, meets
                  basic expectations
                </li>
                <li>
                  • <strong>2 Stars:</strong> Below expectations, needs
                  improvement
                </li>
                <li>
                  • <strong>1 Star:</strong> Poor performance, requires
                  immediate attention
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
