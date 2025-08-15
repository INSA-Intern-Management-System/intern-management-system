"use client";

import { useState, useMemo } from "react";
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
import { DashboardLayout } from "@/app/layout/dashboard-layout";
import {
  User,
  Search,
  MessageSquare,
  Calendar,
  Star,
  TrendingUp,
  Download,
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

// Updated data structure to match the database schema
const users = [
  {
    id: 1,
    first_name: "Sophie",
    last_name: "Laurent",
    email: "sophie.laurent@email.com",
    gender: "female",
    phone_number: "+33 1 23 45 67 89",
    institution: "INSA Rennes",
    field_of_study: "Computer Science",
    bio: "Passionate about UI/UX design and user experience research. Currently working on mobile app redesign project.",
    notify_email: true,
    visibility: "public",
    address: "Rennes, France",
    duration: "6 months",
    linkedin_url: "https://linkedin.com/in/sophie-laurent",
    github_url: "https://github.com/sophie-laurent",
    cv_url: "/cv/sophie-laurent.pdf",
    profile_pic_url: "/profiles/sophie.jpg",
    role: "intern",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
    // Additional intern-specific fields
    position: "UI/UX Designer",
    mentor: "Sarah Wilson",
    startDate: "2024-01-15",
    endDate: "2024-06-15",
    progress: 75,
    project: "Mobile App Redesign",
    rating: 4.8,
    status: "active",
    skills: ["Figma", "Adobe XD", "HTML/CSS"],
    reportsSubmitted: 8,
    totalReports: 10,
  },
  {
    id: 2,
    first_name: "Pierre",
    last_name: "Martin",
    email: "pierre.martin@email.com",
    gender: "male",
    phone_number: "+33 5 61 23 45 67",
    institution: "INSA Toulouse",
    field_of_study: "Data Science",
    bio: "Data enthusiast with strong analytical skills. Experienced in Python, SQL, and data visualization tools.",
    notify_email: true,
    visibility: "public",
    address: "Toulouse, France",
    duration: "5 months",
    linkedin_url: "https://linkedin.com/in/pierre-martin",
    github_url: "https://github.com/pierre-martin",
    cv_url: "/cv/pierre-martin.pdf",
    profile_pic_url: "/profiles/pierre.jpg",
    role: "intern",
    created_at: "2024-01-08T00:00:00Z",
    updated_at: "2024-01-08T00:00:00Z",
    position: "Data Analyst",
    mentor: "Tom Davis",
    startDate: "2024-01-08",
    endDate: "2024-06-08",
    progress: 60,
    project: "Customer Analytics Dashboard",
    rating: 4.6,
    status: "active",
    skills: ["Python", "SQL", "Tableau"],
    reportsSubmitted: 6,
    totalReports: 10,
  },
  {
    id: 3,
    first_name: "Marie",
    last_name: "Dubois",
    email: "marie.dubois@email.com",
    gender: "female",
    phone_number: "+33 4 72 11 22 33",
    institution: "INSA Lyon",
    field_of_study: "Software Engineering",
    bio: "Full-stack developer with expertise in modern web technologies. Passionate about creating scalable applications.",
    notify_email: true,
    visibility: "public",
    address: "Lyon, France",
    duration: "5 months",
    linkedin_url: "https://linkedin.com/in/marie-dubois",
    github_url: "https://github.com/marie-dubois",
    cv_url: "/cv/marie-dubois.pdf",
    profile_pic_url: "/profiles/marie.jpg",
    role: "intern",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
    position: "Software Developer",
    mentor: "Alex Johnson",
    startDate: "2024-02-01",
    endDate: "2024-07-01",
    progress: 45,
    project: "E-commerce Platform",
    rating: 4.9,
    status: "active",
    skills: ["React", "Node.js", "MongoDB"],
    reportsSubmitted: 4,
    totalReports: 8,
  },
  {
    id: 4,
    first_name: "Lucas",
    last_name: "Bernard",
    email: "lucas.bernard@email.com",
    gender: "male",
    phone_number: "+33 4 72 44 55 66",
    institution: "INSA Lyon",
    field_of_study: "Software Engineering",
    bio: "Backend developer with strong experience in Java and Spring framework. Completed successful internship.",
    notify_email: false,
    visibility: "public",
    address: "Lyon, France",
    duration: "5 months",
    linkedin_url: "https://linkedin.com/in/lucas-bernard",
    github_url: "https://github.com/lucas-bernard",
    cv_url: "/cv/lucas-bernard.pdf",
    profile_pic_url: "/profiles/lucas.jpg",
    role: "intern",
    created_at: "2023-09-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
    position: "Software Developer",
    mentor: "Sarah Wilson",
    startDate: "2023-09-01",
    endDate: "2024-02-01",
    progress: 100,
    project: "Internal Tools Development",
    rating: 4.7,
    status: "active",
    skills: ["Java", "Spring", "MySQL"],
    reportsSubmitted: 20,
    totalReports: 20,
  },
  {
    id: 5,
    first_name: "Emma",
    last_name: "Rousseau",
    email: "emma.rousseau@email.com",
    gender: "female",
    phone_number: "+33 2 40 11 22 33",
    institution: "INSA Rennes",
    field_of_study: "Marketing",
    bio: "Digital marketing specialist with focus on social media and content strategy.",
    notify_email: true,
    visibility: "public",
    address: "Rennes, France",
    duration: "4 months",
    linkedin_url: "https://linkedin.com/in/emma-rousseau",
    github_url: null,
    cv_url: "/cv/emma-rousseau.pdf",
    profile_pic_url: "/profiles/emma.jpg",
    role: "intern",
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2024-03-01T00:00:00Z",
    position: "Marketing Intern",
    mentor: "Lisa Chen",
    startDate: "2024-03-01",
    endDate: "2024-07-01",
    progress: 30,
    project: "Social Media Campaign",
    rating: 4.5,
    status: "completed",
    skills: ["Social Media", "Content Creation", "Analytics"],
    reportsSubmitted: 2,
    totalReports: 8,
  },
  {
    id: 6,
    first_name: "Thomas",
    last_name: "Leroy",
    email: "thomas.leroy@email.com",
    gender: "male",
    phone_number: "+33 5 61 77 88 99",
    institution: "INSA Toulouse",
    field_of_study: "Mechanical Engineering",
    bio: "Mechanical engineer with interest in automation and robotics.",
    notify_email: true,
    visibility: "private",
    address: "Toulouse, France",
    duration: "6 months",
    linkedin_url: "https://linkedin.com/in/thomas-leroy",
    github_url: "https://github.com/thomas-leroy",
    cv_url: "/cv/thomas-leroy.pdf",
    profile_pic_url: "/profiles/thomas.jpg",
    role: "intern",
    created_at: "2024-01-20T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
    position: "Engineering Intern",
    mentor: "David Kim",
    startDate: "2024-01-20",
    endDate: "2024-07-20",
    progress: 55,
    project: "Automation System",
    rating: 4.4,
    status: "on-leave",
    skills: ["CAD", "Python", "Automation"],
    reportsSubmitted: 5,
    totalReports: 12,
  },
];

export default function CompanyInternsPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [institutionFilter, setInstitutionFilter] = useState("all");
  const [fieldOfStudyFilter, setFieldOfStudyFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const router = useRouter();

  // Get unique values for filters
  const institutions = Array.from(
    new Set(users.map((user) => user.institution))
  );
  const fieldsOfStudy = Array.from(
    new Set(users.map((user) => user.field_of_study))
  );

  // Filter and search logic - works on ALL data, not just current page
  const filteredAndSearchedUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      // Status filter
      const statusMatch =
        statusFilter === "all" || user.status === statusFilter;

      // Institution filter
      const institutionMatch =
        institutionFilter === "all" || user.institution === institutionFilter;

      // Field of study filter
      const fieldMatch =
        fieldOfStudyFilter === "all" ||
        user.field_of_study === fieldOfStudyFilter;

      // Search query - searches across multiple fields
      const searchMatch =
        searchQuery === "" ||
        `${user.first_name} ${user.last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.field_of_study.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.mentor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.skills.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return statusMatch && institutionMatch && fieldMatch && searchMatch;
    });

    return filtered;
  }, [statusFilter, institutionFilter, fieldOfStudyFilter, searchQuery]);

  // Reset page when filters or search change
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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSearchedUsers.length / pageSize);
  const paginatedUsers = filteredAndSearchedUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500 text-white hover:bg-green-600">
            Active
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-500 text-white hover:bg-blue-600">
            Completed
          </Badge>
        );
      case "on-leave":
        return (
          <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
            On Leave
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const activeInterns = users.filter((user) => user.status === "active");

  const handleExport = () => {
    // Create CSV content
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Position",
      "Institution",
      "Field of Study",
      "Status",
      "Progress",
      "Project",
      "Mentor",
      "Rating",
      "Skills",
      "Phone",
      "Address",
      "Duration",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredAndSearchedUsers.map((user) =>
        [
          user.id,
          `"${user.first_name}"`,
          `"${user.last_name}"`,
          `"${user.email}"`,
          `"${user.position}"`,
          `"${user.institution}"`,
          `"${user.field_of_study}"`,
          `"${user.status}"`,
          user.progress,
          `"${user.project}"`,
          `"${user.mentor}"`,
          user.rating,
          `"${user.skills.join("; ")}"`,
          `"${user.phone_number}"`,
          `"${user.address}"`,
          `"${user.duration}"`,
        ].join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
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
    // Navigate to general messages page
    router.push("/dashboard/company/messages");
  };

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interns</h1>
            <p className="text-gray-600">Manage and track your intern team</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Interns
                  </p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Interns
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {activeInterns.length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg. Rating
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(
                      users.reduce((sum, user) => sum + user.rating, 0) /
                      users.length
                    ).toFixed(1)}
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
                  <p className="text-sm font-medium text-gray-600">
                    Avg. Progress
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(
                      activeInterns.reduce(
                        (sum, intern) => sum + intern.progress,
                        0
                      ) / activeInterns.length
                    )}
                    %
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, email, position, project, institution, skills..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </div>
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setFilterOpen((o) => !o)}
                >
                  Filter
                </Button>
                {filterOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg z-10 p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Status
                      </label>
                      <select
                        className="w-full border rounded px-2 py-1"
                        value={statusFilter}
                        onChange={(e) =>
                          handleFilterChange("status", e.target.value)
                        }
                      >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="on-leave">On Leave</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Institution
                      </label>
                      <select
                        className="w-full border rounded px-2 py-1"
                        value={institutionFilter}
                        onChange={(e) =>
                          handleFilterChange("institution", e.target.value)
                        }
                      >
                        <option value="all">All</option>
                        {institutions.map((institution) => (
                          <option key={institution} value={institution}>
                            {institution}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Field of Study
                      </label>
                      <select
                        className="w-full border rounded px-2 py-1"
                        value={fieldOfStudyFilter}
                        onChange={(e) =>
                          handleFilterChange("fieldOfStudy", e.target.value)
                        }
                      >
                        <option value="all">All</option>
                        {fieldsOfStudy.map((field) => (
                          <option key={field} value={field}>
                            {field}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => {
                          setStatusFilter("all");
                          setInstitutionFilter("all");
                          setFieldOfStudyFilter("all");
                          setSearchQuery("");
                          setPage(1);
                        }}
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            {/* Search Results Info */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {paginatedUsers.length} of{" "}
              {filteredAndSearchedUsers.length} interns
              {searchQuery && <span> matching "{searchQuery}"</span>}
            </div>
          </CardContent>
        </Card>

        {/* Interns List */}
        <div className="space-y-4">
          {paginatedUsers.length === 0 ? (
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
            paginatedUsers.map((user) => (
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
                            {user.first_name} {user.last_name}
                          </h3>
                          {getStatusBadge(user.status)}
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                              {user.rating}
                            </span>
                          </div>
                        </div>
                        {/* Info Row - aligned with 4 columns */}
                        <div className="flex text-sm text-gray-700 gap-6">
                          <div className="w-1/4">
                            <div className="font-semibold mb-1">Position:</div>
                            <div>UI/UX Designer</div>
                          </div>
                          <div className="w-1/4">
                            <div className="font-semibold mb-1">
                              Institution:
                            </div>
                            <div>INSA Rennes</div>
                          </div>
                          <div className="w-1/4">
                            <div className="font-semibold mb-1">Project:</div>
                            <div>Mobile App Redesign</div>
                          </div>
                          <div className="w-1/4">
                            <div className="font-semibold mb-1">Progress:</div>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 rounded">
                                <div
                                  className="h-2 bg-blue-500 rounded"
                                  style={{ width: "75%" }}
                                ></div>
                              </div>
                              <span>75%</span>
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
                    if (page > 1) setPage(page - 1);
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

        {/* Intern Management Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Intern Management Best Practices</CardTitle>
            <CardDescription>
              Tips for successful intern supervision
            </CardDescription>
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
    </DashboardLayout>
  );
}
