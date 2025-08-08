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
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Building2,
  Search,
  Plus,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Intern = { name: string; role: string };
type Milestone = { name: string; completed: boolean };
type Project = {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  progress: number;
  budget: string;
  interns: Intern[];
  mentor: string;
  technologies: string[];
  milestones: Milestone[];
};

export default function CompanyProjectsPage() {
  const initialProjects: Project[] = [
    {
      id: 1,
      name: "E-commerce Platform Redesign",
      description:
        "Complete redesign of the company's e-commerce platform with modern UI/UX",
      status: "active",
      priority: "high",
      startDate: "2024-01-15",
      endDate: "2024-06-15",
      progress: 65,
      budget: "€50,000",
      interns: [
        { name: "Marie Dubois", role: "Frontend Developer" },
        { name: "Pierre Martin", role: "Backend Developer" },
      ],
      mentor: "Sarah Wilson",
      technologies: ["React", "Node.js", "MongoDB", "AWS"],
      milestones: [
        { name: "Requirements Analysis", completed: true },
        { name: "UI/UX Design", completed: true },
        { name: "Frontend Development", completed: false },
        { name: "Backend Integration", completed: false },
        { name: "Testing & Deployment", completed: false },
      ],
    },
    {
      id: 2,
      name: "Customer Analytics Dashboard",
      description:
        "Development of a comprehensive analytics dashboard for customer insights",
      status: "active",
      priority: "medium",
      startDate: "2024-02-01",
      endDate: "2024-07-01",
      progress: 40,
      budget: "€30,000",
      interns: [{ name: "Sophie Laurent", role: "Data Analyst" }],
      mentor: "Tom Davis",
      technologies: ["Python", "Tableau", "SQL", "AWS"],
      milestones: [
        { name: "Data Collection Setup", completed: true },
        { name: "Dashboard Design", completed: false },
        { name: "Data Processing", completed: false },
        { name: "Visualization Development", completed: false },
        { name: "User Testing", completed: false },
      ],
    },
    {
      id: 3,
      name: "Mobile App Development",
      description: "Native mobile application for iOS and Android platforms",
      status: "planning",
      priority: "low",
      startDate: "2024-03-01",
      endDate: "2024-08-01",
      progress: 15,
      budget: "€75,000",
      interns: [],
      mentor: "Alex Johnson",
      technologies: ["React Native", "Firebase", "TypeScript"],
      milestones: [
        { name: "Project Planning", completed: true },
        { name: "Technical Architecture", completed: false },
        { name: "UI/UX Design", completed: false },
        { name: "Development Phase 1", completed: false },
        { name: "Testing & Launch", completed: false },
      ],
    },
    {
      id: 4,
      name: "Internal Tools Optimization",
      description:
        "Optimization and modernization of internal development tools",
      status: "completed",
      priority: "medium",
      startDate: "2023-09-01",
      endDate: "2024-02-01",
      progress: 100,
      budget: "€25,000",
      interns: [{ name: "Lucas Bernard", role: "Full Stack Developer" }],
      mentor: "Sarah Wilson",
      technologies: ["Java", "Spring Boot", "MySQL", "Docker"],
      milestones: [
        { name: "Current System Analysis", completed: true },
        { name: "New Architecture Design", completed: true },
        { name: "Development", completed: true },
        { name: "Migration & Testing", completed: true },
        { name: "Deployment", completed: true },
      ],
    },
  ];
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "active",
    priority: "medium",
    startDate: "",
    endDate: "",
    budget: "",
    mentor: "",
    technologies: "",
    milestones: "",
  });
  // Filter state
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [mentorFilter, setMentorFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const mentors = Array.from(new Set(projects.map((p) => p.mentor)));
  const [searchValue, setSearchValue] = useState("");
  const filteredProjects = projects.filter(
    (p) =>
      (statusFilter === "all" || p.status === statusFilter) &&
      (priorityFilter === "all" || p.priority === priorityFilter) &&
      (mentorFilter === "all" || p.mentor === mentorFilter) &&
      (searchValue.trim() === "" ||
        p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.mentor.toLowerCase().includes(searchValue.toLowerCase()) ||
        (Array.isArray(p.technologies) &&
          p.technologies.some((t) =>
            t.toLowerCase().includes(searchValue.toLowerCase())
          )))
  );
  const totalPages = Math.ceil(filteredProjects.length / pageSize);
  const paginatedProjects = filteredProjects.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  // Create project handler
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    setProjects([
      {
        id: projects.length + 1,
        name: newProject.name,
        description: newProject.description,
        status: newProject.status,
        priority: newProject.priority,
        startDate: newProject.startDate,
        endDate: newProject.endDate,
        budget: newProject.budget,
        mentor: newProject.mentor,
        technologies: newProject.technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        milestones: newProject.milestones
          .split(",")
          .map((m) => ({ name: m.trim(), completed: false }))
          .filter((m) => m.name),
        progress: 0,
        interns: [],
      },
      ...projects,
    ]);
    setShowCreate(false);
    setNewProject({
      name: "",
      description: "",
      status: "active",
      priority: "medium",
      startDate: "",
      endDate: "",
      budget: "",
      mentor: "",
      technologies: "",
      milestones: "",
    });
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "planning":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Planning</Badge>
        );
      case "on-hold":
        return <Badge className="bg-gray-100 text-gray-800">On Hold</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Medium Priority
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-green-100 text-green-800">Low Priority</Badge>
        );
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case "planning":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "on-hold":
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Building2 className="h-5 w-5 text-gray-600" />;
    }
  };

  const activeProjects = projects.filter(
    (project) => project.status === "active"
  );
  const completedProjects = projects.filter(
    (project) => project.status === "completed"
  );
  const [manageOpen, setManageOpen] = useState<number | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);

  // Save changes in manage dialog
  const handleSaveEdit = () => {
    if (!editProject) return;
    setProjects((prev) =>
      prev.map((p) => (p.id === editProject.id ? { ...editProject } : p))
    );
    setManageOpen(null);
    setEditProject(null);
  };

  // Reset page on filter/search change
  const handleFilterChange =
    (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value);
      setPage(1);
    };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPage(1);
  };

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600">
              Manage internship projects and track progress
            </p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white hover:bg-gray-900 font-semibold px-6 py-2 rounded-md flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-lg rounded-xl">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreateProject}>
                <Input
                  className="border border-gray-200 rounded w-full"
                  placeholder="Project Name"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  required
                />
                <Input
                  className="border border-gray-200 rounded w-full"
                  placeholder="Description"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  required
                />
                <div className="flex space-x-2 w-full">
                  <select
                    className="border border-gray-200 rounded px-2 py-2 w-full"
                    value={newProject.status}
                    onChange={(e) =>
                      setNewProject({ ...newProject, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="planning">Planning</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                  <select
                    className="border border-gray-200 rounded px-2 py-2 w-full"
                    value={newProject.priority}
                    onChange={(e) =>
                      setNewProject({ ...newProject, priority: e.target.value })
                    }
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex space-x-2 w-full">
                  <Input
                    className="border border-gray-200 rounded w-full"
                    placeholder="Start Date"
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        startDate: e.target.value,
                      })
                    }
                    required
                  />
                  <Input
                    className="border border-gray-200 rounded w-full"
                    placeholder="End Date"
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) =>
                      setNewProject({ ...newProject, endDate: e.target.value })
                    }
                    required
                  />
                </div>
                <Input
                  className="border border-gray-200 rounded w-full"
                  placeholder="Budget"
                  value={newProject.budget}
                  onChange={(e) =>
                    setNewProject({ ...newProject, budget: e.target.value })
                  }
                />
                <Input
                  className="border border-gray-200 rounded w-full"
                  placeholder="Mentor"
                  value={newProject.mentor}
                  onChange={(e) =>
                    setNewProject({ ...newProject, mentor: e.target.value })
                  }
                />
                <Input
                  className="border border-gray-200 rounded w-full"
                  placeholder="Technologies (comma separated)"
                  value={newProject.technologies}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      technologies: e.target.value,
                    })
                  }
                />
                <Input
                  className="border border-gray-200 rounded w-full"
                  placeholder="Milestones (comma separated)"
                  value={newProject.milestones}
                  onChange={(e) =>
                    setNewProject({ ...newProject, milestones: e.target.value })
                  }
                />
                <div className="flex space-x-2 w-full">
                  <Button
                    type="submit"
                    className="bg-black text-white hover:bg-gray-900 w-full"
                  >
                    Create
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Projects
                  </p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Projects
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {activeProjects.length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {completedProjects.length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg. Progress
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(
                      activeProjects.reduce(
                        (sum, project) => sum + project.progress,
                        0
                      ) / activeProjects.length || 0
                    )}
                    %
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-orange-600" />
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
                    placeholder="Search projects by name, technology, or mentor..."
                    className="pl-10"
                    value={searchValue}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              <select
                className="border border-gray-200 rounded px-2 py-1"
                value={statusFilter}
                onChange={handleFilterChange(setStatusFilter)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="planning">Planning</option>
                <option value="on-hold">On Hold</option>
              </select>
              <select
                className="border border-gray-200 rounded px-2 py-1"
                value={priorityFilter}
                onChange={handleFilterChange(setPriorityFilter)}
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                className="border border-gray-200 rounded px-2 py-1"
                value={mentorFilter}
                onChange={handleFilterChange(setMentorFilter)}
              >
                <option value="all">All Mentors</option>
                {mentors.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <Button variant="outline">Export</Button>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        <div className="space-y-6">
          {paginatedProjects.map((project) => (
            <Card
              key={project.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      {getStatusIcon(project.status)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {project.name}
                        </h3>
                        {getStatusBadge(project.status)}
                        {getPriorityBadge(project.priority)}
                      </div>
                      <p className="text-gray-600 mb-3">
                        {project.description}
                      </p>
                    </div>
                  </div>
                  <Dialog
                    open={manageOpen === project.id}
                    onOpenChange={(open) => {
                      setManageOpen(open ? project.id : null);
                      setEditProject(open ? { ...project } : null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Manage Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-2xl rounded-xl">
                      <DialogHeader>
                        <DialogTitle>Manage Project</DialogTitle>
                      </DialogHeader>
                      {editProject && (
                        <form
                          className="space-y-4"
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveEdit();
                          }}
                        >
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Project Status
                            </label>
                            <select
                              className="border border-gray-200 rounded w-full px-2 py-2"
                              value={editProject.status}
                              onChange={(e) =>
                                setEditProject({
                                  ...editProject,
                                  status: e.target.value,
                                })
                              }
                            >
                              <option value="active">Active</option>
                              <option value="completed">Completed</option>
                              <option value="planning">Planning</option>
                              <option value="on-hold">On Hold</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Milestones
                            </label>
                            <div className="space-y-2">
                              {editProject.milestones.map((m, idx) => (
                                <label
                                  key={idx}
                                  className="flex items-center space-x-2"
                                >
                                  <input
                                    type="checkbox"
                                    checked={m.completed}
                                    onChange={(e) => {
                                      const newMilestones =
                                        editProject.milestones.map((mil, i) =>
                                          i === idx
                                            ? {
                                                ...mil,
                                                completed: e.target.checked,
                                              }
                                            : mil
                                        );
                                      setEditProject({
                                        ...editProject,
                                        milestones: newMilestones,
                                      });
                                    }}
                                  />
                                  <span
                                    className={
                                      m.completed
                                        ? "line-through text-gray-500"
                                        : ""
                                    }
                                  >
                                    {m.name}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Description
                            </label>
                            <textarea
                              className="border border-gray-200 rounded w-full px-2 py-2"
                              value={editProject.description}
                              onChange={(e) =>
                                setEditProject({
                                  ...editProject,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="flex space-x-2 w-full">
                            <Button
                              type="submit"
                              className="bg-black text-white hover:bg-gray-900 w-full"
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={() => setManageOpen(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-2">Project Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <strong>Start Date:</strong> {project.startDate}
                      </p>
                      <p>
                        <strong>End Date:</strong> {project.endDate}
                      </p>
                      <p>
                        <strong>Budget:</strong> {project.budget}
                      </p>
                      <p>
                        <strong>Mentor:</strong> {project.mentor}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Team Members</h4>
                    {project.interns.length > 0 ? (
                      <div className="space-y-1">
                        {project.interns.map((intern, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{intern.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {intern.role}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No interns assigned
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4 mt-6">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-black text-base">
                      Progress
                    </span>
                    <span className="text-base font-semibold text-black">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-3 rounded-full bg-black transition-all"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Milestones</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    {project.milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-lg text-xs text-center ${
                          milestone.completed
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <div className="flex items-center justify-center mb-1">
                          {milestone.completed ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                        </div>
                        {milestone.name}
                      </div>
                    ))}
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

        {/* Project Management Tips */}
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Project Management Best Practices</CardTitle>
            <CardDescription>
              Tips for successful project execution with interns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Planning Phase:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Define clear project objectives and deliverables</li>
                  <li>• Break down tasks into manageable milestones</li>
                  <li>
                    • Assign appropriate skill levels to intern capabilities
                  </li>
                  <li>• Set realistic timelines with buffer for learning</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Execution Phase:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Conduct regular progress reviews and check-ins</li>
                  <li>• Provide continuous mentorship and guidance</li>
                  <li>• Encourage collaboration and knowledge sharing</li>
                  <li>• Document lessons learned and best practices</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
