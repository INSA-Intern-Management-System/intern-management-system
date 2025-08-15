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
import { DashboardLayout } from "@/components/layout/dashboard-layout";
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
import { useState } from "react";

// Define types for our data
type LeaveStatus = "pending" | "approved" | "rejected";
type LeaveType = "Sick Leave" | "Personal Leave" | "Vacation" | "Study Leave";

interface LeaveRequest {
  id: number;
  intern: string;
  position: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  project: string;
  mentor: string;
  approvedBy?: string;
  approvedOn?: string;
  rejectedBy?: string;
  rejectedOn?: string;
  rejectionReason?: string;
}

// Update ConfirmationState to include 'message'
interface ConfirmationState {
  id: number;
  action: "approve" | "reject" | "message";
}

export default function CompanyLeavePage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: 1,
      intern: "Sophie Laurent",
      position: "UI/UX Designer",
      type: "Sick Leave",
      startDate: "2024-02-15",
      endDate: "2024-02-16",
      days: 2,
      reason: "Medical appointment and recovery",
      status: "pending",
      appliedOn: "2024-02-13",
      project: "Mobile App Redesign",
      mentor: "Sarah Wilson",
    },
    {
      id: 2,
      intern: "Pierre Martin",
      position: "Data Analyst",
      type: "Personal Leave",
      startDate: "2024-02-20",
      endDate: "2024-02-20",
      days: 1,
      reason: "Family emergency",
      status: "approved",
      appliedOn: "2024-02-18",
      project: "Customer Analytics Dashboard",
      mentor: "Tom Davis",
      approvedBy: "HR Team",
      approvedOn: "2024-02-18",
    },
    {
      id: 3,
      intern: "Marie Dubois",
      position: "Software Developer",
      type: "Vacation",
      startDate: "2024-03-01",
      endDate: "2024-03-03",
      days: 3,
      reason: "Pre-planned family vacation",
      status: "approved",
      appliedOn: "2024-02-10",
      project: "E-commerce Platform",
      mentor: "Alex Johnson",
      approvedBy: "Sarah Wilson",
      approvedOn: "2024-02-12",
    },
    {
      id: 4,
      intern: "Lucas Bernard",
      position: "Software Developer",
      type: "Study Leave",
      startDate: "2024-02-25",
      endDate: "2024-02-25",
      days: 1,
      reason: "University exam",
      status: "pending",
      appliedOn: "2024-02-23",
      project: "Internal Tools",
      mentor: "Sarah Wilson",
      rejectedBy: "HR Team",
      rejectedOn: "2024-02-24",
      rejectionReason: "Insufficient advance notice for exam leave",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [showConfirmation, setShowConfirmation] =
    useState<ConfirmationState | null>(null);
  const [message, setMessage] = useState<string>("");
  const pageSize = 3;

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: LeaveStatus) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <X className="h-5 w-5 text-red-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-600" />;
    }
  };

  // Apply search and filters
  const filteredRequests = leaveRequests.filter((request) => {
    const matchesSearch =
      searchTerm === "" ||
      request.intern.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.project.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && request.status === "pending") ||
      (statusFilter === "approved" && request.status === "approved") ||
      (statusFilter === "rejected" && request.status === "rejected");

    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "sick" && request.type === "Sick Leave") ||
      (typeFilter === "personal" && request.type === "Personal Leave") ||
      (typeFilter === "vacation" && request.type === "Vacation") ||
      (typeFilter === "study" && request.type === "Study Leave");

    return matchesSearch && matchesStatus && matchesType;
  });

  // Disable pagination during search
  const paginatedLeaveRequests = searchTerm
    ? filteredRequests
    : filteredRequests.slice((page - 1) * pageSize, page * pageSize);

  const totalPages = searchTerm
    ? 1
    : Math.ceil(filteredRequests.length / pageSize);

  const handleApprove = (id: number) => {
    setLeaveRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: "approved",
              approvedBy: "You",
              approvedOn: new Date().toISOString().split("T")[0],
            }
          : req
      )
    );
    setShowConfirmation(null);
  };

  const handleReject = (id: number) => {
    setLeaveRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: "rejected",
              rejectedBy: "You",
              rejectedOn: new Date().toISOString().split("T")[0],
              rejectionReason: message || "Leave request declined",
            }
          : req
      )
    );
    setShowConfirmation(null);
    setMessage("");
  };

  const handleMessage = (id: number) => {
    alert(
      `Message sent to ${
        leaveRequests.find((r) => r.id === id)?.intern
      } successfully!`
    );
    setShowConfirmation(null);
    setMessage("");
  };

  const pendingRequests = filteredRequests.filter(
    (req) => req.status === "pending"
  );
  const approvedRequests = filteredRequests.filter(
    (req) => req.status === "approved"
  );
  const rejectedRequests = filteredRequests.filter(
    (req) => req.status === "rejected"
  );

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Leave Management
            </h1>
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
                  <p className="text-2xl font-bold">
                    {filteredRequests.length}
                  </p>
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
                    {pendingRequests.length}
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
                    {approvedRequests.length}
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
                    {rejectedRequests.length}
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
                    placeholder="Search by intern name or project..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1); // Reset to first page when searching
                    }}
                  />
                </div>
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1); // Reset to first page when filter changes
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={typeFilter}
                onValueChange={(value) => {
                  setTypeFilter(value);
                  setPage(1); // Reset to first page when filter changes
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal Leave</SelectItem>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="study">Study Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leave Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center">
              <Search className="mx-auto mb-4 h-10 w-10 text-gray-400" />
              <p className="text-lg font-medium text-gray-600">
                No applications found
              </p>
              <p className="text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            paginatedLeaveRequests.map((request) => (
              <Card
                key={request.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        {getStatusIcon(request.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.intern}
                          </h3>
                          {getStatusBadge(request.status)}
                          <Badge variant="outline">{request.type}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">
                              <strong>Position:</strong> {request.position}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Project:</strong> {request.project}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Mentor:</strong> {request.mentor}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              <strong>Duration:</strong> {request.startDate} to{" "}
                              {request.endDate}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Days:</strong> {request.days} day(s)
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Applied:</strong> {request.appliedOn}
                            </p>
                          </div>
                          <div>
                            {request.status === "approved" && (
                              <>
                                <p className="text-sm text-gray-600">
                                  <strong>Approved by:</strong>{" "}
                                  {request.approvedBy}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <strong>Approved on:</strong>{" "}
                                  {request.approvedOn}
                                </p>
                              </>
                            )}
                            {request.status === "rejected" && (
                              <>
                                <p className="text-sm text-gray-600">
                                  <strong>Rejected by:</strong>{" "}
                                  {request.rejectedBy}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <strong>Rejected on:</strong>{" "}
                                  {request.rejectedOn}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm">
                            <strong>Reason:</strong> {request.reason}
                          </p>
                        </div>
                        {request.status === "rejected" &&
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
                    <div className="flex flex-col space-y-2">
                      {request.status === "pending" && (
                        <>
                          {/* Approve Button with Confirmation */}
                          {showConfirmation?.id === request.id &&
                          showConfirmation.action === "approve" ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                              <p className="text-sm font-medium text-green-800">
                                Approve Leave Request?
                              </p>
                              <p className="text-xs text-green-600">
                                Approve {request.intern}'s leave request?
                              </p>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7 bg-transparent"
                                  onClick={() => setShowConfirmation(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-xs h-7"
                                  onClick={() => handleApprove(request.id)}
                                >
                                  Yes, Approve
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-green-600 text-white hover:bg-green-700"
                              onClick={() =>
                                setShowConfirmation({
                                  id: request.id,
                                  action: "approve",
                                })
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          )}

                          {/* Reject Button with Confirmation */}
                          {showConfirmation?.id === request.id &&
                          showConfirmation.action === "reject" ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                              <p className="text-sm font-medium text-red-800">
                                Reject Leave Request?
                              </p>
                              <p className="text-xs text-red-600">
                                Reject {request.intern}'s leave request?
                              </p>
                              <div className="mb-2">
                                <Input
                                  placeholder="Enter reason for rejection..."
                                  value={message}
                                  onChange={(e) => setMessage(e.target.value)}
                                  className="text-xs h-8"
                                />
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7 bg-transparent"
                                  onClick={() => setShowConfirmation(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700 text-xs h-7"
                                  onClick={() => handleReject(request.id)}
                                >
                                  Yes, Reject
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-100 bg-red-50"
                              onClick={() => {
                                setShowConfirmation({
                                  id: request.id,
                                  action: "reject",
                                });
                                setMessage("");
                              }}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          )}
                        </>
                      )}

                      {/* Message Button with Confirmation */}
                      {showConfirmation?.id === request.id &&
                      showConfirmation.action === "message" ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                          <p className="text-sm font-medium text-blue-800">
                            Send Message
                          </p>
                          <p className="text-xs text-blue-600">
                            Send a message to {request.intern}?
                          </p>
                          <div className="mb-2">
                            <textarea
                              placeholder="Type your message here..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="w-full p-1 text-xs border border-gray-300 rounded-md h-16"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 bg-transparent"
                              onClick={() => setShowConfirmation(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-xs h-7"
                              onClick={() => handleMessage(request.id)}
                            >
                              Send Message
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-600 text-blue-600 bg-blue-50 hover:bg-blue-100"
                          onClick={() => {
                            setShowConfirmation({
                              id: request.id,
                              action: "message",
                            });
                            setMessage("");
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
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
        {!searchTerm && totalPages > 1 && (
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
        <Card>
          <CardDescription className="px-6 pt-6">
            Guidelines for reviewing and approving leave requests
          </CardDescription>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Approval Guidelines:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    • <strong>Sick Leave:</strong> Approve immediately, may
                    require medical certificate for {">"} 3 days
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
      </div>
    </DashboardLayout>
  );
}
