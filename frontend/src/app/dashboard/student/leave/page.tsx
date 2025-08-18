// "use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import DashboardLayout from "@/app/layout/dashboard-layout";
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  X,
  Search,
  Trash2,
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
} from "@/components/ui/pagination";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/api/axios";
import { getUserIdFromCookie } from "@/app/services/authService";

interface LeaveRequest {
  id: number;
  userId: number;
  receiverId: number;
  startDate: string;
  endDate: string;
  description?: string;
  type?: string;
  status?: string;
  createdAt: string;
  approvedBy?: string | null;
  rejectionReason?: string | null;
  days?: number;
}

interface LeaveResponse {
  content: LeaveRequest[];
  totalPages: number;
  totalElements: number;
  number: number;
}

interface StatusCounts {
  pending: number;
  approved: number;
  rejected: number;
}

const fetchLeaveRequests = async (
  page: number,
  size: number,
  userId: string
): Promise<LeaveResponse> => {
  const response = await api.get(`/leaves?page=${page - 1}&size=${size}`, {
    withCredentials: true,
  });
  return response.data;
};

const fetchStatusCounts = async (userId: string): Promise<StatusCounts> => {
  const response = await api.get(`/leaves/status-counts`, {
    withCredentials: true,
  });
  return response.data;
};

const searchLeaveRequests = async (
  page: number,
  size: number,
  userId: string,
  leaveType: string,
  reason: string
): Promise<LeaveResponse> => {
  const params = new URLSearchParams();
  if (leaveType !== "all") params.append("leaveType", leaveType);
  if (reason) params.append("reason", reason);
  params.append("page", (page - 1).toString());
  params.append("size", size.toString());
  const response = await api.get(`/leaves/search?${params.toString()}`, {
    withCredentials: true,
  });
  return response.data;
};

const filterLeaveRequests = async (
  page: number,
  size: number,
  userId: string,
  leaveType: string,
  leaveStatus: string
): Promise<LeaveResponse> => {
  const params = new URLSearchParams();
  if (leaveType !== "all") params.append("leaveType", leaveType);
  if (leaveStatus !== "all")
    params.append("leaveStatus", leaveStatus.toUpperCase());
  params.append("page", (page - 1).toString());
  params.append("size", size.toString());
  const response = await api.get(`/leaves/filter?${params.toString()}`, {
    withCredentials: true,
  });
  return response.data;
};

const createLeaveRequest = async (leave: {
  type: string;
  startDate: string;
  endDate: string;
  description: string;
  receiverId: number;
  days: number;
}): Promise<LeaveRequest> => {
  const response = await api.post(`/leaves`, leave, {
    withCredentials: true,
  });
  return response.data;
};

const deleteLeaveRequest = async (
  leaveId: number
): Promise<{ message: string }> => {
  const response = await api.delete(`/leaves/${leaveId}`, {
    withCredentials: true,
  });
  return response.data;
};

