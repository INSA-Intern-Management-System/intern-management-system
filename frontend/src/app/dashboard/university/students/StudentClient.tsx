"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { User, Search, Plus, MessageSquare, Eye, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Student, AssignSupervisorRequest } from "@/app/services/studentService";

interface StudentsClientProps {
  initialStudents: Student[];
  initialPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  initialSupervisors: string[];
  onAssignSupervisor: (data: AssignSupervisorRequest) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
  onFetchData: (
    page: number,
    size: number,
    search: string,
    supervisor: string
  ) => Promise<{
    students: Student[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      pageSize: number;
    };
    error?: string;
  }>;
}

export default function StudentsClient({
  initialStudents,
  initialPagination,
  initialSupervisors,
  onAssignSupervisor,
  onFetchData,
}: StudentsClientProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssign, setShowAssign] = useState(false);
  const [selectedStudentInput, setSelectedStudentInput] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [supervisorInput, setSupervisorInput] = useState<string>("");
  const [supervisorFilter, setSupervisorFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showSupervisorDropdown, setShowSupervisorDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supervisorsList, setSupervisorsList] = useState<string[]>(initialSupervisors || []);

  const pageSize = 3;
  const router = useRouter();

  // Get unique supervisors to avoid duplicate keys
  const uniqueSupervisors = useMemo(() => {
    return Array.from(new Set(supervisorsList));
  }, [supervisorsList]);

  console.log("StudentsClient props:", {
    initialStudents: initialStudents?.length,
    initialSupervisors: initialSupervisors?.length,
    uniqueSupervisors: uniqueSupervisors.length
  });

  useEffect(() => {
    console.log("Students state updated:", students.length, "students");
  }, [students]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      console.log("Loading data with filters:", { searchTerm, supervisorFilter });
      
      const data = await onFetchData(
        0,
        10000,
        searchTerm,
        supervisorFilter
      );
      
      console.log("Data loaded:", data.students?.length, "students");
      
      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      } else {
        setStudents(data.students || []);
        
        // Safe access to students data - get unique supervisors
        const allSupervisors = (data.students || [])
          .filter((student) => student.supervisor?.email)
          .map((student) => student.supervisor?.email)
          .filter((email): email is string => email !== undefined && email !== null);
        
        const uniqueSupervisors = Array.from(new Set(allSupervisors));
        setSupervisorsList(uniqueSupervisors);
        setPage(1);
        
        console.log("Unique supervisors list:", uniqueSupervisors);
      }
    } catch (error: any) {
      console.error("Failed to load students:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Initial students changed:", initialStudents?.length);
    setStudents(initialStudents || []);
  }, [initialStudents]);

  const filteredStudents = useMemo(() => {
    const filtered = students.filter((student) => {
      const matchesSupervisor =
        supervisorFilter === "all" ||
        (supervisorFilter && student.supervisor?.email === supervisorFilter);

      const matchesSearch =
        searchTerm === "" ||
        `${student.firstName} ${student.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.institution && student.institution.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.fieldOfStudy && student.fieldOfStudy.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSupervisor && matchesSearch;
    });
    
    console.log("Filtered students:", filtered.length);
    return filtered;
  }, [students, searchTerm, supervisorFilter]);

  const totalItems = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const result = filteredStudents.slice(start, end);
    console.log("Paginated students:", result.length, "on page", page);
    return result;
  }, [filteredStudents, page, pageSize]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleAssignSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !supervisorInput) return;

    setIsSubmitting(true);
    try {
      const result = await onAssignSupervisor({
        studentEmail: selectedStudent.email,
        supervisorEmail: supervisorInput,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Supervisor assigned successfully!",
        });
        
        // Refresh data
        loadAllData();
        
        setShowAssign(false);
        setSupervisorInput("");
        setSelectedStudent(null);
        setSelectedStudentInput("");
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign supervisor",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goMessage = () => {
    router.push("/dashboard/university/messages");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Assign Supervisor */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">
            Manage and track student internships
          </p>
        </div>
        <Dialog open={showAssign} onOpenChange={setShowAssign}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setShowAssign(true);
                setSelectedStudent(null);
                setShowStudentDropdown(false);
              }}
              className="text-white bg-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign Supervisor
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white rounded-md p-6 shadow-lg space-y-4">
            <DialogHeader>
              <DialogTitle>Assign Supervisor</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleAssignSupervisor}>
              {/* Student Input */}
              <div className="relative mb-6">
                <Input
                  placeholder="Type student name..."
                  value={selectedStudentInput}
                  onChange={(e) => {
                    setSelectedStudentInput(e.target.value);
                    setShowStudentDropdown(true);
                    const found = students.find(
                      (s) =>
                        `${s.firstName} ${s.lastName}`
                          .toLowerCase()
                          .includes(e.target.value.toLowerCase())
                    );
                    setSelectedStudent(found || null);
                  }}
                  onFocus={() => {
                    if (selectedStudentInput) setShowStudentDropdown(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowStudentDropdown(false), 150);
                  }}
                  autoFocus
                />
                {showStudentDropdown && selectedStudentInput && (
                  <div className="absolute left-0 right-0 bg-white border rounded shadow z-50 mt-1 max-h-32 overflow-y-auto">
                    {students
                      .filter((s) =>
                        `${s.firstName} ${s.lastName}`
                          .toLowerCase()
                          .includes(selectedStudentInput.toLowerCase())
                      )
                      .map((s) => (
                        <div
                          key={`${s.id}-${s.email}`}
                          className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSelectedStudentInput(`${s.firstName} ${s.lastName}`);
                            setSelectedStudent(s);
                            setShowStudentDropdown(false);
                          }}
                        >
                          {s.firstName} {s.lastName} ({s.email})
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Supervisor Input */}
              <div className="relative z-40 mb-6">
                <Input
                  placeholder="Type supervisor email..."
                  value={supervisorInput}
                  onChange={(e) => setSupervisorInput(e.target.value)}
                  onFocus={() => setShowSupervisorDropdown(true)}
                  onBlur={() => {
                    setTimeout(() => setShowSupervisorDropdown(false), 150);
                  }}
                />
                {supervisorInput && showSupervisorDropdown && (
                  <div className="absolute left-0 right-0 bg-white border rounded shadow z-50 mt-1 max-h-40 overflow-y-auto">
                    {uniqueSupervisors
                      .filter((sup) =>
                        sup.toLowerCase().includes(supervisorInput.toLowerCase())
                      )
                      .map((sup) => (
                        <div
                          key={sup} // Now using unique supervisor emails
                          className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSupervisorInput(sup);
                            setShowSupervisorDropdown(false);
                          }}
                        >
                          {sup}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex space-x-2 justify-end">
                <Button
                  type="submit"
                  disabled={!selectedStudent || !supervisorInput || isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Assign
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAssign(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6 flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search students by name, email, institution, or field of study..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={supervisorFilter}
            onChange={(e) => {
              setSupervisorFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Supervisors</option>
            {uniqueSupervisors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Student List ({filteredStudents.length})</CardTitle>
          <CardDescription>
            Overview of all students in internship programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedStudents.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No students found</h3>
                <p className="text-gray-600">
                  {students.length === 0 
                    ? "No students available. Try refreshing the page." 
                    : "Try adjusting your search or filter criteria."}
                </p>
              </div>
            ) : (
              paginatedStudents.map((student) => (
                <div
                  key={`${student.id}-${student.email}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {student.firstName} {student.lastName}
                        </h3>
                        {getStatusBadge(student.userStatus)}
                      </div>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>
                          {student.institution} • {student.fieldOfStudy}
                        </span>
                        <span>Supervisor: {student.supervisor?.email || "N/A"}</span>
                        {student.createdAt && (
                          <span>Joined: {formatDate(student.createdAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewStudent(student)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={goMessage}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

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
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
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
                className={
                  page === totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Student Details Dialog */}
      {viewStudent && (
        <Dialog open={!!viewStudent} onOpenChange={() => setViewStudent(null)}>
          <DialogContent className="bg-white text-black rounded-lg shadow-lg max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {viewStudent.firstName} {viewStudent.lastName}'s Profile
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col sm:flex-row gap-6 mt-4">
              {/* Profile Picture */}
              <img
                src={viewStudent.profilePicUrl || "/placeholder-user.jpg"}
                alt={`${viewStudent.firstName} ${viewStudent.lastName}`}
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
              />

              {/* Info Section */}
              <div className="space-y-3 text-sm flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Email:</strong> {viewStudent.email}</p>
                    <p><strong>Phone:</strong> {viewStudent.phoneNumber}</p>
                    <p><strong>Institution:</strong> {viewStudent.institution}</p>
                    <p><strong>Field:</strong> {viewStudent.fieldOfStudy}</p>
                  </div>
                  <div>
                    <p><strong>Gender:</strong> {viewStudent.gender}</p>
                    <p><strong>Address:</strong> {viewStudent.address}</p>
                    <p><strong>Status:</strong> {viewStudent.userStatus}</p>
                    <p><strong>Joined:</strong> {formatDate(viewStudent.createdAt)}</p>
                  </div>
                </div>

                {viewStudent.supervisor && (
                  <div className="pt-3 border-t">
                    <h4 className="font-semibold mb-2">Supervisor:</h4>
                    <p>{viewStudent.supervisor.firstName} {viewStudent.supervisor.lastName}</p>
                    <p className="text-sm text-gray-600">{viewStudent.supervisor.email}</p>
                  </div>
                )}

                {/* External Links */}
                <div className="flex gap-4 pt-3 border-t">
                  {viewStudent.linkedInUrl && (
                    <a
                      href={viewStudent.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      LinkedIn
                    </a>
                  )}
                  {viewStudent.githubUrl && (
                    <a
                      href={viewStudent.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm"
                    >
                      GitHub
                    </a>
                  )}
                  {viewStudent.cvUrl && (
                    <a
                      href={viewStudent.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm"
                    >
                      View CV
                    </a>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}