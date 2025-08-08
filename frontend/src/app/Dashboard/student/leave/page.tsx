"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Calendar, Plus, Clock, CheckCircle, X, Search } from "lucide-react"
import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"

export default function StudentLeavePage() {
  const leaveRequests = [
    {
      id: 1,
      type: "Sick Leave",
      startDate: "2024-02-10",
      endDate: "2024-02-12",
      days: 3,
      reason: "Medical appointment and recovery",
      status: "approved",
      appliedOn: "2024-02-08",
      approvedBy: "Sarah Wilson",
    },
    {
      id: 2,
      type: "Personal Leave",
      startDate: "2024-02-20",
      endDate: "2024-02-20",
      days: 1,
      reason: "Family emergency",
      status: "pending",
      appliedOn: "2024-02-15",
      approvedBy: null,
    },
    {
      id: 3,
      type: "Vacation",
      startDate: "2024-01-15",
      endDate: "2024-01-17",
      days: 3,
      reason: "Pre-planned vacation",
      status: "rejected",
      appliedOn: "2024-01-10",
      approvedBy: "Sarah Wilson",
      rejectionReason: "Vacation quota exceeded for the month",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "rejected":
        return <X className="h-5 w-5 text-red-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <Calendar className="h-5 w-5 text-gray-600" />
    }
  }

  const pendingRequests = leaveRequests.filter((req) => req.status === "pending")
  const approvedRequests = leaveRequests.filter((req) => req.status === "approved")
  const rejectedRequests = leaveRequests.filter((req) => req.status === "rejected")

  // Dialog and form state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState({ type: '', startDate: '', endDate: '', reason: '' });
  const [requests, setRequests] = React.useState(leaveRequests);
  // Pagination
  const [page, setPage] = React.useState(1);
  const pageSize = 3;
  const totalPages = Math.ceil(requests.length / pageSize);
  const paginatedLeaveRequests = requests.slice((page - 1) * pageSize, page * pageSize);

  // Search/filter state (UI only, not functional)
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRequests([
      {
        id: requests.length + 1,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        days: (new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1,
        reason: form.reason,
        status: 'pending',
        appliedOn: new Date().toISOString().slice(0, 10),
        approvedBy: null,
      },
      ...requests,
    ]);
    setForm({ type: '', startDate: '', endDate: '', reason: '' });
    setDialogOpen(false);
    setPage(1);
  };

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6 bg-gray-50 min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-600">Apply for and track your leave requests</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white hover:bg-gray-900" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Request Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full border-none">
              <div>
                <h2 className="text-xl font-semibold mb-4">Request Leave</h2>
                <form className="space-y-4" onSubmit={handleFormSubmit}>
                  <select
                    className="w-full border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    name="type"
                    value={form.type}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select Leave Type</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Personal Leave">Personal Leave</option>
                    <option value="Vacation">Vacation</option>
                    <option value="Study Leave">Study Leave</option>
                  </select>
                  <input
                    className="w-full border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    name="startDate"
                    type="date"
                    placeholder="mm/dd/yyyy"
                    value={form.startDate}
                    onChange={handleFormChange}
                    required
                  />
                  <input
                    className="w-full border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    name="endDate"
                    type="date"
                    placeholder="mm/dd/yyyy"
                    value={form.endDate}
                    onChange={handleFormChange}
                    required
                  />
                  <textarea
                    className="w-full border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    name="reason"
                    placeholder="Reason for leave"
                    value={form.reason}
                    onChange={handleFormChange}
                    rows={3}
                    required
                  />
                  <div className="flex space-x-2 mt-2">
                    <Button type="submit" className="bg-black text-white hover:bg-gray-900 px-6">Submit</Button>
                    <Button type="button" variant="outline" className="border-black text-black px-6" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold">{requests.length}</p>
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
                  <p className="text-2xl font-bold text-yellow-600">{requests.filter(r => r.status === "pending").length}</p>
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
                  <p className="text-2xl font-bold text-green-600">{requests.filter(r => r.status === "approved").length}</p>
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
                  <p className="text-2xl font-bold text-red-600">{requests.filter(r => r.status === "rejected").length}</p>
                </div>
                <X className="h-8 w-8 text-red-600" />
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="Search by leave type or reason..." className="pl-10 rounded-md bg-white border border-gray-200 h-10" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 border-0 bg-gray-100 text-gray-600 rounded-md">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48 border-0 bg-gray-100 text-gray-600 rounded-md">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
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
          {paginatedLeaveRequests.map((request) => (
            <Card key={request.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      {getStatusIcon(request.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{request.type}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                        <div>
                          <p>
                            <strong>Duration:</strong> {request.startDate} to {request.endDate}
                          </p>
                          <p>
                            <strong>Days:</strong> {request.days} day(s)
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Applied on:</strong> {request.appliedOn}
                          </p>
                          {request.approvedBy && (
                            <p>
                              <strong>Reviewed by:</strong> {request.approvedBy}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">
                          <strong>Reason:</strong> {request.reason}
                        </p>
                      </div>
                      {request.status === "rejected" && request.rejectionReason && (
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Rejection Reason:</strong> {request.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Pagination */}
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={e => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }} />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={page === i + 1}
                  onClick={e => { e.preventDefault(); setPage(i + 1); }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={e => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        {/* Leave Policy */}
        <Card className="bg-white border border-gray-200 rounded-lg mt-6 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Leave Policy</CardTitle>
            <CardDescription>Guidelines for requesting and managing your leave</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Leave Types:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    • <strong>Sick Leave:</strong> Medical appointments and illness
                  </li>
                  <li>
                    • <strong>Personal Leave:</strong> Family emergencies and personal matters
                  </li>
                  <li>
                    • <strong>Vacation:</strong> Planned time off (advance notice required)
                  </li>
                  <li>
                    • <strong>Study Leave:</strong> Academic commitments and exams
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
  )
}
