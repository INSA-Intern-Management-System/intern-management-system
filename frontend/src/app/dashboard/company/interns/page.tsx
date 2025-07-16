"use client";

import { useState } from "react";
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
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  User,
  Search,
  // Plus,
  MessageSquare,
  Calendar,
  Star,
  TrendingUp,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function CompanyInternsPage() {
  const interns = [
    {
      id: 1,
      name: "Sophie Laurent",
      position: "UI/UX Designer",
      mentor: "Sarah Wilson",
      startDate: "2024-01-15",
      endDate: "2024-06-15",
      progress: 75,
      university: "INSA Rennes",
      project: "Mobile App Redesign",
      rating: 4.8,
      status: "active",
      skills: ["Figma", "Adobe XD", "HTML/CSS"],
      reportsSubmitted: 8,
      totalReports: 10,
    },
    {
      id: 2,
      name: "Pierre Martin",
      position: "Data Analyst",
      mentor: "Tom Davis",
      startDate: "2024-01-08",
      endDate: "2024-06-08",
      progress: 60,
      university: "INSA Toulouse",
      project: "Customer Analytics Dashboard",
      rating: 4.6,
      status: "active",
      skills: ["Python", "SQL", "Tableau"],
      reportsSubmitted: 6,
      totalReports: 10,
    },
    {
      id: 3,
      name: "Marie Dubois",
      position: "Software Developer",
      mentor: "Alex Johnson",
      startDate: "2024-02-01",
      endDate: "2024-07-01",
      progress: 45,
      university: "INSA Lyon",
      project: "E-commerce Platform",
      rating: 4.9,
      status: "active",
      skills: ["React", "Node.js", "MongoDB"],
      reportsSubmitted: 4,
      totalReports: 8,
    },
    {
      id: 4,
      name: "Lucas Bernard",
      position: "Software Developer",
      mentor: "Sarah Wilson",
      startDate: "2023-09-01",
      endDate: "2024-02-01",
      progress: 100,
      university: "INSA Lyon",
      project: "Internal Tools Development",
      rating: 4.7,
      status: "completed",
      skills: ["Java", "Spring", "MySQL"],
      reportsSubmitted: 20,
      totalReports: 20,
    },
  ];

  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const universities = Array.from(
    new Set(interns.map((intern) => intern.university))
  );
  const filteredInterns = interns.filter(
    (intern) =>
      (statusFilter === "all" || intern.status === statusFilter) &&
      (universityFilter === "all" || intern.university === universityFilter)
  );
  const totalPages = Math.ceil(filteredInterns.length / pageSize);
  const paginatedInterns = filteredInterns.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "on-leave":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">On Leave</Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const activeInterns = interns.filter((intern) => intern.status === "active");

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interns</h1>
            <p className="text-gray-600">Manage and track your intern team</p>
          </div>
          {/* Removed Add Intern button */}
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
                  <p className="text-2xl font-bold">{interns.length}</p>
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
                      interns.reduce((sum, intern) => sum + intern.rating, 0) /
                      interns.length
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
                    placeholder="Search interns by name, position, or project..."
                    className="pl-10"
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
                  <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg z-10 p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Status
                      </label>
                      <select
                        className="w-full border rounded px-2 py-1"
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setPage(1);
                        }}
                      >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="on-leave">On Leave</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        University
                      </label>
                      <select
                        className="w-full border rounded px-2 py-1"
                        value={universityFilter}
                        onChange={(e) => {
                          setUniversityFilter(e.target.value);
                          setPage(1);
                        }}
                      >
                        <option value="all">All</option>
                        {universities.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <Button variant="outline">Export</Button>
            </div>
          </CardContent>
        </Card>

        {/* Interns List */}
        <div className="space-y-4">
          {paginatedInterns.map((intern) => (
            <Card key={intern.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {intern.name}
                        </h3>
                        {getStatusBadge(intern.status)}
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {intern.rating}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Position:</strong> {intern.position}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>University:</strong> {intern.university}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Mentor:</strong> {intern.mentor}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Project:</strong> {intern.project}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Start Date:</strong> {intern.startDate}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>End Date:</strong> {intern.endDate}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Reports:</strong> {intern.reportsSubmitted}/
                            {intern.totalReports}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Progress:</strong> {intern.progress}%
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Skills:</strong>
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {intern.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{intern.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${intern.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
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
