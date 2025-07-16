"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Send, CheckCircle, Clock, FileText, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"
import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Weekly Reports</h1>
            <p className="text-gray-600">Submit and track your weekly progress reports</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogOpen(true)}>
                <Send className="h-4 w-4 mr-2" />
                Submit New Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit New Report</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleFormSubmit}>
                <input
                  className="w-full border rounded px-3 py-2"
                  name="week"
                  placeholder="Week (e.g., Week 4)"
                  value={form.week}
                  onChange={handleFormChange}
                  required
                />
                <input
                  className="w-full border rounded px-3 py-2"
                  name="date"
                  type="date"
                  placeholder="Date"
                  value={form.date}
                  onChange={handleFormChange}
                  required
                />
                <textarea
                  className="w-full border rounded px-3 py-2"
                  name="content"
                  placeholder="Report Content"
                  value={form.content}
                  onChange={handleFormChange}
                  rows={4}
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

        {/* Reports List */}
        <div className="space-y-4">
          {reports.slice(0, 3).map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        report.submitted ? "bg-green-100" : "bg-yellow-100"
                      }`}
                    >
                      {report.submitted ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Clock className="h-6 w-6 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{report.week}</h3>
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
        <Card>
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
