"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Calendar, Plus, Clock, CheckCircle, X } from "lucide-react"
import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"

export default function LeavePage() {
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
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState({ type: '', startDate: '', endDate: '', reason: '' });
  const [requests, setRequests] = React.useState(leaveRequests);
  // Pagination
  const [page, setPage] = React.useState(1);
  const pageSize = 3;
  const totalPages = Math.ceil(requests.length / pageSize);
  const paginatedLeaveRequests = requests.slice((page - 1) * pageSize, page * pageSize);

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Requests</h1>
            <p className="text-gray-600">Manage your leave applications and time off</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Request Leave
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Leave</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleFormSubmit}>
                <select
                  className="w-full border rounded px-3 py-2"
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select Leave Type</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Vacation">Vacation</option>
                </select>
                <input
                  className="w-full border rounded px-3 py-2"
                  name="startDate"
                  type="date"
                  placeholder="Start Date"
                  value={form.startDate}
                  onChange={handleFormChange}
                  required
                />
                <input
                  className="w-full border rounded px-3 py-2"
                  name="endDate"
                  type="date"
                  placeholder="End Date"
                  value={form.endDate}
                  onChange={handleFormChange}
                  required
                />
                <textarea
                  className="w-full border rounded px-3 py-2"
                  name="reason"
                  placeholder="Reason for leave"
                  value={form.reason}
                  onChange={handleFormChange}
                  rows={3}
                  required
                />
                <div className="flex space-x-2">
                  <Button type="submit">Submit</Button>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Leave Requests List */}
        <div className="space-y-4">
          {paginatedLeaveRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      {getStatusIcon(request.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{request.type}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
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
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">
                          <strong>Reason:</strong> {request.reason}
                        </p>
                      </div>
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
        <Card>
          <CardHeader>
            <CardTitle>Leave Policy</CardTitle>
            <CardDescription>Important information about leave requests</CardDescription>
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