export default function StudentLeavePage() {
  const userId = getUserIdFromCookie();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    type: "",
    startDate: "",
    endDate: "",
    description: "",
    receiverId: "456", // Mock receiverId (e.g., supervisor)
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 3;

  const { data: leaveData, refetch: refetchLeaves } = useQuery<LeaveResponse>({
    queryKey: ["leaves", page, search, statusFilter, typeFilter, userId],
    queryFn: () =>
      search !== "" || statusFilter !== "all" || typeFilter !== "all"
        ? searchLeaveRequests(page, pageSize, userId!, typeFilter, search)
        : filterLeaveRequests(
            page,
            pageSize,
            userId!,
            typeFilter,
            statusFilter
          ),
    enabled: !!userId,
  });

  const { data: statusCounts } = useQuery<StatusCounts>({
    queryKey: ["leaveStatusCounts", userId],
    queryFn: () => fetchStatusCounts(userId!),
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: createLeaveRequest,
    onSuccess: () => {
      refetchLeaves();
      setForm({
        type: "",
        startDate: "",
        endDate: "",
        description: "",
        receiverId: "456",
      });
      setDialogOpen(false);
      setPage(1);
    },
    onError: (error: any) => {
      console.error("Failed to create leave request:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLeaveRequest,
    onSuccess: () => {
      refetchLeaves();
    },
    onError: (error: any) => {
      console.error("Failed to delete leave request:", error);
    },
  });

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

  const handleFormChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { name: string; value: string }
  ) => {
    const { name, value } = "target" in e ? e.target : e;
    setForm({ ...form, [name]: value });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);
    const days =
      Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    if (days < 1) {
      console.error("End date must be after start date");
      return;
    }
    createMutation.mutate({
      ...form,
      receiverId: Number(form.receiverId),
      days,
    });
  };

  const handleDelete = (leaveId: number) => {
    deleteMutation.mutate(leaveId);
  };

  const requests = leaveData?.content || [];
  const totalPages = leaveData?.totalPages || 1;

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between ">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 pr-2">
              Leave Management
            </h1>
            <p className="text-gray-600">
              Apply for and track your leave requests
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white hover:bg-gray-900 w-full md:w-auto flex items-center justify-center">
                <Plus className="h-4 w-4 mr-2" />
                Request Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full border-none">
              <DialogHeader>
                <DialogTitle>Request Leave</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleFormSubmit}>
                <Select
                  name="type"
                  value={form.type}
                  onValueChange={(value) =>
                    handleFormChange({ name: "type", value })
                  }
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Leave Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                    <SelectItem value="Personal Leave">
                      Personal Leave
                    </SelectItem>
                    <SelectItem value="Vacation">Vacation</SelectItem>
                    <SelectItem value="Study Leave">Study Leave</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  name="startDate"
                  type="date"
                  placeholder="Start Date"
                  value={form.startDate}
                  onChange={handleFormChange}
                  required
                />
                <Input
                  name="endDate"
                  type="date"
                  placeholder="End Date"
                  value={form.endDate}
                  onChange={handleFormChange}
                  required
                />
                <Textarea
                  name="description"
                  placeholder="Reason for leave"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={3}
                  required
                />
                <div className="flex space-x-2 mt-2">
                  <Button
                    type="submit"
                    className="bg-black text-white hover:bg-gray-900 px-6"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Submitting..." : "Submit"}
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
                    {leaveData?.totalElements || 0}
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
                    {statusCounts?.pending || 0}
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
                    {statusCounts?.approved || 0}
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
                    {statusCounts?.rejected || 0}
                  </p>
                </div>
                <X className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by leave type or reason..."
                    className="w-full pl-10 rounded-md bg-white border border-gray-200 h-10"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[200px] border-0 bg-gray-100 text-gray-600 rounded-md">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
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
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[200px] border-0 bg-gray-100 text-gray-600 rounded-md">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                  <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                  <SelectItem value="Vacation">Vacation</SelectItem>
                  <SelectItem value="Study Leave">Study Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leave Requests List */}
        <div className="space-y-4">
          {requests.length > 0 ? (
            requests.map((request) => (
              <Card
                key={request.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        {getStatusIcon(request.status || "")}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.type}
                          </h3>
                          {getStatusBadge(request.status || "")}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                          <div>
                            <p>
                              <strong>Duration:</strong> {request.startDate} to{" "}
                              {request.endDate}
                            </p>
                            <p>
                              <strong>Days:</strong> {request.days} day(s)
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Applied on:</strong> {request.createdAt}
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
                            <strong>Reason:</strong> {request.description}
                          </p>
                        </div>
                        {request.status === "REJECTED" &&
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
                    {request.status === "PENDING" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(request.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <CardContent className="p-6 text-center text-gray-500">
                No leave requests found matching your criteria
              </CardContent>
            </Card>
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
                    • <strong>Sick Leave:</strong> Medical appointments and
                    illness
                  </li>
                  <li>
                    • <strong>Personal Leave:</strong> Family emergencies and
                    personal matters
                  </li>
                  <li>
                    • <strong>Vacation:</strong> Planned time off (advance
                    notice required)
                  </li>
                  <li>
                    • <strong>Study Leave:</strong> Academic commitments and
                    exams
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
    </DashboardLayout>
  );
}
