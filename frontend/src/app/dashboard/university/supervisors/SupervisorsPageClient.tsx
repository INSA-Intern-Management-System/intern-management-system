"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { GraduationCap, Search, Plus, MessageSquare } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Supervisor,
  Student,
  SupervisorFormData,
  SupervisorStats,
} from "@/app/services/supervisorService";

interface SupervisorsPageClientProps {
  initialSupervisors: Supervisor[];
  initialStudents: Student[];
  initialStats: SupervisorStats;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  searchParams: { search: string; status: string; field: string };
  fieldsList: string[];
  userId: number;
  onFetchData: (
    page: number,
    size: number,
    search: string,
    status: string,
    field: string
  ) => Promise<{
    supervisors: Supervisor[];
    students: Student[];
    stats: SupervisorStats;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      pageSize: number;
    };
    error?: string;
  }>;
  onAddSupervisor: (
    supervisor: SupervisorFormData
  ) => Promise<{ supervisor?: Supervisor; success: boolean; error?: string }>;
  onEditSupervisor: (
    supervisor: Supervisor
  ) => Promise<{ supervisor?: Supervisor; success: boolean; error?: string }>;
}

export default function SupervisorsPageClient({
  initialSupervisors,
  initialStudents,
  initialStats,
  pagination,
  searchParams,
  onFetchData,
  onAddSupervisor,
  onEditSupervisor,
}: SupervisorsPageClientProps) {
  const router = useRouter();
  const params = useSearchParams();

  const [supervisors, setSupervisors] =
    useState<Supervisor[]>(initialSupervisors);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [stats, setStats] = useState<SupervisorStats>(initialStats);
  const [searchTerm, setSearchTerm] = useState<string>(
    searchParams.search || ""
  );
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.status || ""
  );
  const [fieldFilter, setFieldFilter] = useState<string>(
    searchParams.field || ""
  );
  const [page, setPage] = useState<number>(pagination.currentPage);
  const [totalPages, setTotalPages] = useState<number>(pagination.totalPages);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [newSup, setNewSup] = useState<SupervisorFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: null,
    gender: "Male",
    fieldOfStudy: "",
    institution: "",
    bio: "",
    linkedInUrl: "",
    githubUrl: "",
    profilePicUrl: "",
    notifyEmail: true,
    visibility: true,
    cvUrl: null,
    userStatus: "PENDING",
    roles: {
      id: 5,
      name: "SUPERVISOR",
      displayName: "Supervisor role",
      description: "Supervisor",
    },
  });
  const [editSup, setEditSup] = useState<Supervisor | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Update state when URL params change
  useEffect(() => {
    const search = params.get("search") || "";
    const status = params.get("status") || "";
    const field = params.get("field") || "";
    const pageParam = params.get("page") || "1";

    setSearchTerm(search);
    setStatusFilter(status);
    setFieldFilter(field);
    setPage(parseInt(pageParam));
  }, [params]);

  // Update state when props change
  useEffect(() => {
    setSupervisors(initialSupervisors);
    setStudents(initialStudents);
    setStats(initialStats);
    setTotalPages(pagination.totalPages);
    setPage(pagination.currentPage);
  }, [initialSupervisors, initialStudents, initialStats, pagination]);

  const validateForm = (
    sup: SupervisorFormData | Supervisor
  ): { isValid: boolean; errors: { [key: string]: string } } => {
    const errors: { [key: string]: string } = {};
    if (!sup.firstName) errors.firstName = "First name is required";
    if (!sup.lastName) errors.lastName = "Last name is required";
    if (!sup.email) errors.email = "Email is required";
    if (!sup.phoneNumber) errors.phoneNumber = "Phone number is required";
    if (!sup.fieldOfStudy) errors.fieldOfStudy = "Field of study is required";
    if (!sup.institution) errors.institution = "Institution is required";
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const result = await onFetchData(
        page - 1,
        3,
        searchTerm,
        statusFilter,
        fieldFilter
      );
      if (result.error) {
        alert(result.error);
      } else {
        setSupervisors(result.supervisors);
        setStudents(result.students);
        setStats(result.stats);
        setTotalPages(result.pagination.totalPages);
        setPage(result.pagination.currentPage);

        const newParams = new URLSearchParams();
        if (searchTerm) newParams.set("search", searchTerm);
        if (statusFilter) newParams.set("status", statusFilter);
        if (fieldFilter) newParams.set("field", fieldFilter);
        newParams.set("page", "1");

        router.push(
          `/dashboard/university/supervisors?${newParams.toString()}`
        );
      }
    } catch (error: any) {
      console.error("Failed to fetch supervisors:", error);
      alert(error.message || "Failed to fetch supervisors");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    setIsLoading(true);
    try {
      const result = await onFetchData(
        newPage - 1,
        3,
        searchTerm,
        statusFilter,
        fieldFilter
      );
      if (result.error) {
        alert(result.error);
      } else {
        setSupervisors(result.supervisors);
        setStudents(result.students);
        setStats(result.stats);
        setTotalPages(result.pagination.totalPages);
        setPage(result.pagination.currentPage);

        const newParams = new URLSearchParams();
        if (searchTerm) newParams.set("search", searchTerm);
        if (statusFilter) newParams.set("status", statusFilter);
        if (fieldFilter) newParams.set("field", fieldFilter);
        newParams.set("page", newPage.toString());

        router.push(
          `/dashboard/university/supervisors?${newParams.toString()}`
        );
      }
    } catch (error: any) {
      console.error("Failed to change page:", error);
      alert(error.message || "Failed to change page");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    setIsLoading(true);
    const { isValid, errors } = validateForm(newSup);
    if (!isValid) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await onAddSupervisor(newSup);
      if (result.success && result.supervisor) {
        setSupervisors((prev) => [...prev, result.supervisor!]);
        setNewSup({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          address: null,
          gender: "Male",
          fieldOfStudy: "",
          institution: "",
          bio: "",
          linkedInUrl: "",
          githubUrl: "",
          profilePicUrl: "",
          notifyEmail: true,
          visibility: true,
          cvUrl: null,
          userStatus: "PENDING",
          roles: {
            id: 5,
            name: "SUPERVISOR",
            displayName: "Supervisor role",
            description: "Supervisor",
          },
        });
        setFormErrors({});
        setShowAdd(false);
      } else {
        alert(result.error || "Failed to add supervisor");
      }
    } catch (error: any) {
      console.error("Failed to add supervisor:", error);
      alert(error.message || "Failed to add supervisor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editSup) return;
    setIsLoading(true);
    const { isValid, errors } = validateForm(editSup);
    if (!isValid) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await onEditSupervisor(editSup);
      if (result.success && result.supervisor) {
        setSupervisors((prev) =>
          prev.map((sup) =>
            sup.id === result.supervisor!.id ? result.supervisor! : sup
          )
        );
        setEditSup(null);
      } else {
        alert(result.error || "Failed to edit supervisor");
      }
    } catch (error: any) {
      console.error("Failed to edit supervisor:", error);
      alert(error.message || "Failed to edit supervisor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewStudents = (supervisorId: number) => {
    const assignedStudents = students.filter(
      (student) => student.supervisorId === supervisorId
    );
    setSelectedStudents(assignedStudents);
    setIsViewModalOpen(true);
  };

  const getCapacityBadge = (assigned: number, max: number = 8) => {
    const percentage = (assigned / max) * 100;
    if (percentage >= 90)
      return <Badge className="bg-red-100 text-red-800">Full</Badge>;
    if (percentage >= 70)
      return <Badge className="bg-yellow-100 text-yellow-800">High</Badge>;
    return <Badge className="bg-green-100 text-green-800">Available</Badge>;
  };

  const getCapacityColor = (assigned: number, max: number = 8) => {
    const percentage = (assigned / max) * 100;
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const statuses = ["ACTIVE", "PENDING"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supervisors</h1>
          <p className="text-gray-600">
            Manage academic supervisors and their assignments
          </p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700 flex items-center"
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
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleAdd();
              }}
            >
              <div>
                <Input
                  placeholder="First Name"
                  value={newSup.firstName}
                  onChange={(e) =>
                    setNewSup({ ...newSup, firstName: e.target.value })
                  }
                  required
                />
                {formErrors.firstName && (
                  <p className="text-red-500 text-sm">{formErrors.firstName}</p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Last Name"
                  value={newSup.lastName}
                  onChange={(e) =>
                    setNewSup({ ...newSup, lastName: e.target.value })
                  }
                  required
                />
                {formErrors.lastName && (
                  <p className="text-red-500 text-sm">{formErrors.lastName}</p>
                )}
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={newSup.email}
                  onChange={(e) =>
                    setNewSup({ ...newSup, email: e.target.value })
                  }
                  required
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm">{formErrors.email}</p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Phone Number"
                  value={newSup.phoneNumber}
                  onChange={(e) =>
                    setNewSup({ ...newSup, phoneNumber: e.target.value })
                  }
                  required
                />
                {formErrors.phoneNumber && (
                  <p className="text-red-500 text-sm">
                    {formErrors.phoneNumber}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Field of Study"
                  value={newSup.fieldOfStudy}
                  onChange={(e) =>
                    setNewSup({ ...newSup, fieldOfStudy: e.target.value })
                  }
                  required
                />
                {formErrors.fieldOfStudy && (
                  <p className="text-red-500 text-sm">
                    {formErrors.fieldOfStudy}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Institution"
                  value={newSup.institution}
                  onChange={(e) =>
                    setNewSup({ ...newSup, institution: e.target.value })
                  }
                  required
                />
                {formErrors.institution && (
                  <p className="text-red-500 text-sm">
                    {formErrors.institution}
                  </p>
                )}
              </div>
              <Input
                placeholder="Bio"
                value={newSup.bio}
                onChange={(e) => setNewSup({ ...newSup, bio: e.target.value })}
              />
              <Input
                placeholder="LinkedIn URL"
                value={newSup.linkedInUrl}
                onChange={(e) =>
                  setNewSup({ ...newSup, linkedInUrl: e.target.value })
                }
              />
              <Input
                placeholder="GitHub URL"
                value={newSup.githubUrl}
                onChange={(e) =>
                  setNewSup({ ...newSup, githubUrl: e.target.value })
                }
              />
              <Input
                placeholder="Profile Picture URL"
                value={newSup.profilePicUrl}
                onChange={(e) =>
                  setNewSup({ ...newSup, profilePicUrl: e.target.value })
                }
              />
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAdd(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Supervisors
                </p>
                <p className="text-2xl font-bold">{stats.totalSupervisors}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.activeSupervisors}
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pendingSupervisors}
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or field of study..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {supervisors.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No supervisors found</p>
              </CardContent>
            </Card>
          ) : (
            supervisors.map((supervisor) => (
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
                          {supervisor.firstName} {supervisor.lastName}
                        </CardTitle>
                        <CardDescription>
                          {supervisor.fieldOfStudy}
                        </CardDescription>
                      </div>
                    </div>
                    {getCapacityBadge(supervisor.supervisedInterns.length)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>
                    <span className="font-semibold">Email:</span>{" "}
                    {supervisor.email}
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span>{" "}
                    {supervisor.phoneNumber}
                  </p>
                  <p>
                    <span className="font-semibold">Institution:</span>{" "}
                    {supervisor.institution}
                  </p>
                  <p>
                    <span className="font-semibold">Bio:</span>{" "}
                    {supervisor.bio || "N/A"}
                  </p>
                  <div className="w-full bg-gray-200 rounded h-2 mt-2">
                    <div
                      className={`h-2 rounded ${getCapacityColor(
                        supervisor.supervisedInterns.length
                      )}`}
                      style={{
                        width: `${
                          (supervisor.supervisedInterns.length / 8) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleViewStudents(supervisor.id)}
                    >
                      View Students
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push("/dashboard/university/messages")
                      }
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditSup(supervisor)}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) handlePageChange(page - 1);
                }}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={page === i + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(i + 1);
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
                  if (page < totalPages) handlePageChange(page + 1);
                }}
                className={
                  page >= totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

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
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-2 text-left">Name</th>
                    <th className="border px-4 py-2 text-left">Institution</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="border px-4 py-2">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="border px-4 py-2">
                        {student.institution}
                      </td>
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

      <Dialog open={!!editSup} onOpenChange={() => setEditSup(null)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit Supervisor</DialogTitle>
          </DialogHeader>
          {editSup && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleEdit();
              }}
            >
              <div>
                <Input
                  placeholder="First Name"
                  value={editSup.firstName}
                  onChange={(e) =>
                    setEditSup({ ...editSup, firstName: e.target.value })
                  }
                  required
                />
                {formErrors.firstName && (
                  <p className="text-red-500 text-sm">{formErrors.firstName}</p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Last Name"
                  value={editSup.lastName}
                  onChange={(e) =>
                    setEditSup({ ...editSup, lastName: e.target.value })
                  }
                  required
                />
                {formErrors.lastName && (
                  <p className="text-red-500 text-sm">{formErrors.lastName}</p>
                )}
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={editSup.email}
                  onChange={(e) =>
                    setEditSup({ ...editSup, email: e.target.value })
                  }
                  required
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm">{formErrors.email}</p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Phone Number"
                  value={editSup.phoneNumber}
                  onChange={(e) =>
                    setEditSup({ ...editSup, phoneNumber: e.target.value })
                  }
                  required
                />
                {formErrors.phoneNumber && (
                  <p className="text-red-500 text-sm">
                    {formErrors.phoneNumber}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Field of Study"
                  value={editSup.fieldOfStudy}
                  onChange={(e) =>
                    setEditSup({ ...editSup, fieldOfStudy: e.target.value })
                  }
                  required
                />
                {formErrors.fieldOfStudy && (
                  <p className="text-red-500 text-sm">
                    {formErrors.fieldOfStudy}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Institution"
                  value={editSup.institution}
                  onChange={(e) =>
                    setEditSup({ ...editSup, institution: e.target.value })
                  }
                  required
                />
                {formErrors.institution && (
                  <p className="text-red-500 text-sm">
                    {formErrors.institution}
                  </p>
                )}
              </div>
              <Input
                placeholder="Bio"
                value={editSup.bio || ""}
                onChange={(e) =>
                  setEditSup({ ...editSup, bio: e.target.value })
                }
              />
              <Input
                placeholder="LinkedIn URL"
                value={editSup.linkedInUrl || ""}
                onChange={(e) =>
                  setEditSup({ ...editSup, linkedInUrl: e.target.value })
                }
              />
              <Input
                placeholder="GitHub URL"
                value={editSup.githubUrl || ""}
                onChange={(e) =>
                  setEditSup({ ...editSup, githubUrl: e.target.value })
                }
              />
              <Input
                placeholder="Profile Picture URL"
                value={editSup.profilePicUrl || ""}
                onChange={(e) =>
                  setEditSup({ ...editSup, profilePicUrl: e.target.value })
                }
              />
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditSup(null)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
