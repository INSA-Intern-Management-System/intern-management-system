"use client";

import React, { useState } from "react";
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
import { DashboardLayout } from "@/app/layout/dashboard-layout";
import {
  GraduationCap,
  Search,
  Plus,
  MessageSquare,
  Mail,
  Phone,
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
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter } from "next/navigation";

// Define your Student type
interface Student {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  institution: string;
  field_of_study: string;
  gender: string;
  address: string;
  role: string;
  company: string;
  position: string;
  supervisor: string;
}

// Define your Supervisor type
interface Supervisor {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  studentsAssigned: number;
  maxCapacity: number;
  experience: string;
  status: "active" | "inactive";
  students?: Student[]; // optional, assigned students
}

// Mock data
const initialSupervisors: Supervisor[] = [
  {
    id: 1,
    name: "Dr. Smith",
    email: "smith@insa.fr",
    phone: "+33 1 23 45 67 89",
    department: "Computer Science",
    specialization: "Software Engineering",
    studentsAssigned: 5,
    maxCapacity: 8,
    experience: "10 years",
    status: "active",
  },
  {
    id: 2,
    name: "Dr. Johnson",
    email: "johnson@insa.fr",
    phone: "+33 1 23 45 67 90",
    department: "Data Science",
    specialization: "Machine Learning",
    studentsAssigned: 3,
    maxCapacity: 6,
    experience: "8 years",
    status: "active",
  },
  {
    id: 3,
    name: "Dr. Brown",
    email: "brown@insa.fr",
    phone: "+33 1 23 45 67 91",
    department: "Design",
    specialization: "UI/UX Design",
    studentsAssigned: 2,
    maxCapacity: 5,
    experience: "6 years",
    status: "active",
  },
  {
    id: 4,
    name: "Dr. Davis",
    email: "davis@insa.fr",
    phone: "+33 1 23 45 67 92",
    department: "Marketing",
    specialization: "Digital Marketing",
    studentsAssigned: 4,
    maxCapacity: 7,
    experience: "12 years",
    status: "active",
  },
];

const students: Student[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@student.insa.fr",
    phone_number: "+251923415262",
    institution: "AASTU",
    field_of_study: "Software Engineering",
    gender: "Male",
    address: "Addis Ababa, Ethiopia",
    role: "student",
    company: "Tech Corp",
    position: "Software Developer",
    supervisor: "Dr. Smith",
  },
  {
    id: 2,
    name: "Dani Davison",
    email: "dani.dav@student.insa.fr",
    phone_number: "+251923208423",
    institution: "ASTU",
    field_of_study: "Software Engineering",
    gender: "Male",
    address: "Addis Ababa, Ethiopia",
    role: "student",
    company: "Tech Corp",
    position: "Software Developer",
    supervisor: "Dr. Smith",
  },
  {
    id: 3,
    name: "Jane Smith",
    email: "jane.smith@student.insa.fr",
    phone_number: "+251911223344",
    institution: "Addis Ababa University",
    field_of_study: "Data Science",
    gender: "Female",
    address: "Bole, Addis Ababa",
    role: "student",
    company: "Innovation Labs",
    position: "Data Analyst",
    supervisor: "Dr. Johnson",
  },
  {
    id: 4,
    name: "Mike Johnson",
    email: "mike.johnson@student.insa.fr",
    phone_number: "+251922334455",
    institution: "AAiT",
    field_of_study: "Human-Computer Interaction",
    gender: "Male",
    address: "Gullele, Addis Ababa",
    role: "student",
    company: "StartupXYZ",
    position: "UI/UX Designer",
    supervisor: "Dr. Brown",
  },
  {
    id: 5,
    name: "Sarah Wilson",
    email: "sarah.wilson@student.insa.fr",
    phone_number: "+251934567890",
    institution: "Mekelle University",
    field_of_study: "Marketing",
    gender: "Female",
    address: "Piassa, Addis Ababa",
    role: "student",
    company: "Digital Agency",
    position: "Marketing Intern",
    supervisor: "Dr. Davis",
  },
];

