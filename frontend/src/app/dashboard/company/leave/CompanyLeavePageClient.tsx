// app/dashboard/company/leave/CompanyLeavePageClient.tsx
"use client";

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
  Search,
  CheckCircle,
  X,
  Clock,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LeaveRequest, StatusCounts } from "@/types/entities";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define types
type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";
type LeaveType = "Sick Leave" | "Personal Leave" | "Vacation" | "Study Leave";

interface ConfirmationState {
  id: number;
  action: "approve" | "reject" | "message";
}

interface CompanyLeavePageClientProps {
  initialLeaveRequests: LeaveRequest[];
  initialTotalPages: number;
  initialCurrentPage: number;
  statusCounts: StatusCounts;
  searchParams: { search: string; status: string; type: string };
  onUpdateLeaveStatus: (
    leaveId: number,
    newStatus: "APPROVED" | "REJECTED",
    rejectionReason?: string
  ) => Promise<{ success: boolean; error?: string }>;
  onFetchData: (
    page: number,
    size: number,
    search: string,
    status: string,
    type: string
  ) => Promise<{
    leaves: LeaveRequest[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      pageSize: number;
    };
    error?: string;
  }>;
}

export default function CompanyLeavePageClient({
  initialLeaveRequests,
  initialTotalPages,
  initialCurrentPage,
  statusCounts,
  searchParams,
  onUpdateLeaveStatus,
  onFetchData,
}: CompanyLeavePageClientProps) {
  const router = useRouter();
  const params = useSearchParams();

  const [leaveRequests, setLeaveRequests] =
    useState<LeaveRequest[]>(initialLeaveRequests);
  const [searchTerm, setSearchTerm] = useState<string>(
    searchParams.search || ""
  );
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.status || "all"
  );
  const [typeFilter, setTypeFilter] = useState<string>(
    searchParams.type || "all"
  );
  const [page, setPage] = useState<number>(initialCurrentPage);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const [showConfirmation, setShowConfirmation] =
    useState<ConfirmationState | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Update state when URL params change
  useEffect(() => {
    const search = params.get("search") || "";
    const status = params.get("status") || "all";
    const type = params.get("type") || "all";
    const pageParam = params.get("page") || "1";

    setSearchTerm(search);
    setStatusFilter(status);
    setTypeFilter(type);
    setPage(parseInt(pageParam));
  }, [params]);

  // Update state when props change (for navigation)
  useEffect(() => {
    setLeaveRequests(initialLeaveRequests);
    setTotalPages(initialTotalPages);
    setPage(initialCurrentPage);
  }, [initialLeaveRequests, initialTotalPages, initialCurrentPage]);

  const getStatusBadge = (status: LeaveStatus) => {
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

  const getStatusIcon = (status: LeaveStatus) => {
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

  const handleSearch = () => {
    const newParams = new URLSearchParams();
    if (searchTerm) newParams.set("search", searchTerm);
    if (statusFilter !== "all") newParams.set("status", statusFilter);
    if (typeFilter !== "all") newParams.set("type", typeFilter);
    newParams.set("page", "1");

    router.push(`/dashboard/company/leave?${newParams.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams();
    if (searchTerm) newParams.set("search", searchTerm);
    if (statusFilter !== "all") newParams.set("status", statusFilter);
    if (typeFilter !== "all") newParams.set("type", typeFilter);
    newParams.set("page", newPage.toString());

    router.push(`/dashboard/company/leave?${newParams.toString()}`);
  };

  const handleApprove = async (id: number) => {
    try {
      setIsLoading(true);
      const result = await onUpdateLeaveStatus(id, "APPROVED");

      if (result.success) {
        setLeaveRequests((prev) =>
          prev.map((req) =>
            req.leaveId === id
              ? {
                  ...req,
                  leaveStatus: "APPROVED",
                }
              : req
          )
        );
        setShowConfirmation(null);
      } else {
        alert(result.error || "Failed to approve leave");
      }
    } catch (error) {
      console.error("Failed to approve leave:", error);
      alert("Failed to approve leave");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    try {
      setIsLoading(true);
      const result = await onUpdateLeaveStatus(id, "REJECTED", message);

      if (result.success) {
        setLeaveRequests((prev) =>
          prev.map((req) =>
            req.leaveId === id
              ? {
                  ...req,
                  leaveStatus: "REJECTED",
                  rejectionReason: message,
                }
              : req
          )
        );
        setShowConfirmation(null);
        setMessage("");
      } else {
        alert(result.error || "Failed to reject leave");
      }
    } catch (error) {
      console.error("Failed to reject leave:", error);
      alert("Failed to reject leave");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessage = (id: number) => {
    alert(
      `Message sent to ${
        leaveRequests.find((r) => r.leaveId === id)?.userId
      } successfully!`
    );
    setShowConfirmation(null);
    setMessage("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600">
            Review and manage intern leave requests
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Requests
                </p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {statusCounts.pending}
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
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {statusCounts.approved}
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
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {statusCounts.rejected}
                </p>
              </div>
              <X className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 md:w-1/2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by reason..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Annual">Annual Leave</SelectItem>
                <SelectItem value="Sick">Sick Leave</SelectItem>
                <SelectItem value="Personal">Personal Leave</SelectItem>
                <SelectItem value="Vacation">Vacation</SelectItem>
                <SelectItem value="Study">Study Leave</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? "Loading..." : "Apply"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Leave Requests List */}
      {!isLoading && (
        <div className="space-y-4">
          {leaveRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No leave requests found</p>
              </CardContent>
            </Card>
          ) : (
            leaveRequests.map((request) => (
              <Card
                key={request.leaveId}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        {getStatusIcon(request.leaveStatus as LeaveStatus)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.fristName} {request.lastName}
                          </h3>
                          {getStatusBadge(request.leaveStatus as LeaveStatus)}
                          <Badge variant="outline">{request.leaveType}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">
                              <strong>Start Date:</strong> {request.fromDate}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>End Date:</strong> {request.toDate}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Applied:</strong>{" "}
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              <strong>University:</strong> {request.university}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Field:</strong> {request.feildOfStudy}
                            </p>
                          </div>
                          <div>
                            {request.leaveStatus === "APPROVED" &&
                              request.approvedBy && (
                                <p className="text-sm text-gray-600">
                                  <strong>Approved by:</strong>{" "}
                                  {request.approvedBy}
                                </p>
                              )}
                            {request.leaveStatus === "REJECTED" &&
                              request.rejectionReason && (
                                <p className="text-sm text-gray-600">
                                  <strong>Rejection Reason:</strong>{" "}
                                  {request.rejectionReason}
                                </p>
                              )}
                          </div>
                        </div>

                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm">
                            <strong>Reason:</strong> {request.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {request.leaveStatus === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              setShowConfirmation({
                                id: request.leaveId,
                                action: "approve",
                              })
                            }
                            disabled={isLoading}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                            onClick={() =>
                              setShowConfirmation({
                                id: request.leaveId,
                                action: "reject",
                              })
                            }
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setShowConfirmation({
                            id: request.leaveId,
                            action: "message",
                          })
                        }
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={!!showConfirmation}
        onOpenChange={() => setShowConfirmation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showConfirmation?.action === "approve" &&
                "Approve Leave Request"}
              {showConfirmation?.action === "reject" && "Reject Leave Request"}
              {showConfirmation?.action === "message" && "Send Message"}
            </DialogTitle>
            <DialogDescription>
              {showConfirmation?.action === "approve" &&
                "Are you sure you want to approve this leave request?"}
              {showConfirmation?.action === "reject" &&
                "Please provide a reason for rejecting this leave request:"}
              {showConfirmation?.action === "message" &&
                "Send a message to the intern about their leave request:"}
            </DialogDescription>
          </DialogHeader>

          {(showConfirmation?.action === "reject" ||
            showConfirmation?.action === "message") && (
            <Textarea
              placeholder={
                showConfirmation?.action === "reject"
                  ? "Enter rejection reason..."
                  : "Enter your message..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!showConfirmation) return;

                if (showConfirmation.action === "approve") {
                  handleApprove(showConfirmation.id);
                } else if (showConfirmation.action === "reject") {
                  handleReject(showConfirmation.id);
                } else if (showConfirmation.action === "message") {
                  handleMessage(showConfirmation.id);
                }
              }}
              disabled={
                isLoading || (showConfirmation?.action === "reject" && !message)
              }
              className={
                showConfirmation?.action === "reject"
                  ? "bg-red-600 hover:bg-red-700"
                  : showConfirmation?.action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
            >
              {isLoading
                ? "Processing..."
                : showConfirmation?.action === "approve"
                ? "Approve"
                : showConfirmation?.action === "reject"
                ? "Reject"
                : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) handlePageChange(page - 1);
                }}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={page === i + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(i + 1);
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
                  if (page < totalPages) handlePageChange(page + 1);
                }}
                className={
                  page >= totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Leave Policy */}
      {!isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Leave Management Policy</CardTitle>
            <CardDescription>
              Guidelines for reviewing and approving leave requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Approval Guidelines:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    • <strong>Sick Leave:</strong> Approve immediately, may
                    require medical certificate for &gt;3 days
                  </li>
                  <li>
                    • <strong>Personal Leave:</strong> Consider urgency and
                    project impact
                  </li>
                  <li>
                    • <strong>Vacation:</strong> Require 1-week advance notice
                    minimum
                  </li>
                  <li>
                    • <strong>Study Leave:</strong> Coordinate with university
                    requirements
                  </li>
                  <li>• Consider project deadlines and team availability</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Review Process:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Review requests within 24 hours of submission</li>
                  <li>• Consult with project mentors for impact assessment</li>
                  <li>• Provide clear reasons for any rejections</li>
                  <li>
                    • Suggest alternative dates if original request conflicts
                  </li>
                  <li>• Update project timelines if necessary</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
