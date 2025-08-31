"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Search,
  MessageSquare,
  Star,
  TrendingUp,
  Download,
  Loader2,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

interface Intern {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  gender: string;
  fieldOfStudy: string;
  institution: string;
  bio: string | null;
  duration: string | null;
  linkedInUrl: string | null;
  githubUrl: string | null;
  cvUrl: string | null;
  profilePicUrl: string | null;
  userStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface InternResponse {
  intern: Intern;
  project: {
    id: number;
    name: string;
    description: string;
    progress: number;
  };
  reportProgress: {
    internId: number;
    totalReports: number;
    averageRating: number;
  };
}

interface CompanyInternsClientProps {
  initialInterns: InternResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}

export default function CompanyInternsClient({
  initialInterns,
  pagination,
}: CompanyInternsClientProps) {
  const router = useRouter();
  const [interns, setInterns] = useState<InternResponse[]>(initialInterns);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState<number>(pagination.currentPage + 1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [institutionFilter, setInstitutionFilter] = useState("all");
  const [fieldOfStudyFilter, setFieldOfStudyFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const pageSize = pagination.pageSize;

  useEffect(() => {
    console.log("Initial interns received:", initialInterns);
    setInterns(initialInterns);
  }, [initialInterns]);

  // Calculate stats based on ALL data (not filtered)
  const stats = useMemo(() => {
    const totalInterns = interns.length;
    const activeInterns = interns.filter(item => item.intern.userStatus === "ACTIVE").length;
    
    // Calculate average rating from API data
    const totalRating = interns.reduce((sum, item) => sum + (item.reportProgress?.averageRating || 0), 0);
    const averageRating = interns.length > 0 ? totalRating / interns.length : 0;
    
    // Calculate average progress from API data
    const totalProgress = interns.reduce((sum, item) => sum + (item.project?.progress || 0), 0);
    const averageProgress = interns.length > 0 ? totalProgress / interns.length : 0;

    return {
      totalInterns,
      activeInterns,
      averageRating,
      averageProgress
    };
  }, [interns]);

  // Extract unique filter options from ALL data
  const institutions = Array.from(
    new Set(interns.map((item) => item.intern.institution))
  );
  const fieldsOfStudy = Array.from(
    new Set(interns.map((item) => item.intern.fieldOfStudy))
  );

  const filteredAndSearchedInterns = useMemo(() => {
    return interns.filter((item) => {
      const user = item.intern;
      const statusMatch =
        statusFilter === "all" || user.userStatus === statusFilter.toUpperCase();
      const institutionMatch =
        institutionFilter === "all" || user.institution === institutionFilter;
      const fieldMatch =
        fieldOfStudyFilter === "all" || user.fieldOfStudy === fieldOfStudyFilter;

      const searchMatch =
        !searchQuery ||
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fieldOfStudy.toLowerCase().includes(searchQuery.toLowerCase());

      return statusMatch && institutionMatch && fieldMatch && searchMatch;
    });
  }, [interns, statusFilter, institutionFilter, fieldOfStudyFilter, searchQuery]);

  const totalItems = filteredAndSearchedInterns.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const paginatedInterns = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredAndSearchedInterns.slice(start, end);
  }, [filteredAndSearchedInterns, page, pageSize]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleFilterChange = (filterType: string, value: string) => {
    setPage(1);
    switch (filterType) {
      case "status":
        setStatusFilter(value);
        break;
      case "institution":
        setInstitutionFilter(value);
        break;
      case "fieldOfStudy":
        setFieldOfStudyFilter(value);
        break;
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleExport = () => {
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Institution",
      "Field of Study",
      "Status",
      "Phone",
      "Address",
      "Duration",
      "Progress",
      "Rating"
    ];

    const csvContent = [
      headers.join(","),
      ...filteredAndSearchedInterns.map((item) => {
        const user = item.intern;
        return [
          user.id,
          `"${user.firstName}"`,
          `"${user.lastName}"`,
          `"${user.email}"`,
          `"${user.institution}"`,
          `"${user.fieldOfStudy}"`,
          `"${user.userStatus}"`,
          `"${user.phoneNumber}"`,
          `"${user.address || ""}"`,
          `"${user.duration || ""}"`,
          item.project?.progress || 0,
          item.reportProgress?.averageRating || 0
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `interns-export-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMessageUser = () => {
    router.push("/dashboard/company/messages");
  };

  const handleViewProfile = (internId: number) => {
    router.push(`/dashboard/company/interns/${internId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-green-500 text-white hover:bg-green-600">
            Active
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-blue-500 text-white hover:bg-blue-600">
            Completed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Interns</h1>
        <p className="text-gray-600">Manage and track your intern team</p>
      </div>

      {/* Stats Cards - Show stats for ALL interns, not filtered ones */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Interns</p>
                <p className="text-2xl font-bold">{stats.totalInterns}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Interns</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeInterns}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.averageRating.toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(stats.averageProgress)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by name, field of study..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setFilterOpen((o) => !o)}
            >
              Filter
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Filter Dropdown */}
          {filterOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg z-10 p-4 space-y-4 text-sm">
              <div>
                <label className="block font-medium mb-1">Status</label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block font-medium mb-1">Institution</label>
                <Select
                  value={institutionFilter}
                  onValueChange={(value) => handleFilterChange("institution", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select institution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {institutions.map((institution) => (
                      <SelectItem key={institution} value={institution}>
                        {institution}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block font-medium mb-1">Field of Study</label>
                <Select
                  value={fieldOfStudyFilter}
                  onValueChange={(value) => handleFilterChange("fieldOfStudy", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {fieldsOfStudy.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setStatusFilter("all");
                    setInstitutionFilter("all");
                    setFieldOfStudyFilter("all");
                    setSearchQuery("");
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Intern List */}
      <div className="space-y-4">
        {paginatedInterns.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No interns found
              </h3>
              <p className="text-gray-600">
                {searchQuery ||
                statusFilter !== "all" ||
                institutionFilter !== "all" ||
                fieldOfStudyFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No interns have been added yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          paginatedInterns.map((item) => {
            const user = item.intern;
            const progress = item.project?.progress || 0;
            const rating = item.reportProgress?.averageRating || 0;

            return (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </h3>
                          {getStatusBadge(user.userStatus)}
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                              {rating.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {/* Dynamic Info Row - Aligned across all cards */}
                        <div className="flex text-sm text-gray-700 gap-6">
                          <div className="w-1/4">
                            <div className="font-semibold mb-1">Position:</div>
                            <div>Intern</div>
                          </div>
                          <div className="w-1/4">
                            <div className="font-semibold mb-1">Institution:</div>
                            <div>{user.institution}</div>
                          </div>
                          <div className="w-1/4">
                            <div className="font-semibold mb-1">Project:</div>
                            <div>{item.project?.name || "Not assigned"}</div>
                          </div>
                          <div className="w-1/4">
                            <div className="font-semibold mb-1">Progress:</div>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 rounded">
                                <div
                                  className="h-2 bg-blue-500 rounded"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                              <span>{Math.round(progress)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProfile(user.id)}
                      >
                        View Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMessageUser}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination - Fixed to show correct page numbers */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
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
                  if (page < totalPages) setPage(page + 1);
                }}
                className={
                  page === totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Intern Management Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Onboarding:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Assign a dedicated mentor for each intern</li>
                <li>• Provide clear project goals and expectations</li>
                <li>• Schedule regular check-ins and feedback sessions</li>
                <li>• Introduce them to team members and company culture</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Ongoing Support:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Monitor progress through weekly reports</li>
                <li>• Provide constructive feedback regularly</li>
                <li>• Offer learning opportunities and skill development</li>
                <li>• Recognize achievements and celebrate milestones</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}