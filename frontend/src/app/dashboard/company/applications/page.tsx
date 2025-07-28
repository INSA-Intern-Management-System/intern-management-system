"use client";

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
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { User, Search, Eye, Check, X, Download } from "lucide-react";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function CompanyApplicationsPage() {
  const applications = [
    {
      id: 1,
      student: "Marie Dubois",
      university: "INSA Lyon",
      position: "Software Developer",
      status: "pending",
      date: "2024-01-15",
      skills: ["React", "Node.js", "Python", "MongoDB"],
      gpa: "3.8/4.0",
      experience: "2 years",
      coverLetter: "Passionate about full-stack development...",
    },
    {
      id: 2,
      student: "Pierre Martin",
      university: "INSA Toulouse",
      position: "Data Analyst",
      status: "pending",
      date: "2024-01-14",
      skills: ["Python", "SQL", "Tableau", "Machine Learning"],
      gpa: "3.9/4.0",
      experience: "1 year",
      coverLetter: "Experienced in data analysis and visualization...",
    },
    {
      id: 3,
      student: "Sophie Laurent",
      university: "INSA Rennes",
      position: "UI/UX Designer",
      status: "accepted",
      date: "2024-01-10",
      skills: ["Figma", "Adobe XD", "HTML/CSS", "JavaScript"],
      gpa: "3.7/4.0",
      experience: "3 years",
      coverLetter: "Creative designer with strong technical skills...",
    },
    {
      id: 4,
      student: "Lucas Bernard",
      university: "INSA Lyon",
      position: "Software Developer",
      status: "rejected",
      date: "2024-01-08",
      skills: ["Java", "Spring", "MySQL"],
      gpa: "3.5/4.0",
      experience: "6 months",
      coverLetter: "Eager to learn and contribute to your team...",
    },
  ];
  const [universityFilter, setUniversityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const universities = Array.from(
    new Set(applications.map((app) => app.university))
  );
  const filteredApplications = applications.filter(
    (app) => universityFilter === "all" || app.university === universityFilter
  );
  const totalPages = Math.ceil(filteredApplications.length / pageSize);
  const paginatedApplications = filteredApplications.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Pending Review
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingApplications = applications.filter(
    (app) => app.status === "pending"
  );

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6 bg-gray-50 min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-600">
              Review and manage student applications
            </p>
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
                  <p className="text-sm font-medium text-gray-600">
                    Total Applications
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">
                    Pending Review
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {pendingApplications.length}
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
                    {
                      applications.filter((app) => app.status === "accepted")
                        .length
                    }
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
                    {
                      applications.filter((app) => app.status === "rejected")
                        .length
                    }
                  </p>
                </div>
                <X className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by student name, university, or skills..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  <SelectItem value="software">Software Developer</SelectItem>
                  <SelectItem value="data">Data Analyst</SelectItem>
                  <SelectItem value="design">UI/UX Designer</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={universityFilter}
                onValueChange={(value) => {
                  setUniversityFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by university" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Universities</SelectItem>
                  {universities.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="space-y-4">
          {paginatedApplications.map((app) => (
            <Card
              key={app.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {app.student}
                        </h3>
                        {getStatusBadge(app.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>University:</strong> {app.university}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Position:</strong> {app.position}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>GPA:</strong> {app.gpa}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Experience:</strong> {app.experience}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Applied:</strong> {app.date}
                          </p>
                        </div>
                      </div>
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Skills:</strong>
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {app.skills.map((skill, index) => (
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
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                    {app.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-black text-white hover:bg-gray-900"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
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

        {/* Application Guidelines */}
        <Card className="bg-white border border-gray-200 rounded-lg mt-6 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Application Review Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Evaluation Criteria:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    • Technical skills alignment with position requirements
                  </li>
                  <li>• Academic performance and GPA</li>
                  <li>• Relevant experience and projects</li>
                  <li>• Communication skills and motivation</li>
                  <li>• Cultural fit with company values</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Review Process:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Review application within 48 hours</li>
                  <li>• Conduct initial screening call if interested</li>
                  <li>
                    • Schedule technical interview for qualified candidates
                  </li>
                  <li>• Provide feedback to all applicants</li>
                  <li>• Coordinate with university for final approval</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

