"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { User, Search, Star, FileText, Calendar, CheckCircle, Clock } from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import jsPDF from "jspdf";
type Evaluation = {
  id: number
  student: string
  company: string
  supervisor: string
  companyRating: number
  companyFeedback: string
  status: string
  submissionDate: string
  evaluationDate: string
}
export default function EvaluationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [supervisorFilter, setSupervisorFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);


  const pageSize = 3


  // Mock data
  const [evaluations, setEvaluations] = useState([
    {
      id: 1,
      student: "John Doe",
      company: "Tech Corp",
      supervisor: "Dr. Smith",
      companyRating: 4.5,
      companyFeedback: "Excellent performance, shows great initiative and technical skills.",
      status: "completed",
      submissionDate: "2024-03-10",
      evaluationDate: "2024-03-12",
    },
    {
      id: 2,
      student: "Jane Smith",
      company: "Innovation Labs",
      supervisor: "Dr. Johnson",
      companyRating: 4.8,
      companyFeedback: "Exceptional analytical skills and professional attitude.",
      status: "completed",
      submissionDate: "2024-03-09",
      evaluationDate: "2024-03-11",
    },
    {
      id: 3,
      student: "Mike Johnson",
      company: "StartupXYZ",
      supervisor: "Dr. Brown",
      companyRating: 4.2,
      companyFeedback: "Good design skills, needs improvement in time management.",
      status: "pending",
      submissionDate: "2024-03-08",
      evaluationDate: "",
    },
    {
      id: 4,
      student: "Sarah Wilson",
      company: "Digital Agency",
      supervisor: "Dr. Davis",
      companyRating: 4.0,
      companyFeedback: "Solid performance with room for growth in leadership skills.",
      status: "in_review",
      submissionDate: "2024-03-07",
      evaluationDate: "",
    },
  ])

  const statusesList = Array.from(new Set(evaluations.map(e => e.status)))
  const supervisorsList = Array.from(new Set(evaluations.map(e => e.supervisor)))

  const filteredEvaluations = evaluations.filter(
    (evaluation) =>
      (statusFilter === "all" || evaluation.status === statusFilter) &&
      (supervisorFilter === "all" || evaluation.supervisor === supervisorFilter) &&
      (
        evaluation.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.supervisor.toLowerCase().includes(searchTerm.toLowerCase())
      )
  )
  const totalPages = Math.ceil(filteredEvaluations.length / pageSize)
  const paginatedEvaluations = filteredEvaluations.slice((page - 1) * pageSize, page * pageSize)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "in_review":
        return <Badge className="bg-blue-100 text-blue-800">In Review</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }
const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-2">({rating})</span>
      </div>
    )
  }

