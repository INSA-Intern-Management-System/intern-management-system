"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Eye,
  Check,
  X,
  Download,
  Mail,
  Phone,
  ExternalLink,
  Linkedin,
  Github,
  Calendar,
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
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

interface Applicant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  institution: string | null;
  fieldOfStudy: string | null;
  gender: string | null;
  duration: string | null;
  linkedInUrl: string | null;
  githubUrl: string | null;
  cvUrl: string | null;
  createdAt: string;
}

interface Application {
  id: number;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
  applicant: Applicant;
}

interface ApplicationsClientProps {
  allApplications: Application[];
  initialStats: {
    totalItems: number;
    pendingCount: number;
    acceptedCount: number;
    rejectedCount: number;
  };
  initialSearch: string;
  initialStatus?: string;
  initialPosition?: string;
  initialUniversity?: string;
  onUpdateStatus: (
    applicationId: number,
    status: "Accepted" | "Rejected"
  ) => Promise<{ success: boolean; data?: Application; error?: string }>;
  onExportApplications: (
    search?: string,
    status?: string,
    position?: string,
    university?: string
  ) => Promise<{ success: boolean; data?: Application[]; error?: string }>;
}

export default function ApplicationsClient({
  allApplications,
  initialStats,
  initialSearch,
  initialStatus = "all",
  initialPosition = "all",
  initialUniversity = "all",
  onUpdateStatus,
  onExportApplications,
}: ApplicationsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applications, setApplications] =
    useState<Application[]>(allApplications);
  const [filteredApplications, setFilteredApplications] =
    useState<Application[]>(allApplications);
  const [stats, setStats] = useState(initialStats);
  const [institutionFilter, setInstitutionFilter] = useState(initialUniversity);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [fieldFilter, setFieldFilter] = useState(initialPosition);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(0);
  const [confirmingAction, setConfirmingAction] = useState<{
    applicationId: number;
    action: "accept" | "reject";
    name: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageSize = 3;
  const totalPages = Math.ceil(filteredApplications.length / pageSize);
  const paginatedApplications = useMemo(() => {
    const startIndex = currentPage * pageSize;
    return filteredApplications.slice(startIndex, startIndex + pageSize);
  }, [filteredApplications, currentPage, pageSize]);

  // Extract unique institutions and fields from all applications (for filter dropdowns)
  const institutions = useMemo(
    () =>
      Array.from(
        new Set(
          allApplications
            .map((app) => app.applicant.institution)
            .filter((inst): inst is string => Boolean(inst))
        )
      ).sort(),
    [allApplications]
  );

  const fieldsOfStudy = useMemo(
    () =>
      Array.from(
        new Set(
          allApplications
            .map((app) => app.applicant.fieldOfStudy)
            .filter((field): field is string => Boolean(field))
        )
      ).sort(),
    [allApplications]
  );

  // Filter applications based on current filters
  const filterApplications = useCallback(() => {
    let filtered = allApplications;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.applicant.firstName.toLowerCase().includes(searchLower) ||
          app.applicant.lastName.toLowerCase().includes(searchLower) ||
          app.applicant.email.toLowerCase().includes(searchLower) ||
          (app.applicant.institution &&
            app.applicant.institution.toLowerCase().includes(searchLower)) ||
          (app.applicant.fieldOfStudy &&
            app.applicant.fieldOfStudy.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Apply field filter
    if (fieldFilter !== "all") {
      filtered = filtered.filter(
        (app) =>
          app.applicant.fieldOfStudy &&
          app.applicant.fieldOfStudy === fieldFilter
      );
    }

    // Apply institution filter
    if (institutionFilter !== "all") {
      filtered = filtered.filter(
        (app) =>
          app.applicant.institution &&
          app.applicant.institution === institutionFilter
      );
    }

    setFilteredApplications(filtered);
    setCurrentPage(0); // Reset to first page when filters change
  }, [
    allApplications,
    searchTerm,
    statusFilter,
    fieldFilter,
    institutionFilter,
  ]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    if (searchTerm) params.set("search", searchTerm);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (fieldFilter !== "all") params.set("position", fieldFilter);
    if (institutionFilter !== "all")
      params.set("university", institutionFilter);

    // Update URL without scrolling
    router.push(`/dashboard/company/applications?${params.toString()}`, {
      scroll: false,
    });
  }, [
    searchTerm,
    statusFilter,
    fieldFilter,
    institutionFilter,
    currentPage,
    router,
  ]);

  // Filter applications when filters change
  useEffect(() => {
    filterApplications();
  }, [filterApplications]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (value: string) => {
      setter(value);
    };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const exportApplicationsToCSV = async () => {
    setIsLoading(true);
    try {
      const response = await onExportApplications(
        searchTerm || undefined,
        statusFilter !== "all" ? statusFilter : undefined,
        fieldFilter !== "all" ? fieldFilter : undefined,
        institutionFilter !== "all" ? institutionFilter : undefined
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.error || "Failed to fetch applications for export"
        );
      }

      const exportApps = response.data;

      const headers = [
        "ID",
        "First Name",
        "Last Name",
        "Email",
        "Phone Number",
        "Institution",
        "Field of Study",
        "Gender",
        "Duration",
        "Status",
        "Applied At",
        "LinkedIn URL",
        "GitHub URL",
        "CV URL",
      ];

      const csvData = exportApps.map((app) => [
        app.id,
        app.applicant.firstName,
        app.applicant.lastName,
        app.applicant.email,
        app.applicant.phoneNumber || "",
        app.applicant.institution || "",
        app.applicant.fieldOfStudy || "",
        app.applicant.gender || "",
        app.applicant.duration || "",
        app.status,
        formatDate(app.createdAt),
        app.applicant.linkedInUrl || "",
        app.applicant.githubUrl || "",
        app.applicant.cvUrl || "",
      ]);

      const csvContent = [
        headers.join(","),
        ...csvData.map((row) =>
          row
            .map((field) =>
              typeof field === "string" && field.includes(",")
                ? `"${field.replace(/"/g, '""')}"`
                : field
            )
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `applications_export_${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error: any) {
      console.error("Failed to export applications:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to export applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (
    applicationId: number,
    status: "Accepted" | "Rejected"
  ) => {
    setIsSubmitting(true);
    try {
      const response = await onUpdateStatus(applicationId, status);
      console.log("Update response:", response);
      if (response.success && response.data) {
        // Update the local state with the updated application
        const updatedApplications = allApplications.map((app) =>
          app.id === applicationId ? { ...app, status } : app
        );

        setApplications(updatedApplications);
        filterApplications(); // Reapply filters

        // Update stats
        setStats((prev) => {
          let newStats = { ...prev };

          if (status === "Accepted") {
            newStats.acceptedCount += 1;
            newStats.pendingCount -= 1;
          } else if (status === "Rejected") {
            newStats.rejectedCount += 1;
            newStats.pendingCount -= 1;
          }

          return newStats;
        });

        setConfirmingAction(null);
        toast({
          title: "Success",
          description: `Application ${status.toLowerCase()} successfully`,
        });
      } else {
        throw new Error(response.error || "Unknown error");
      }
    } catch (error: any) {
      console.error("Failed to update status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update application status",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Rejected
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending Review
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
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600">
            Review and manage student applications
          </p>
        </div>
        <Button
          variant="outline"
          onClick={exportApplicationsToCSV}
          disabled={isSubmitting}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Applications
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Applications
                </p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Review
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pendingCount}
                </p>
              </div>
              <Search className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.acceptedCount}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.rejectedCount}
                </p>
              </div>
              <X className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, institution, or field of study..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full md:w-auto">
              <Select
                value={statusFilter}
                onValueChange={handleFilterChange(setStatusFilter)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={fieldFilter}
                onValueChange={handleFilterChange(setFieldFilter)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  {fieldsOfStudy.map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={institutionFilter}
                onValueChange={handleFilterChange(setInstitutionFilter)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by institution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Institutions</SelectItem>
                  {institutions.map((institution) => (
                    <SelectItem key={institution} value={institution}>
                      {institution}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {paginatedApplications.length === 0 ? (
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No applications found
              </h3>
              <p className="text-gray-600">
                {searchTerm ||
                statusFilter !== "all" ||
                fieldFilter !== "all" ||
                institutionFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No applications have been submitted yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          paginatedApplications.map((application) => (
            <Card
              key={application.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.applicant.firstName}{" "}
                            {application.applicant.lastName}
                          </h3>
                          {getStatusBadge(application.status)}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Contact Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {application.applicant.email}
                            </span>
                          </div>
                          {application.applicant.phoneNumber && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {application.applicant.phoneNumber}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Academic Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {application.applicant.institution && (
                            <div>
                              <span className="text-xs text-gray-500">
                                Institution
                              </span>
                              <p className="text-sm font-medium">
                                {application.applicant.institution}
                              </p>
                            </div>
                          )}
                          {application.applicant.fieldOfStudy && (
                            <div>
                              <span className="text-xs text-gray-500">
                                Field of Study
                              </span>
                              <p className="text-sm font-medium">
                                {application.applicant.fieldOfStudy}
                              </p>
                            </div>
                          )}
                          {application.applicant.duration && (
                            <div>
                              <span className="text-xs text-gray-500">
                                Duration
                              </span>
                              <p className="text-sm font-medium">
                                {application.applicant.duration}
                              </p>
                            </div>
                          )}
                          {application.applicant.gender && (
                            <div>
                              <span className="text-xs text-gray-500">
                                Gender
                              </span>
                              <p className="text-sm font-medium">
                                {application.applicant.gender}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Links & Documents
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {application.applicant.linkedInUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={application.applicant.linkedInUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Linkedin className="h-3 w-3 mr-1" />
                                LinkedIn
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          )}
                          {application.applicant.githubUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={application.applicant.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Github className="h-3 w-3 mr-1" />
                                GitHub
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          )}
                          {application.applicant.cvUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={application.applicant.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                CV
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Applied: {formatDate(application.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {application.status.toLowerCase() === "pending" && (
                      <>
                        {confirmingAction?.applicationId === application.id &&
                        confirmingAction.action === "accept" ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                            <p className="text-sm font-medium text-green-800">
                              Accept Application?
                            </p>
                            <p className="text-xs text-green-600">
                              Accept {application.applicant.firstName}{" "}
                              {application.applicant.lastName}?
                            </p>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 bg-transparent"
                                onClick={() => setConfirmingAction(null)}
                                disabled={isSubmitting}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-xs h-7"
                                onClick={() =>
                                  handleStatusUpdate(application.id, "Accepted")
                                }
                                disabled={isSubmitting}
                              >
                                Yes, Accept
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-green-600 text-white hover:bg-green-800"
                            onClick={() =>
                              setConfirmingAction({
                                applicationId: application.id,
                                action: "accept",
                                name: `${application.applicant.firstName} ${application.applicant.lastName}`,
                              })
                            }
                            disabled={isSubmitting}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                        )}
                        {confirmingAction?.applicationId === application.id &&
                        confirmingAction.action === "reject" ? (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                            <p className="text-sm font-medium text-red-800">
                              Reject Application?
                            </p>
                            <p className="text-xs text-red-600">
                              Reject {application.applicant.firstName}{" "}
                              {application.applicant.lastName}?
                            </p>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 bg-transparent"
                                onClick={() => setConfirmingAction(null)}
                                disabled={isSubmitting}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-xs h-7"
                                onClick={() =>
                                  handleStatusUpdate(application.id, "Rejected")
                                }
                                disabled={isSubmitting}
                              >
                                Yes, Reject
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                            onClick={() =>
                              setConfirmingAction({
                                applicationId: application.id,
                                action: "reject",
                                name: `${application.applicant.firstName} ${application.applicant.lastName}`,
                              })
                            }
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
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
                  handlePageChange(Math.max(0, currentPage - 1));
                }}
                className={
                  currentPage === 0 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === i}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(i);
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
                  handlePageChange(Math.min(totalPages - 1, currentPage + 1));
                }}
                className={
                  currentPage === totalPages - 1
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Application Review Guidelines */}
      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Application Review Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Evaluation Criteria:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Academic background and field of study alignment</li>
                <li>• Professional experience duration</li>
                <li>• Portfolio quality (GitHub, LinkedIn profiles)</li>
                <li>• Communication skills and motivation</li>
                <li>• Cultural fit with company values</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Review Process:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Review application within 48 hours</li>
                <li>• Conduct initial screening call if interested</li>
                <li>• Schedule technical interview for qualified candidates</li>
                <li>• Provide feedback to all applicants</li>
                <li>• Coordinate with university for final approval</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