export default function SupervisorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newSup, setNewSup] = useState<
    Omit<Supervisor, "id" | "studentsAssigned" | "maxCapacity" | "students"> & {
      studentsAssigned: string;
      maxCapacity: string;
    }
  >({
    name: "",
    email: "",
    phone: "",
    department: "",
    specialization: "",
    experience: "",
    status: "active",
    studentsAssigned: "",
    maxCapacity: "",
  });
  const [supervisorsState, setSupervisorsState] =
    useState<Supervisor[]>(initialSupervisors);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const [editSup, setEditSup] = useState<Supervisor | null>(null);
  const [messageSup, setMessageSup] = useState<Supervisor | null>(null);

  // Typed selected students state
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const router = useRouter();

  // Departments and statuses for filters
  const departments = Array.from(
    new Set(supervisorsState.map((s) => s.department))
  ).sort();
  const statuses = ["active", "inactive"];

  // Filter supervisors by department, status and search term
  const filteredSupervisors = supervisorsState.filter(
    (supervisor) =>
      (departmentFilter === "all" ||
        supervisor.department === departmentFilter) &&
      (statusFilter === "all" || supervisor.status === statusFilter) &&
      (supervisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supervisor.department
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        supervisor.specialization
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredSupervisors.length / pageSize);
  const paginatedSupervisors = filteredSupervisors.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Validation for new supervisor form
  function validateSupervisorForm() {
    const errors: { studentsAssigned?: string; maxCapacity?: string } = {};

    const maxCapNum = Number(newSup.maxCapacity);
    const studentsAssignedNum = Number(newSup.studentsAssigned);

    if (!newSup.maxCapacity || isNaN(maxCapNum) || maxCapNum <= 0) {
      errors.maxCapacity = "Max Capacity must be a positive number";
    }

    if (
      newSup.studentsAssigned === "" ||
      isNaN(studentsAssignedNum) ||
      studentsAssignedNum < 0
    ) {
      errors.studentsAssigned = "Students Assigned cannot be negative";
    }

    if (
      !errors.maxCapacity &&
      !errors.studentsAssigned &&
      studentsAssignedNum > maxCapNum
    ) {
      errors.studentsAssigned = "Assigned students cannot exceed Max Capacity";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // Form errors state for validation
  const [formErrors, setFormErrors] = useState<{
    studentsAssigned?: string;
    maxCapacity?: string;
  }>({});

  // Add supervisor submit handler
  const handleAddSupervisor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateSupervisorForm()) {
      return;
    }

    const newId = supervisorsState.length
      ? Math.max(...supervisorsState.map((s) => s.id)) + 1
      : 1;

    setSupervisorsState([
      {
        id: newId,
        name: newSup.name,
        email: newSup.email,
        phone: newSup.phone,
        department: newSup.department,
        specialization: newSup.specialization,
        experience: newSup.experience,
        status: newSup.status,
        studentsAssigned: Number(newSup.studentsAssigned),
        maxCapacity: Number(newSup.maxCapacity),
      },
      ...supervisorsState,
    ]);

    setNewSup({
      name: "",
      email: "",
      phone: "",
      department: "",
      specialization: "",
      experience: "",
      status: "active",
      studentsAssigned: "",
      maxCapacity: "",
    });

    setFormErrors({});
    setShowAdd(false);
    setPage(1);
  };

  // Capacity badge helper
  const getCapacityBadge = (assigned: number, max: number) => {
    const percentage = (assigned / max) * 100;
    if (percentage >= 90)
      return <Badge className="bg-red-100 text-red-800">Full</Badge>;
    if (percentage >= 70)
      return <Badge className="bg-yellow-100 text-yellow-800">High</Badge>;
    return <Badge className="bg-green-100 text-green-800">Available</Badge>;
  };

  // Capacity color helper for progress bar
  const getCapacityColor = (assigned: number, max: number) => {
    const percentage = (assigned / max) * 100;
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Edit supervisor save handler
  const handleEditSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editSup) return;

    const maxCapNum = Number(editSup.maxCapacity);
    const studentsAssignedNum = Number(editSup.studentsAssigned);
    if (
      isNaN(maxCapNum) ||
      maxCapNum <= 0 ||
      isNaN(studentsAssignedNum) ||
      studentsAssignedNum < 0 ||
      studentsAssignedNum > maxCapNum
    ) {
      alert(
        "Please ensure Max Capacity is positive and Students Assigned is not negative or greater than Max Capacity."
      );
      return;
    }

    setSupervisorsState((prev) =>
      prev.map((s) =>
        s.id === editSup.id
          ? {
              ...editSup,
              maxCapacity: maxCapNum,
              studentsAssigned: studentsAssignedNum,
            }
          : s
      )
    );
    setEditSup(null);
  };

  // Navigate to messages page
  function goMessage() {
    router.push("/dashboard/university/messages");
  }

  // Handle View Students button click - set selected students by supervisor name
  const handleViewStudents = (supervisorName: string) => {
    // Filter students assigned to the selected supervisor
    const assignedStudents = students.filter(
      (student) => student.supervisor === supervisorName
    );
    setSelectedStudents(assignedStudents);
    setIsViewModalOpen(true);
  };

  return (
    <DashboardLayout requiredRole="university">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Supervisors</h1>
            <p className="text-gray-600">
              Manage academic supervisors and their assignments
            </p>
          </div>
          {/* Add Supervisor Modal */}
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button
                className="bg-black text-white flex items-center"
                onClick={() => setShowAdd(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Supervisor
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white text-black">
              <DialogHeader>
                <DialogTitle>Add Supervisor</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleAddSupervisor}>
                <Input
                  placeholder="Name"
                  value={newSup.name}
                  onChange={(e) =>
                    setNewSup({ ...newSup, name: e.target.value })
                  }
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={newSup.email}
                  onChange={(e) =>
                    setNewSup({ ...newSup, email: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="Phone"
                  value={newSup.phone}
                  onChange={(e) =>
                    setNewSup({ ...newSup, phone: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="Department"
                  value={newSup.department}
                  onChange={(e) =>
                    setNewSup({ ...newSup, department: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="Specialization"
                  value={newSup.specialization}
                  onChange={(e) =>
                    setNewSup({ ...newSup, specialization: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="Experience"
                  value={newSup.experience}
                  onChange={(e) =>
                    setNewSup({ ...newSup, experience: e.target.value })
                  }
                  required
                />
                <Input
                  type="number"
                  placeholder="Max Capacity"
                  min={1}
                  value={newSup.maxCapacity}
                  onChange={(e) =>
                    setNewSup({ ...newSup, maxCapacity: e.target.value })
                  }
                  required
                />
                {formErrors.maxCapacity && (
                  <p className="text-red-500 text-sm">
                    {formErrors.maxCapacity}
                  </p>
                )}
                <Input
                  type="number"
                  placeholder="Students Assigned"
                  min={0}
                  value={newSup.studentsAssigned}
                  onChange={(e) =>
                    setNewSup({ ...newSup, studentsAssigned: e.target.value })
                  }
                  required
                />
                {formErrors.studentsAssigned && (
                  <p className="text-red-500 text-sm">
                    {formErrors.studentsAssigned}
                  </p>
                )}
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAdd(false)}
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
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search supervisors by name, department, or specialization..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <select
                className="border rounded px-2 py-1 text-sm leading-tight"
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Supervisors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedSupervisors.map((supervisor) => (
            <Card
              key={supervisor.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <GraduationCap className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {supervisor.name}
                      </CardTitle>
                      <CardDescription>{supervisor.department}</CardDescription>
                    </div>
                  </div>
                  {getCapacityBadge(
                    supervisor.studentsAssigned,
                    supervisor.maxCapacity
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <span className="font-semibold">Specialization:</span>{" "}
                  {supervisor.specialization}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {supervisor.email}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {supervisor.phone}
                </p>
                <p>
                  <span className="font-semibold">Experience:</span>{" "}
                  {supervisor.experience}
                </p>
                {/* Capacity Progress Bar */}
                <div className="w-full bg-gray-200 rounded h-2 mt-2">
                  <div
                    className={`h-2 rounded ${getCapacityColor(
                      supervisor.studentsAssigned,
                      supervisor.maxCapacity
                    )}`}
                    style={{
                      width: `${
                        (supervisor.studentsAssigned / supervisor.maxCapacity) *
                        100
                      }%`,
                    }}
                  />
                </div>
                {/* Action Buttons */}
                <div className="flex space-x-2 mt-4">
                  {/* View Students Button */}
                  <Button
                    variant="outline"
                    onClick={() => handleViewStudents(supervisor.name)}
                  >
                    View Students
                  </Button>
                  {/* Message Button */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMessageSup(supervisor);
                      goMessage();
                    }}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  {/* Edit Button */}
                  <Button
                    variant="outline"
                    onClick={() => setEditSup(supervisor)}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View Students Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-3xl bg-white">
            <DialogHeader>
              <DialogTitle>Assigned Students</DialogTitle>
            </DialogHeader>
            <div>
              {selectedStudents.length === 0 ? (
                <p className="p-4 text-center text-gray-600">
                  No students assigned.
                </p>
              ) : (
                <table className="min-w-full border  border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-4 py-2 text-left">Name</th>
                      <th className="border px-4 py-2 text-left">Company</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="border px-4 py-2">{student.name}</td>
                        <td className="border px-4 py-2">{student.company}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Supervisor Modal */}
        <Dialog open={!!editSup} onOpenChange={() => setEditSup(null)}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Edit Supervisor</DialogTitle>
            </DialogHeader>
            {editSup && (
              <form className="space-y-4" onSubmit={handleEditSave}>
                <Input
                  placeholder="Name"
                  value={editSup.name}
                  onChange={(e) =>
                    setEditSup({ ...editSup, name: e.target.value })
                  }
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={editSup.email}
                  onChange={(e) =>
                    setEditSup({ ...editSup, email: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="Phone"
                  value={editSup.phone}
                  onChange={(e) =>
                    setEditSup({ ...editSup, phone: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="Department"
                  value={editSup.department}
                  onChange={(e) =>
                    setEditSup({ ...editSup, department: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="Specialization"
                  value={editSup.specialization}
                  onChange={(e) =>
                    setEditSup({ ...editSup, specialization: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="Experience"
                  value={editSup.experience}
                  onChange={(e) =>
                    setEditSup({ ...editSup, experience: e.target.value })
                  }
                  required
                />
                <Input
                  type="number"
                  placeholder="Max Capacity"
                  min={1}
                  value={editSup.maxCapacity}
                  onChange={(e) =>
                    setEditSup({
                      ...editSup,
                      maxCapacity: Number(e.target.value),
                    })
                  }
                  required
                />
                <Input
                  type="number"
                  placeholder="Students Assigned"
                  min={0}
                  value={editSup.studentsAssigned}
                  onChange={(e) =>
                    setEditSup({
                      ...editSup,
                      studentsAssigned: Number(e.target.value),
                    })
                  }
                  required
                />
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditSup(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
