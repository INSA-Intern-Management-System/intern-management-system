"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  X,
  Search,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";
import {
  LeaveRequest,
  StatusCounts,
  CreateLeaveRequest,
} from "@/types/entities";
import { useRouter, useSearchParams } from "next/navigation";

interface LeaveClientProps {
  initialLeaves: LeaveRequest[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  statusCounts: StatusCounts;
  onCreateLeave: (
    leaveData: CreateLeaveRequest
  ) => Promise<{ success: boolean; data?: LeaveRequest; error?: string }>;
  onDeleteLeave: (
    leaveId: number
  ) => Promise<{ success: boolean; error?: string }>;
  initialSearch: string;
  initialStatus?: string;
  initialType?: string;
}

// Helper function to safely parse and format dates
const formatDateSafe = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";

  try {
    // Parse ISO string and format it
    return format(parseISO(dateString), "MMM d, yyyy");
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Invalid date";
  }
};

// Calculate days between two dates
const calculateDays = (fromDate: string, toDate: string): number => {
  try {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  } catch (error) {
    console.error("Error calculating days:", error);
    return 0;
  }
};

export default function LeaveClient({
  initialLeaves,
  pagination,
  statusCounts,
  onCreateLeave,
  onDeleteLeave,
  initialSearch,
  initialStatus,
  initialType,
}: LeaveClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leaves, setLeaves] = useState<LeaveRequest[]>(initialLeaves);
  const [currentStatusCounts, setCurrentStatusCounts] =
    useState<StatusCounts>(statusCounts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
    receiverID: 3, // Default receiver ID from your API
  });
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>(
    initialStatus || "all"
  );
  const [typeFilter, setTypeFilter] = useState<string>(initialType || "all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize current page from URL `page` param when available, otherwise fall back to server-provided pagination
  const getInitialPage = () => {
    try {
      const p = searchParams?.get("page");
      if (p !== null && p !== undefined) {
        const parsed = parseInt(p, 10);
        if (!isNaN(parsed) && parsed >= 0) return parsed;
      }
    } catch (e) {
      // fallback handled below
    }
    return pagination.currentPage;
  };

  const [currentPage, setCurrentPage] = useState<number>(getInitialPage);
  // Page size (items per page) - read from URL if present, otherwise use server-provided pageSize
  const getInitialSize = () => {
    try {
      const s = searchParams?.get("size");
      if (s !== null && s !== undefined) {
        const parsed = parseInt(s, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch (e) {
      // fallback handled below
    }
    return pagination.pageSize || 10;
  };

  const [pageSize, setPageSize] = useState<number>(getInitialSize);
  const [isLoading, setIsLoading] = useState(false);

  // Update leaves when initialLeaves change
  useEffect(() => {
    setLeaves(initialLeaves);
    setCurrentStatusCounts(statusCounts);
    // If there is no explicit `page` param in the URL, ensure we reflect the server pagination
    const pageParam = searchParams?.get("page");
    if (!pageParam) {
      setCurrentPage(pagination.currentPage);
    }
  }, [initialLeaves, pagination.currentPage, statusCounts]);

  // Keep local pageSize in sync when the URL query `size` param changes
  useEffect(() => {
    const s = searchParams?.get("size");
    if (s !== null && s !== undefined) {
      const parsed = parseInt(s, 10);
      if (!isNaN(parsed) && parsed > 0 && parsed !== pageSize) {
        setPageSize(parsed);
      }
    } else {
      // no size in URL -> fallback to server pageSize
      if (pagination.pageSize && pagination.pageSize !== pageSize) {
        setPageSize(pagination.pageSize);
      }
    }
  }, [searchParams, pagination.pageSize]);

  // Keep local page state in sync when the URL query `page` param changes
  useEffect(() => {
    const p = searchParams?.get("page");
    if (p !== null && p !== undefined) {
      const parsed = parseInt(p, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed !== currentPage) {
        setCurrentPage(parsed);
      }
    }
    // when page param is removed, fall back to server page
    if (!searchParams?.get("page")) {
      setCurrentPage(pagination.currentPage);
    }
  }, [searchParams, pagination.currentPage]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fromDate = new Date(form.fromDate);
      const toDate = new Date(form.toDate);

      if (toDate < fromDate) {
        toast({
          title: "Error",
          description: "End date must be after start date",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Format dates to ISO string for backend
      const leaveData: CreateLeaveRequest = {
        leaveType: form.leaveType,
        fromDate: new Date(form.fromDate).toISOString(),
        toDate: new Date(form.toDate).toISOString(),
        reason: form.reason,
        receiverID: form.receiverID,
      };

      const response = await onCreateLeave(leaveData);

      if (!response.success) {
        throw new Error(response.error);
      }

      // Update local state with the new leave request
      if (response.data) {
        setLeaves([response.data, ...leaves]);

        // Update status counts
        setCurrentStatusCounts({
          ...currentStatusCounts,
          total: (currentStatusCounts.total || 0) + 1,
          pending: (currentStatusCounts.pending || 0) + 1,
        });
      }

      setDialogOpen(false);
      setForm({
        leaveType: "",
        fromDate: "",
        toDate: "",
        reason: "",
        receiverID: 3,
      });

      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit leave request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (leaveId: number) => {
    setIsDeleting(leaveId);
    try {
      const response = await onDeleteLeave(leaveId);
      if (!response.success) {
        throw new Error(response.error);
      }

      // Update local state by removing the deleted leave
      const deletedLeave = leaves.find((leave) => leave.leaveId === leaveId);
      setLeaves(leaves.filter((leave) => leave.leaveId !== leaveId));

      // Update status counts
      if (deletedLeave) {
        setCurrentStatusCounts({
          ...currentStatusCounts,
          total: (currentStatusCounts.total || 1) - 1,
          [deletedLeave.leaveStatus?.toLowerCase() || "pending"]: Math.max(
            0,
            ((currentStatusCounts[
              deletedLeave.leaveStatus?.toLowerCase() as keyof StatusCounts
            ] as number) || 1) - 1
          ),
        });
      }

      toast({
        title: "Success",
        description: "Leave request deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete leave request",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const updateUrlParams = () => {
    const params = new URLSearchParams();

    // Always reset to first page when filters change
    params.set("page", "0");
    // always include current page size
    params.set("size", pageSize.toString());
    setCurrentPage(0);

    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);

    router.push(`/dashboard/student/leave?${params.toString()}`);
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

  // Immediate filter change for status and type
  useEffect(() => {
    if (
      statusFilter !== (initialStatus || "all") ||
      typeFilter !== (initialType || "all")
    ) {
      updateUrlParams();
    }
  }, [statusFilter, typeFilter]);

  const handlePageChange = (newPage: number) => {
    // update local state immediately for snappy UI, then navigate
    setCurrentPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    // ensure size remains in URL
    params.set("size", pageSize.toString());
    router.push(`/dashboard/student/leave?${params.toString()}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "REJECTED":
        return <X className="h-5 w-5 text-red-600" />;
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-600" />;
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600">
            Apply for and track your leave requests
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white hover:bg-gray-900 flex items-center px-3 py-2 sm:px-6 sm:py-2 text-sm sm:text-base">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Request Leave</span>
              <span className="inline sm:hidden">New Leave</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full border-none">
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <Select
                name="leaveType"
                value={form.leaveType}
                onValueChange={(value) =>
                  handleSelectChange("leaveType", value)
                }
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Leave Type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Annual">Annual</SelectItem>
                  <SelectItem value="Sick">Sick</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Vacation">Vacation</SelectItem>
                  <SelectItem value="Study">Study</SelectItem>
                </SelectContent>
              </Select>
              <Input
                name="fromDate"
                type="date"
                placeholder="From Date"
                value={form.fromDate}
                onChange={handleFormChange}
                required
              />
              <Input
                name="toDate"
                type="date"
                placeholder="To Date"
                value={form.toDate}
                onChange={handleFormChange}
                required
              />
              <Textarea
                name="reason"
                placeholder="Reason for leave"
                value={form.reason}
                onChange={handleFormChange}
                rows={3}
                required
              />
              <div className="flex space-x-2 mt-2">
                <Button
                  type="submit"
                  className="bg-black text-white hover:bg-gray-900 px-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-black text-black px-6"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Requests
                </p>
                <p className="text-2xl font-bold">
                  {currentStatusCounts.total || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {currentStatusCounts.pending || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {currentStatusCounts.approved || 0}
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
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {currentStatusCounts.rejected || 0}
                </p>
              </div>
              <X className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests List */}
      <div className="space-y-4">
        {leaves.length === 0 ? (
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <CardContent className="p-6 text-center text-gray-500">
              No leave requests found matching your criteria
            </CardContent>
          </Card>
        ) : (
          leaves.map((request) => {
            const days = calculateDays(request.fromDate, request.toDate);
            return (
              <Card
                key={request.leaveId}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        {getStatusIcon(request.leaveStatus || "")}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.leaveType}
                          </h3>
                          {getStatusBadge(request.leaveStatus || "")}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                          <div>
                            <p>
                              <strong>Duration:</strong>{" "}
                              {formatDateSafe(request.fromDate)} to{" "}
                              {formatDateSafe(request.toDate)}
                            </p>
                            <p>
                              <strong>Days:</strong> {days} day(s)
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Applied on:</strong>{" "}
                              {formatDateSafe(request.createdAt)}
                            </p>
                            {request.approvedBy && (
                              <p>
                                <strong>Reviewed by:</strong>{" "}
                                {request.approvedBy}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm">
                            <strong>Reason:</strong> {request.reason}
                          </p>
                        </div>
                        {request.leaveStatus === "REJECTED" &&
                          request.rejectionReason && (
                            <div className="p-3 bg-red-50 rounded-lg">
                              <p className="text-sm text-red-800">
                                <strong>Rejection Reason:</strong>{" "}
                                {request.rejectionReason}
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                    {request.leaveStatus === "PENDING" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(request.leaveId)}
                        disabled={isDeleting === request.leaveId}
                      >
                        {isDeleting === request.leaveId ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination - Only show if there are multiple pages */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between mt-8">
          <div className="mb-4 md:mb-0 flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows per page:</label>
            <Select
              value={pageSize.toString()}
              onValueChange={(val) => {
                const parsed = parseInt(val, 10) || 10;
                // reset to first page when size changes
                setPageSize(parsed);
                setCurrentPage(0);
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", "0");
                params.set("size", parsed.toString());
                router.push(`/dashboard/student/leave?${params.toString()}`);
              }}
            >
              <SelectTrigger className="min-w-[80px] border border-gray-200 bg-white text-gray-700 rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center">
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
        </div>
      )}

      {/* Leave Policy */}
      <Card className="bg-white border border-gray-200 rounded-lg mt-6 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Leave Policy</CardTitle>
          <CardDescription>
            Guidelines for requesting and managing your leave
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Leave Types:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  • <strong>Annual:</strong> Yearly allocated leave days
                </li>
                <li>
                  • <strong>Sick:</strong> Medical appointments and illness
                </li>
                <li>
                  • <strong>Personal:</strong> Family emergencies and personal
                  matters
                </li>
                <li>
                  • <strong>Vacation:</strong> Planned time off
                </li>
                <li>
                  • <strong>Study:</strong> Academic commitments and exams
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Guidelines:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Submit requests at least 48 hours in advance</li>
                <li>• Provide detailed reason for leave</li>
                <li>• Emergency leaves can be submitted same day</li>
                <li>• Maximum 5 days per month without prior approval</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
