"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { FileText, Plus, Upload, Search, Download } from "lucide-react";
import {
  Application,
  ApplicationsResponse,
  CreateApplicationRequest,
} from "@/app/services/applicationService";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";

interface ApplicationsClientProps {
  initialApplications: Application[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  onCreateApplication: (
    applicationData: CreateApplicationRequest
  ) => Promise<{ success: boolean; data?: Application; error?: string }>;
  onBatchImport: (
    file: File
  ) => Promise<{ success: boolean; data?: any[]; error?: string }>;
  initialSearch: string;
  initialStatus?: string;
}

// Helper function to safely parse and format dates
const formatDateSafe = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";

  try {
    return format(parseISO(dateString), "MMM d, yyyy");
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Invalid date";
  }
};

export default function ApplicationsClient({
  initialApplications,
  pagination,
  onCreateApplication,
  onBatchImport,
  initialSearch,
  initialStatus,
}: ApplicationsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applications, setApplications] =
    useState<Application[]>(initialApplications);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>(
    initialStatus || "all"
  );
  const [currentPage, setCurrentPage] = useState(pagination.currentPage);
  const [isLoading, setIsLoading] = useState(false);

  const [newApplication, setNewApplication] =
    useState<CreateApplicationRequest>({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      institution: "",
      fieldOfStudy: "",
      gender: "",
      duration: "",
      linkedInUrl: "",
      githubUrl: "",
    });

  const [cvFile, setCvFile] = useState<File | null>(null);

  // Update applications when initialApplications change
  useEffect(() => {
    setApplications(initialApplications);
    setCurrentPage(pagination.currentPage);
  }, [initialApplications, pagination.currentPage]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewApplication({ ...newApplication, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewApplication({ ...newApplication, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const applicationData: CreateApplicationRequest = {
        ...newApplication,
        cvFile: cvFile || undefined,
      };

      const response = await onCreateApplication(applicationData);

      if (!response.success) {
        throw new Error(response.error);
      }

      setApplications([response.data!, ...applications]);
      setShowNewDialog(false);
      setNewApplication({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        institution: "",
        fieldOfStudy: "",
        gender: "",
        duration: "",
        linkedInUrl: "",
        githubUrl: "",
      });
      setCvFile(null);
      toast({
        title: "Success",
        description: "Application submitted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = document.getElementById("batch-file") as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to import",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await onBatchImport(file);

      if (!response.success) {
        throw new Error(response.error);
      }

      setShowBatchDialog(false);
      toast({
        title: "Success",
        description: `Successfully imported ${
          response.data?.length || 0
        } applications`,
      });

      // Refresh the applications list
      const params = new URLSearchParams(searchParams.toString());
      router.push(`/dashboard/university/applications?${params.toString()}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to import applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUrlParams = () => {
    const params = new URLSearchParams();

    // Always reset to first page when filters change
    params.set("page", "0");

    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);

    router.push(`/dashboard/university/applications?${params.toString()}`);
  };

  // Debounce the search to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== initialSearch) {
        updateUrlParams();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Immediate filter change for status
  useEffect(() => {
    if (statusFilter !== (initialStatus || "all")) {
      updateUrlParams();
    }
  }, [statusFilter]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/dashboard/university/applications?${params.toString()}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-medium">
            Accepted
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-medium">
            Rejected
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-medium">
            Pending
          </span>
        );
    }
  };

  // Professional pagination rendering
  const renderPaginationItems = () => {
    const items = [];
    const totalPages = pagination.totalPages;
    const current = currentPage + 1; // Convert to 1-based for display

    if (totalPages <= 1) return null;

    // Always show first page
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          href="#"
          isActive={current === 1}
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(0);
          }}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if needed
    if (current > 3) {
      items.push(<PaginationEllipsis key="ellipsis-start" />);
    }

    // Calculate visible page range
    let start = Math.max(2, current - 1);
    let end = Math.min(totalPages - 1, current + 1);

    // Add visible pages
    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={current === i}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i - 1);
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    // Show ellipsis if needed
    if (current < totalPages - 2) {
      items.push(<PaginationEllipsis key="ellipsis-end" />);
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            isActive={current === totalPages}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages - 1);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600">
            Submit and manage internship applications for your students
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white hover:bg-gray-900">
                <Plus className="h-4 w-4 mr-2" />
                New Application
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Application</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreateApplication}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={newApplication.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={newApplication.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newApplication.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={newApplication.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution</Label>
                    <Input
                      id="institution"
                      name="institution"
                      value={newApplication.institution}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fieldOfStudy">Field of Study</Label>
                    <Input
                      id="fieldOfStudy"
                      name="fieldOfStudy"
                      value={newApplication.fieldOfStudy}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={newApplication.gender}
                      onValueChange={(value) =>
                        handleSelectChange("gender", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      name="duration"
                      value={newApplication.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 3 months"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedInUrl"
                      name="linkedInUrl"
                      type="url"
                      value={newApplication.linkedInUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="githubUrl">GitHub URL</Label>
                    <Input
                      id="githubUrl"
                      name="githubUrl"
                      type="url"
                      value={newApplication.githubUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvFile">CV/Resume (PDF)</Label>
                  <Input
                    id="cvFile"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    className="bg-black text-white hover:bg-gray-900"
                    disabled={isLoading}
                  >
                    {isLoading ? "Submitting..." : "Submit Application"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewDialog(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Batch Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Batch Application Import</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleBatchImport}>
                <div className="space-y-2">
                  <Label htmlFor="batch-file">Excel/CSV File</Label>
                  <Input
                    id="batch-file"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Importing..." : "Import"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBatchDialog(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="bg-white border border-gray-200 rounded-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search applications..."
                  className="pl-10 rounded-md bg-white border border-gray-200 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="min-w-[140px] border border-gray-200 bg-white text-gray-700 rounded-md">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card className="bg-white border border-gray-200 rounded-lg">
        <CardHeader>
          <CardTitle>All Applications ({pagination.totalItems})</CardTitle>
          <CardDescription>
            List of all internship applications submitted by your university
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No applications found matching your criteria</p>
              </div>
            ) : (
              applications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {application.applicant.firstName}{" "}
                        {application.applicant.lastName}
                      </h3>
                      {getStatusBadge(application.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {application.applicant.email}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      {application.applicant.institution && (
                        <span>{application.applicant.institution}</span>
                      )}
                      {application.applicant.fieldOfStudy && (
                        <span>• {application.applicant.fieldOfStudy}</span>
                      )}
                      <span>
                        • Applied: {formatDateSafe(application.createdAt)}
                      </span>
                    </div>
                    {application.applicant.phoneNumber && (
                      <p className="text-sm text-gray-600 mt-2">
                        Phone: {application.applicant.phoneNumber}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {application.applicant.cvUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={application.applicant.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          CV
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination - Only show if there are multiple pages */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 0) {
                      handlePageChange(currentPage - 1);
                    }
                  }}
                  isActive={currentPage > 0}
                />
              </PaginationItem>

              {renderPaginationItems()}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < pagination.totalPages - 1) {
                      handlePageChange(currentPage + 1);
                    }
                  }}
                  isActive={currentPage < pagination.totalPages - 1}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
