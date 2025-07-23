"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
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
} from "lucide-react"
import { useState } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Separate interfaces as requested
interface Applicant {
  id: number
  user_id?: number
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  institution?: string
  field_of_study?: string
  gender?: string
  duration?: string
  linkedin_url?: string
  github_url?: string
  cv_url?: string
  application_status: string
  created_at: string
  updated_at: string
}

interface Application {
  applicant: Applicant
  status: string
  applied_at: string
  updated_at: string
}

export default function CompanyApplicationsPage() {
  // Updated sample data to use the new structure
  const [applications, setApplications] = useState<Application[]>([
    {
      applicant: {
        id: 1,
        user_id: 101,
        first_name: "Marie",
        last_name: "Dubois",
        email: "marie.dubois@insa-lyon.fr",
        phone_number: "+33 6 12 34 56 78",
        institution: "INSA Lyon",
        field_of_study: "Computer Science",
        gender: "Female",
        duration: "2 years",
        linkedin_url: "https://linkedin.com/in/marie-dubois",
        github_url: "https://github.com/marie-dubois",
        cv_url: "https://example.com/cv/marie-dubois.pdf",
        application_status: "pending",
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
      },
      status: "pending",
      applied_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    },
    {
      applicant: {
        id: 2,
        user_id: 102,
        first_name: "Pierre",
        last_name: "Martin",
        email: "pierre.martin@insa-toulouse.fr",
        phone_number: "+33 6 98 76 54 32",
        institution: "INSA Toulouse",
        field_of_study: "Data Science",
        gender: "Male",
        duration: "1 year",
        linkedin_url: "https://linkedin.com/in/pierre-martin",
        github_url: "",
        cv_url: "https://example.com/cv/pierre-martin.pdf",
        application_status: "pending",
        created_at: "2024-01-14T14:20:00Z",
        updated_at: "2024-01-14T14:20:00Z",
      },
      status: "pending",
      applied_at: "2024-01-14T14:20:00Z",
      updated_at: "2024-01-14T14:20:00Z",
    },
    {
      applicant: {
        id: 3,
        user_id: 103,
        first_name: "Sophie",
        last_name: "Laurent",
        email: "sophie.laurent@insa-rennes.fr",
        phone_number: "+33 6 11 22 33 44",
        institution: "INSA Rennes",
        field_of_study: "Design & Innovation",
        gender: "Female",
        duration: "3 years",
        linkedin_url: "https://linkedin.com/in/sophie-laurent",
        github_url: "https://github.com/sophie-laurent",
        cv_url: "https://example.com/cv/sophie-laurent.pdf",
        application_status: "accepted",
        created_at: "2024-01-10T09:15:00Z",
        updated_at: "2024-01-12T16:45:00Z",
      },
      status: "accepted",
      applied_at: "2024-01-10T09:15:00Z",
      updated_at: "2024-01-12T16:45:00Z",
    },
    {
      applicant: {
        id: 4,
        user_id: 104,
        first_name: "Lucas",
        last_name: "Bernard",
        email: "lucas.bernard@insa-lyon.fr",
        phone_number: "null",
        institution: "INSA Lyon",
        field_of_study: "Software Engineering",
        gender: "Male",
        duration: "6 months",
        linkedin_url: "null",
        github_url: "https://github.com/lucas-bernard",
        cv_url: "https://example.com/cv/lucas-bernard.pdf",
        application_status: "rejected",
        created_at: "2024-01-08T11:00:00Z",
        updated_at: "2024-01-09T13:30:00Z",
      },
      status: "rejected",
      applied_at: "2024-01-08T11:00:00Z",
      updated_at: "2024-01-09T13:30:00Z",
    },
  ])

  const [institutionFilter, setInstitutionFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [fieldFilter, setFieldFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [confirmingAction, setConfirmingAction] = useState<{
    applicantId: number
    action: "accept" | "reject"
    name: string
  } | null>(null)
  const pageSize = 3

  const institutions = Array.from(
    new Set(applications.map((app) => app.applicant.institution).filter((inst): inst is string => Boolean(inst))),
  )

  const fieldsOfStudy = Array.from(
    new Set(applications.map((app) => app.applicant.field_of_study).filter((field): field is string => Boolean(field))),
  )

  const filteredApplications = applications.filter((app) => {
    const matchesInstitution = institutionFilter === "all" || app.applicant.institution === institutionFilter
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    const matchesField = fieldFilter === "all" || app.applicant.field_of_study === fieldFilter
    const matchesSearch =
      searchTerm === "" ||
      `${app.applicant.first_name} ${app.applicant.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.applicant.institution?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (app.applicant.field_of_study?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    return matchesInstitution && matchesStatus && matchesField && matchesSearch
  })

  const totalPages = Math.ceil(filteredApplications.length / pageSize)
  const paginatedApplications = filteredApplications.slice((page - 1) * pageSize, page * pageSize)

  // Function to handle status updates
  const updateApplicationStatus = (applicantId: number, newStatus: "accepted" | "rejected") => {
    setApplications((prevApplications) =>
      prevApplications.map((app) =>
        app.applicant.id === applicantId
          ? {
              ...app,
              status: newStatus,
              updated_at: new Date().toISOString(),
              applicant: {
                ...app.applicant,
                application_status: newStatus,
                updated_at: new Date().toISOString(),
              },
            }
          : app,
      ),
    )
    setConfirmingAction(null)
  }

  const handleActionClick = (applicantId: number, action: "accept" | "reject", name: string) => {
    setConfirmingAction({ applicantId, action, name })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Accepted</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Review</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const pendingApplications = applications.filter((app) => app.status === "pending")

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6 bg-gray-50 min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-600">Review and manage student applications</p>
          </div>
          <Button variant="outline">
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
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold">{applications.length}</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingApplications.length}</p>
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
                    {applications.filter((app) => app.status === "accepted").length}
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
                    {applications.filter((app) => app.status === "rejected").length}
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
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, email, institution, or field of study..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={fieldFilter} onValueChange={setFieldFilter}>
                <SelectTrigger className="w-48">
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
                onValueChange={(value) => {
                  setInstitutionFilter(value)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-48">
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
          </CardContent>
        </Card>

        {/* Inline Confirmation */}
        {/* Applications List - Updated to use new structure */}
        <div className="space-y-4">
          {paginatedApplications.map((application) => (
            <Card
              key={application.applicant.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>

                    <div className="flex-1">
                      {/* Header with name and status */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.applicant.first_name} {application.applicant.last_name}
                          </h3>
                          {getStatusBadge(application.status)}
                          {!application.applicant.user_id && (
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              Not Registered
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{application.applicant.email}</span>
                          </div>
                          {application.applicant.phone_number && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{application.applicant.phone_number}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Academic Information */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Academic Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {application.applicant.institution && (
                            <div>
                              <span className="text-xs text-gray-500">Institution</span>
                              <p className="text-sm font-medium">{application.applicant.institution}</p>
                            </div>
                          )}
                          {application.applicant.field_of_study && (
                            <div>
                              <span className="text-xs text-gray-500">Field of Study</span>
                              <p className="text-sm font-medium">{application.applicant.field_of_study}</p>
                            </div>
                          )}
                          {application.applicant.duration && (
                            <div>
                              <span className="text-xs text-gray-500">Duration</span>
                              <p className="text-sm font-medium">{application.applicant.duration}</p>
                            </div>
                          )}
                          {application.applicant.gender && (
                            <div>
                              <span className="text-xs text-gray-500">Gender</span>
                              <p className="text-sm font-medium">{application.applicant.gender}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Links and Documents */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Links & Documents</h4>
                        <div className="flex flex-wrap gap-2">
                          {application.applicant.linkedin_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={application.applicant.linkedin_url} target="_blank" rel="noopener noreferrer">
                                <Linkedin className="h-3 w-3 mr-1" />
                                LinkedIn
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          )}
                          {application.applicant.github_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={application.applicant.github_url} target="_blank" rel="noopener noreferrer">
                                <Github className="h-3 w-3 mr-1" />
                                GitHub
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          )}
                          {application.applicant.cv_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={application.applicant.cv_url} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-3 w-3 mr-1" />
                                CV
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Application Timeline */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Applied: {formatDate(application.applied_at)}</span>
                          </div>
                          <span>Updated: {formatDate(application.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                    {application.status === "pending" && (
                      <>
                        {confirmingAction?.applicantId === application.applicant.id &&
                        confirmingAction.action === "accept" ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                            <p className="text-sm font-medium text-green-800">Accept Application?</p>
                            <p className="text-xs text-green-600">
                              Accept {application.applicant.first_name} {application.applicant.last_name}?
                            </p>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 bg-transparent"
                                onClick={() => setConfirmingAction(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-xs h-7"
                                onClick={() => updateApplicationStatus(application.applicant.id, "accepted")}
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
                              handleActionClick(
                                application.applicant.id,
                                "accept",
                                `${application.applicant.first_name} ${application.applicant.last_name}`,
                              )
                            }
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                        )}

                        {confirmingAction?.applicantId === application.applicant.id &&
                        confirmingAction.action === "reject" ? (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                            <p className="text-sm font-medium text-red-800">Reject Application?</p>
                            <p className="text-xs text-red-600">
                              Reject {application.applicant.first_name} {application.applicant.last_name}?
                            </p>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 bg-transparent"
                                onClick={() => setConfirmingAction(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-xs h-7"
                                onClick={() => updateApplicationStatus(application.applicant.id, "rejected")}
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
                              handleActionClick(
                                application.applicant.id,
                                "reject",
                                `${application.applicant.first_name} ${application.applicant.last_name}`,
                              )
                            }
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
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setPage((p) => Math.max(1, p - 1))
                  }}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={page === i + 1}
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(i + 1)
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
                    e.preventDefault()
                    setPage((p) => Math.min(totalPages, p + 1))
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* Application Guidelines */}
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
    </DashboardLayout>
  )
}
