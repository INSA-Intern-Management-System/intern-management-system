// app/company/leave/CompanyLeavePageClient.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
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
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LeaveRequest, StatusCounts } from "@/types/entities";

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

    router.push(`/company/leave?${newParams.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(params);
    newParams.set("page", newPage.toString());
    router.push(`/company/leave?${newParams.toString()}`);
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
      {/* Header and Stats Cards (same as before) */}

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
                handleSearch();
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
                handleSearch();
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
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

      {/* Leave Requests List (similar to before but using leaveId instead of id) */}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) handlePageChange(page - 1);
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
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
