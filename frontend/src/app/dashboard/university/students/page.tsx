"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { User, Search, Plus, MessageSquare, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

// Mock data
const students = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@student.insa.fr",
    company: "Tech Corp",
    position: "Software Developer",
    supervisor: "Dr. Smith",
    startDate: "2024-01-15",
    status: "active",
    progress: 75,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@student.insa.fr",
    company: "Innovation Labs",
    position: "Data Analyst",
    supervisor: "Dr. Johnson",
    startDate: "2024-01-10",
    status: "active",
    progress: 60,
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@student.insa.fr",
    company: "StartupXYZ",
    position: "UI/UX Designer",
    supervisor: "Dr. Brown",
    startDate: "2024-01-08",
    status: "completed",
    progress: 100,
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.wilson@student.insa.fr",
    company: "Digital Agency",
    position: "Marketing Intern",
    supervisor: "Dr. Davis",
    startDate: "2024-02-01",
    status: "active",
    progress: 45,
  },
];

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssign, setShowAssign] = useState(false);
  const [selectedStudentInput, setSelectedStudentInput] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null);
  const [supervisorInput, setSupervisorInput] = useState<string>("");
  const [studentsState, setStudentsState] = useState<typeof students>(students);
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [supervisorFilter, setSupervisorFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 3;
  // Supervisor list from supervisors page
  const supervisors = [
    "Dr. Smith",
    "Dr. Johnson",
    "Dr. Brown",
    "Dr. Davis",
  ];
  // Unique values for filters
  const supervisorsList = Array.from(new Set(studentsState.map(s => s.supervisor)));
  // Assign supervisor handler
  const handleAssignSupervisor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !supervisorInput) return;
    setStudentsState(studentsState.map(s => s.id === selectedStudent.id ? { ...s, supervisor: supervisorInput } : s));
    setShowAssign(false);
    setSupervisorInput("");
    setSelectedStudent(null);
    setSelectedStudentInput("");
  };

  const filteredStudents = studentsState.filter(
    (student) =>
      (statusFilter === "all" || student.status === statusFilter) &&
      (companyFilter === "all" || student.company === companyFilter) &&
      (supervisorFilter === "all" || student.supervisor === supervisorFilter) &&
      (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const paginatedStudents = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 60) return "bg-blue-500"
    if (progress >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <DashboardLayout requiredRole="university">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-600">Manage and track student internships</p>
          </div>
          <Dialog open={showAssign} onOpenChange={setShowAssign}>
            <DialogTrigger asChild>
              <Button onClick={() => { setShowAssign(true); setSelectedStudent(null); }}>
                <Plus className="h-4 w-4 mr-2" />
                Assign Supervisor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Supervisor</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleAssignSupervisor}>
                <div className="relative">
                  <Input
                    placeholder="Type student name..."
                    value={selectedStudentInput}
                    onChange={e => {
                      setSelectedStudentInput(e.target.value);
                      const found = studentsState.find(s => s.name.toLowerCase() === e.target.value.toLowerCase());
                      setSelectedStudent(found || null);
                    }}
                    autoFocus
                  />
                  {selectedStudentInput && (
                    <div className="absolute left-0 right-0 bg-white border rounded shadow z-10 mt-1 max-h-32 overflow-y-auto">
                      {studentsState.filter(s => s.name.toLowerCase().includes(selectedStudentInput.toLowerCase())).map(s => (
                        <div key={s.id} className="px-3 py-2 hover:bg-blue-100 cursor-pointer" onClick={() => { setSelectedStudentInput(s.name); setSelectedStudent(s); }}>
                          {s.name} ({s.company})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Input
                    placeholder="Type supervisor name..."
                    value={supervisorInput}
                    onChange={e => setSupervisorInput(e.target.value)}
                    autoFocus
                  />
                  {supervisorInput && (
                    <div className="absolute left-0 right-0 bg-white border rounded shadow z-10 mt-1 max-h-32 overflow-y-auto">
                      {(supervisors as string[]).filter(sup => sup.toLowerCase().includes(supervisorInput.toLowerCase())).map(sup => (
                        <div key={sup} className="px-3 py-2 hover:bg-blue-100 cursor-pointer" onClick={() => setSupervisorInput(sup)}>{sup}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">Assign</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAssign(false)}>Cancel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students by name, company, or position..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="pl-10"
                />
              </div>
              <select className="border rounded px-2 py-1" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
              <select className="border rounded px-2 py-1" value={supervisorFilter} onChange={e => { setSupervisorFilter(e.target.value); setPage(1); }}>
                <option value="all">All Supervisors</option>
                {supervisorsList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Student List ({filteredStudents.length})</CardTitle>
            <CardDescription>Overview of all students in internship programs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(paginatedStudents as typeof students).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{student.name}</h3>
                        {getStatusBadge(student.status)}
                      </div>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>
                          {student.company} • {student.position}
                        </span>
                        <span>Supervisor: {student.supervisor}</span>
                        <span>Started: {student.startDate}</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{student.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(student.progress)}`}
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
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