const generatePDF = () => { if (filteredEvaluations.length === 0) {
    alert("No evaluations to export.");
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 30;

  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Internship Evaluation Report", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const today = new Date().toLocaleDateString();
  doc.text(`Generated on: ${today}`, pageWidth - margin, 10, { align: "right" });

  filteredEvaluations.forEach((evaluation, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

   
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(`Student ${index + 1}: ${evaluation.student}`, margin, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");

    doc.text("Company Name:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(evaluation.company, margin + 40, y);
    y += 6;

   

    doc.setFont("helvetica", "bold");
    doc.text("Supervisor Name:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(evaluation.supervisor, margin + 40, y);
    y += 6;

 

    
    doc.setFont("helvetica", "bold");
    doc.text("Company Rating:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${evaluation.companyRating} / 5`, margin + 40, y);
    y += 6;

  
    doc.setFont("helvetica", "bold");
    doc.text("Company Feedback:", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    const feedbackLines = doc.splitTextToSize(evaluation.companyFeedback, pageWidth - 2 * margin);
    doc.text(feedbackLines, margin + 10, y);
    y += feedbackLines.length * 6;

    
    doc.setFont("helvetica", "bold");
    doc.text("Submission Date:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(evaluation.submissionDate).toLocaleDateString(), margin + 40, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Evaluation Date:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(
      evaluation.evaluationDate ? new Date(evaluation.evaluationDate).toLocaleDateString() : "N/A",
      margin + 40,
      y
    );
    y += 6;

    
    doc.setFont("helvetica", "bold");
    doc.text("Status:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(evaluation.status.replace("_", " "), margin + 40, y);
    y += 10;

    
    doc.setDrawColor(150);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
  });

  // Dynamic file name
  let fileName = "Evaluation_Report";
  if (statusFilter !== "all") fileName += `_${statusFilter}`;
  if (supervisorFilter !== "all") fileName += `_${supervisorFilter.replace(/\s+/g, "")}`;
  if (searchTerm) fileName += `_search-${searchTerm.replace(/\s+/g, "")}`;
  fileName += ".pdf";

  doc.save(fileName);
};


  return (
    <DashboardLayout requiredRole="university">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Evaluations</h1>
            <p className="text-gray-600">Review company evaluations</p>
          </div>
          <Button className="bg-black text-white"  onClick={generatePDF} >
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by student name, company, or supervisor..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="pl-10"
                />
              </div>
              <select className="border rounded px-2 py-1 text-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                <option value="all">All Statuses</option>
                {statusesList.map(s => (
                  <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
              <select className="border rounded px-2 py-1 text-sm" value={supervisorFilter} onChange={e => { setSupervisorFilter(e.target.value); setPage(1); }}>
                <option value="all">All Supervisors</option>
                {supervisorsList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Completed</p><p className="text-2xl font-bold text-green-600">2</p></div><CheckCircle className="h-8 w-8 text-green-600" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Pending</p><p className="text-2xl font-bold text-yellow-600">1</p></div><Clock className="h-8 w-8 text-yellow-600" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">In Review</p><p className="text-2xl font-bold text-blue-600">1</p></div><FileText className="h-8 w-8 text-blue-600" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Avg. Rating</p><p className="text-2xl font-bold text-orange-600">4.4</p></div><Star className="h-8 w-8 text-orange-600" /></div></CardContent></Card>
        </div>

        <div className="space-y-6">
          {paginatedEvaluations.map((evaluation) => (
            <Card key={evaluation.id}>
              <CardHeader><div className="flex items-center justify-between"><div className="flex items-center space-x-3"><div className="p-2 bg-gray-100 rounded-full"><User className="h-6 w-6 text-gray-600" /></div><div><CardTitle className="text-lg">{evaluation.student}</CardTitle><CardDescription>{evaluation.company} • Supervisor: {evaluation.supervisor}</CardDescription></div></div><div className="flex items-center space-x-2">{getStatusBadge(evaluation.status)}</div></div></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Company Evaluation</h4>
                    {renderStars(evaluation.companyRating)}
                  </div>
                  <p className="text-sm text-gray-700">{evaluation.companyFeedback}</p>
                  <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>Submitted: {evaluation.submissionDate}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>Status: {evaluation.status.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedEvaluation(evaluation)}>View Full Report</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-white text-black">
                        <DialogHeader>
                          <DialogTitle>Full Company Report</DialogTitle>
                          <DialogDescription>Detailed view of the company’s evaluation for the student.</DialogDescription>
                        </DialogHeader>
                        {selectedEvaluation && (
                          <div className="space-y-4">
                            <div><h3 className="font-semibold">Student</h3><p>{selectedEvaluation.student}</p></div>
                            <div><h3 className="font-semibold">Company</h3><p>{selectedEvaluation.company}</p></div>
                            <div><h3 className="font-semibold">Supervisor</h3><p>{selectedEvaluation.supervisor}</p></div>
                            <div><h3 className="font-semibold">Company Rating</h3>{renderStars(selectedEvaluation.companyRating)}</div>
                            <div><h3 className="font-semibold">Company Feedback</h3><p className="text-sm text-gray-700">{selectedEvaluation.companyFeedback}</p></div>
                            <div className="flex items-center text-sm text-gray-500 space-x-4">
                              <span>Submitted: {selectedEvaluation.submissionDate}</span>
                              {selectedEvaluation.evaluationDate && (<span>Evaluated: {selectedEvaluation.evaluationDate}</span>)}
                            </div>
                            <div><h3 className="font-semibold">Status</h3><p>{selectedEvaluation.status.replace("_", " ")}</p></div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {paginatedEvaluations.length === 0 && (
            <div className="text-center text-gray-500 py-8">No results found.</div>
          )}
        </div>

        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={e => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }} />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink href="#" isActive={page === i + 1} onClick={e => { e.preventDefault(); setPage(i + 1); }}>{i + 1}</PaginationLink>
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