"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Send, CheckCircle, Clock, FileText, Calendar, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"
import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReportsPage() {
  const router = useRouter();
  const reports = [
    {
      id: 1,
      week: "Week 1",
      submitted: true,
      feedback: "Great start! Keep up the good work.",
      date: "2024-01-22",
      grade: "A",
      submittedOn: "2024-01-21",
    },
    {
      id: 2,
      week: "Week 2",
      submitted: true,
      feedback: "Excellent progress on the project.",
      date: "2024-01-29",
      grade: "A+",
      submittedOn: "2024-01-28",
    },
    {
      id: 3,
      week: "Week 3",
      submitted: false,
      feedback: null,
      date: "2024-02-05",
      grade: null,
      submittedOn: null,
    },
    // ... more reports if needed
  ];
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState({ week: '', date: '', content: '' });
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted report:', form);
    setDialogOpen(false);
    setForm({ week: '', date: '', content: '' });
  };
  // Pagination
  const [page, setPage] = React.useState(1);
  const pageSize = 2;
  const totalPages = Math.ceil(reports.length / pageSize);
  const paginatedReports = reports.slice((page - 1) * pageSize, page * pageSize);

  const submittedReports = reports.filter((r) => r.submitted);
  const pendingReports = reports.filter((r) => !r.submitted);
  const avgGrade = (() => {
    const grades = reports.filter(r => r.grade).map(r => r.grade === "A+" ? 4.3 : r.grade === "A" ? 4.0 : r.grade === "B" ? 3.0 : 0);
    return grades.length ? (grades.reduce((a: number, b: number) => a + b, 0) / grades.length).toFixed(2) : "-";
  })();
  // Search/filter state (UI only, not functional)
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [weekFilter, setWeekFilter] = React.useState("all");

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6 bg-gray-50 min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Weekly Reports</h1>
            <p className="text-gray-600">Submit and track your weekly progress reports</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white hover:bg-gray-900" onClick={() => setDialogOpen(true)}>
                <Send className="h-4 w-4 mr-2" />
                Submit New Report
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full border-none">
              <div>
                <h2 className="text-xl font-semibold mb-4">Submit New Report</h2>
                <form className="space-y-4" onSubmit={handleFormSubmit}>
                  <input
                    className="w-full border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    name="week"
                    placeholder="Week (e.g., Week 4)"
                    value={form.week}
                    onChange={handleFormChange}
                    required
                  />
                  <input
                    className="w-full border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    name="date"
                    type="date"
                    placeholder="mm/dd/yyyy"
                    value={form.date}
                    onChange={handleFormChange}
                    required
                  />
                  <textarea
                    className="w-full border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    name="content"
                    placeholder="Report Content"
                    value={form.content}
                    onChange={handleFormChange}
                    rows={4}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Submitted</p>
                  <p className="text-2xl font-bold text-green-600">{submittedReports.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Grade</p>
                  <p className="text-2xl font-bold text-purple-600">{avgGrade}</p>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
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
                  <Send className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="Search by week or feedback..." className="pl-10 rounded-md bg-white border border-gray-200" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 border border-gray-200 bg-white text-gray-700 rounded-md">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={weekFilter} onValueChange={setWeekFilter}>
                <SelectTrigger className="w-48 border border-gray-200 bg-white text-gray-700 rounded-md">
                  <SelectValue placeholder="Filter by week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weeks</SelectItem>
                  <SelectItem value="current">Current Week</SelectItem>
                  <SelectItem value="last">Last Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {paginatedReports.map((report) => (
            <Card key={report.id} className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${report.submitted ? "bg-green-100" : "bg-yellow-100"}`}
                    >
                      {report.submitted ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Clock className="h-6 w-6 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{report.week}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Due: {report.date}
                        </span>
                        {report.submittedOn && <span>Submitted: {report.submittedOn}</span>}
                      </div>
                      {report.feedback && (
                        <p className="text-sm text-green-600 mt-2 bg-green-50 p-2 rounded">💬 {report.feedback}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" size="sm">
                      {report.submitted ? "View Report" : "Submit Report"}
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

        {/* Report Guidelines */}
        <Card className="bg-white border border-gray-200 rounded-lg mt-6 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Report Guidelines</CardTitle>
            <CardDescription>What to include in your weekly reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Required Sections:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Tasks completed this week</li>
                  <li>• Challenges faced and solutions</li>
                  <li>• Skills learned or improved</li>
                  <li>• Goals for next week</li>
                  <li>• Questions or support needed</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Tips for Success:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Be specific and detailed</li>
                  <li>• Include measurable achievements</li>
                  <li>• Reflect on your learning experience</li>
                  <li>• Submit on time every week</li>
                  <li>• Ask questions when needed</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
