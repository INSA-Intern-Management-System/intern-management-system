"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { FileText, Plus, Upload } from "lucide-react"

// Mock data
const initialApplications = [
  {
    id: 1,
    student: "John Doe",
    email: "john.doe@student.insa.fr",
    company: "Tech Corp",
    position: "Software Developer",
    status: "pending",
    date: "2024-03-10",
  },
  {
    id: 2,
    student: "Jane Smith",
    email: "jane.smith@student.insa.fr",
    company: "Innovation Labs",
    position: "Data Analyst",
    status: "approved",
    date: "2024-03-09",
  },
  {
    id: 3,
    student: "Mike Johnson",
    email: "mike.johnson@student.insa.fr",
    company: "StartupXYZ",
    position: "UI/UX Designer",
    status: "pending",
    date: "2024-03-08",
  },
  {
    id: 4,
    student: "Sarah Wilson",
    email: "sarah.wilson@student.insa.fr",
    company: "Digital Agency",
    position: "Marketing Intern",
    status: "rejected",
    date: "2024-03-07",
  },
]

export default function UniversityApplicationsPage() {
  const [applications, setApplications] = useState(initialApplications)
  const [showNew, setShowNew] = useState(false)
  const [showBatch, setShowBatch] = useState(false)
  const [newApp, setNewApp] = useState({ student: "", email: "", company: "", position: "" })
  const [page, setPage] = useState(1)
  const pageSize = 3
  const totalPages = Math.ceil(applications.length / pageSize)
  const paginatedApplications = applications.slice((page - 1) * pageSize, page * pageSize)

  const handleNewApp = (e: React.FormEvent) => {
    e.preventDefault()
    setApplications([
      { id: applications.length + 1, ...newApp, status: "pending", date: new Date().toISOString().slice(0, 10) },
      ...applications,
    ])
    setShowNew(false)
    setNewApp({ student: "", email: "", company: "", position: "" })
    setPage(1)
  }

  // Simulate batch import (just adds a mock row)
  const handleBatchImport = (e: React.FormEvent) => {
    e.preventDefault()
    setApplications([
      { id: applications.length + 1, student: "Batch Student", email: "batch@student.insa.fr", company: "Batch Co", position: "Batch Position", status: "pending", date: new Date().toISOString().slice(0, 10) },
      ...applications,
    ])
    setShowBatch(false)
    setPage(1)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs">Approved</span>
      case "rejected":
        return <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs">Rejected</span>
      case "pending":
      default:
        return <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs">Pending</span>
    }
  }

  return (
    <DashboardLayout requiredRole="university">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-600">Submit and manage internship applications for your students</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={showNew} onOpenChange={setShowNew}>
              <DialogTrigger asChild>
                <Button onClick={() => setShowNew(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Application
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Application</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleNewApp}>
                  <Input placeholder="Student Name" value={newApp.student} onChange={e => setNewApp({ ...newApp, student: e.target.value })} required />
                  <Input placeholder="Student Email" value={newApp.email} onChange={e => setNewApp({ ...newApp, email: e.target.value })} required />
                  <Input placeholder="Company" value={newApp.company} onChange={e => setNewApp({ ...newApp, company: e.target.value })} required />
                  <Input placeholder="Position" value={newApp.position} onChange={e => setNewApp({ ...newApp, position: e.target.value })} required />
                  <div className="flex space-x-2">
                    <Button type="submit">Submit</Button>
                    <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={showBatch} onOpenChange={setShowBatch}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setShowBatch(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Batch Import (Excel)
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Batch Application Import</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleBatchImport}>
                  <Input type="file" accept=".xlsx,.xls,.csv" required />
                  <div className="flex space-x-2">
                    <Button type="submit">Import</Button>
                    <Button type="button" variant="outline" onClick={() => setShowBatch(false)}>Cancel</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>All Applications ({applications.length})</CardTitle>
            <CardDescription>List of all internship applications submitted by the university</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedApplications.map(app => (
                <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{app.student}</span>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-sm text-gray-600">{app.email}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>{app.company} • {app.position}</span>
                      <span>Applied: {app.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
      </div>
    </DashboardLayout>
  )
} 