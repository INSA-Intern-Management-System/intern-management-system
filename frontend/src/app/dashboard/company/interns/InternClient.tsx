"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  supervisor?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  projectManager?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  projects?: Array<{
    id: number;
    name: string;
    description: string;
  }>;
}

interface InternResponse {
  intern: Intern;
  projects: Array<{
    id: number;
    name: string;
    description: string;
  }>;
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
  const [interns, setInterns] = useState<InternResponse[]>(initialInterns);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState<number>(pagination.currentPage + 1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [institutionFilter, setInstitutionFilter] = useState("all");
  const [fieldOfStudyFilter, setFieldOfStudyFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const pageSize = 3;

  useEffect(() => {
    setInterns(initialInterns);
  }, [initialInterns]);

  // Calculate stats based on filtered data
  const calculateStats = useMemo(() => {
    const totalInterns = interns.length;
    const activeInterns = interns.filter(item => item.intern.userStatus === "ACTIVE").length;
    
    // Calculate average rating (mock data for now)
    const averageRating = 4.5;
    
    // Calculate average progress based on duration and creation date
    const calculateProgress = (createdAt: string, duration: string | null): number => {
      if (!duration) return 0;
      
      const monthsMatch = duration.match(/(\d+)\s*month/i);
      if (!monthsMatch) return 0;
      
      const totalMonths = parseInt(monthsMatch[1]);
      const startDate = new Date(createdAt);
      const currentDate = new Date();
      
      const elapsedMonths = (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
                           (currentDate.getMonth() - startDate.getMonth());
      
      const progress = Math.min(100, Math.max(0, (elapsedMonths / totalMonths) * 100));
      return Math.round(progress);
    };

    const activeInternsData = interns.filter(item => item.intern.userStatus === "ACTIVE");
    const totalProgress = activeInternsData.reduce((sum, item) => {
      return sum + calculateProgress(item.intern.createdAt, item.intern.duration);
    }, 0);
    
    const averageProgress = activeInternsData.length > 0 
      ? Math.round(totalProgress / activeInternsData.length) 
      : 0;

    return {
      totalInterns,
      activeInterns,
      averageRating,
      averageProgress
    };
  }, [interns]);

  // Extract unique filter options
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

  // Calculate stats for the filtered results
  const filteredStats = useMemo(() => {
    const totalInterns = filteredAndSearchedInterns.length;
    const activeInterns = filteredAndSearchedInterns.filter(item => item.intern.userStatus === "ACTIVE").length;
    
    // Calculate average progress for filtered active interns
    const calculateProgress = (createdAt: string, duration: string | null): number => {
      if (!duration) return 0;
      
      const monthsMatch = duration.match(/(\d+)\s*month/i);
      if (!monthsMatch) return 0;
      
      const totalMonths = parseInt(monthsMatch[1]);
      const startDate = new Date(createdAt);
      const currentDate = new Date();
      
      const elapsedMonths = (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
                           (currentDate.getMonth() - startDate.getMonth());
      
      const progress = Math.min(100, Math.max(0, (elapsedMonths / totalMonths) * 100));
      return Math.round(progress);
    };

    const activeInternsData = filteredAndSearchedInterns.filter(item => item.intern.userStatus === "ACTIVE");
    const totalProgress = activeInternsData.reduce((sum, item) => {
      return sum + calculateProgress(item.intern.createdAt, item.intern.duration);
    }, 0);
    
    const averageProgress = activeInternsData.length > 0 
      ? Math.round(totalProgress / activeInternsData.length) 
      : 0;

    return {
      totalInterns,
      activeInterns,
      averageRating: 4.5, // Mock data
      averageProgress
    };
  }, [filteredAndSearchedInterns]);

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

      {/* Stats Cards - Now showing filtered stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Interns</p>
                <p className="text-2xl font-bold">{filteredStats.totalInterns}</p>
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
                <p className="text-2xl font-bold text-green-600">{filteredStats.activeInterns}</p>
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
                  {filteredStats.averageRating.toFixed(1)}
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
                  {Math.round(filteredStats.averageProgress)}%
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
            
            // Calculate progress for each intern
            const calculateProgress = (createdAt: string, duration: string | null): number => {
              if (!duration) return 75; // Default if no duration
              
              const monthsMatch = duration.match(/(\d+)\s*month/i);
              if (!monthsMatch) return 75;
              
              const totalMonths = parseInt(monthsMatch[1]);
              const startDate = new Date(createdAt);
              const currentDate = new Date();
              
              const elapsedMonths = (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
                                  (currentDate.getMonth() - startDate.getMonth());
              
              const progress = Math.min(100, Math.max(0, (elapsedMonths / totalMonths) * 100));
              return Math.round(progress);
            };

            const progress = calculateProgress(user.createdAt, user.duration);

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
                              4.5
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
                            <div>{item.projects?.[0]?.name || "Not assigned"}</div>
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
                              <span>{progress}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/company/interns/${user.id}`)
                        }
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

      {/* Pagination */}
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
          <CardDescription>Tips for successful intern supervision</CardDescription>
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