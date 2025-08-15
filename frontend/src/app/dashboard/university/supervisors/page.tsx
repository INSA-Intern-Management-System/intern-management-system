"use client";

import { useState } from "react";
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
  Users,
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

// Mock data
const supervisors = [
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

export default function SupervisorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newSup, setNewSup] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    specialization: "",
    studentsAssigned: 0,
    maxCapacity: 5,
    experience: "",
    status: "active",
  });
  const [supervisorsState, setSupervisorsState] = useState(supervisors);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const departments = Array.from(
    new Set(supervisorsState.map((s) => s.department))
  );
  const statuses = ["active", "inactive"];
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
  const totalPages = Math.ceil(filteredSupervisors.length / pageSize);
  const paginatedSupervisors = filteredSupervisors.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const handleAddSupervisor = (e: React.FormEvent) => {
    e.preventDefault();
    setSupervisorsState([
      { id: supervisorsState.length + 1, ...newSup },
      ...supervisorsState,
    ]);
    setShowAdd(false);
    setNewSup({
      name: "",
      email: "",
      phone: "",
      department: "",
      specialization: "",
      studentsAssigned: 0,
      maxCapacity: 5,
      experience: "",
      status: "active",
    });
    setPage(1);
  };

  const getCapacityBadge = (assigned: number, max: number) => {
    const percentage = (assigned / max) * 100;
    if (percentage >= 90)
      return <Badge className="bg-red-100 text-red-800">Full</Badge>;
    if (percentage >= 70)
      return <Badge className="bg-yellow-100 text-yellow-800">High</Badge>;
    return <Badge className="bg-green-100 text-green-800">Available</Badge>;
  };

  const getCapacityColor = (assigned: number, max: number) => {
    const percentage = (assigned / max) * 100;
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
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
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button onClick={() => setShowAdd(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Supervisor
              </Button>
            </DialogTrigger>
            <DialogContent>
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
                  value={newSup.maxCapacity}
                  onChange={(e) =>
                    setNewSup({
                      ...newSup,
                      maxCapacity: Number(e.target.value),
                    })
                  }
                  min={1}
                  required
                />
                <select
                  className="border rounded px-2 py-1 w-full"
                  value={newSup.status}
                  onChange={(e) =>
                    setNewSup({ ...newSup, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="flex space-x-2">
                  <Button type="submit">Add</Button>
                  <Button
                    type="button"
                    variant="outline"
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
                className="border rounded px-2 py-1"
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
              <select
                className="border rounded px-2 py-1"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
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
              <CardContent className="space-y-4">
                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{supervisor.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{supervisor.phone}</span>
                  </div>
                </div>

                {/* Specialization */}
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Specialization
                  </p>
                  <p className="text-sm text-gray-600">
                    {supervisor.specialization}
                  </p>
                </div>

                {/* Experience */}
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Experience
                  </p>
                  <p className="text-sm text-gray-600">
                    {supervisor.experience}
                  </p>
                </div>

                {/* Capacity */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">
                      Student Capacity
                    </span>
                    <span className="text-gray-600">
                      {supervisor.studentsAssigned}/{supervisor.maxCapacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getCapacityColor(
                        supervisor.studentsAssigned,
                        supervisor.maxCapacity
                      )}`}
                      style={{
                        width: `${
                          (supervisor.studentsAssigned /
                            supervisor.maxCapacity) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View Students
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Pagination */}
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
      </div>
    </DashboardLayout>
  );
}
