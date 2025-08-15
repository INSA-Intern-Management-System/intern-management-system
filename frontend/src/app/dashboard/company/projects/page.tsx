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
import { DashboardLayout } from "@/app/layout/dashboard-layout";
import {
  Building2,
  Search,
  Plus,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import{
  Intern,
  Milestone,
  Project,
}from "@/types/entities";


export default function CompanyProjectsPage() {
  const initialProjects: Project[] = [
    {
      id: 1,
      name: "E-commerce Platform Redesign",
      description:
        "Complete redesign of the company's e-commerce platform with modern UI/UX",
      status: "active",
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
    status: "planning", // default to planning
    startDate: "",
    endDate: "",
    budget: "",
    mentor: "",
    technologies: "",
    milestones: "",
  });

  // Filter state
  const [statusFilter, setStatusFilter] = useState("all");
  const [mentorFilter, setMentorFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const mentors = Array.from(new Set(projects.map((p) => p.mentor)));
  const [searchValue, setSearchValue] = useState("");

  // Confirmation state for actions
  const [confirmingAction, setConfirmingAction] = useState<{
    projectId: number;
    action: string;
    name?: string;
  } | null>(null);

  const [manageOpen, setManageOpen] = useState<number | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);

  // Calculate progress based on milestones
  const calculateProgress = (milestones: Milestone[]): number => {
    if (milestones.length === 0) return 0;
    const completedCount = milestones.filter((m) => m.completed).length;
    return Math.round((completedCount / milestones.length) * 100);
  };

  // Determine status based on milestones and progress
  const determineStatus = (currentStatus: string, milestones: Milestone[]): string => {
    const completedCount = milestones.filter((m) => m.completed).length;

    if (completedCount === milestones.length && completedCount > 0) {
      return "completed"; // All done
    } else if (completedCount > 0) {
      return "active"; // Some done
    } else {
      return "planning"; // None done → force "planning"
    }
  };

  // Update progress and status when milestones change
  useEffect(() => {
    setProjects((prevProjects) =>
      prevProjects.map((project) => {
        const progress = calculateProgress(project.milestones);
        const status = determineStatus(project.status, project.milestones);
        return { ...project, progress, status };
      })
    );
  }, []);

  // Filter projects
  const filteredProjects = projects.filter(
    (p) =>
      (statusFilter === "all" || p.status === statusFilter) &&
      (mentorFilter === "all" || p.mentor === mentorFilter) &&
      (searchValue.trim() === "" ||
        p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.description.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.mentor.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.technologies.some((t) => t.toLowerCase().includes(searchValue.toLowerCase())))
  );

  const totalPages = Math.ceil(filteredProjects.length / pageSize);
  const paginatedProjects = filteredProjects.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Stats (based on all filtered data, not pagination)
  const filteredActiveProjects = filteredProjects.filter((p) => p.status === "active");
  const filteredCompletedProjects = filteredProjects.filter((p) => p.status === "completed");
  const filteredPlanningProjects = filteredProjects.filter((p) => p.status === "planning");

  const avgProgress =
    filteredActiveProjects.length > 0
      ? Math.round(
          filteredActiveProjects.reduce((sum, p) => sum + p.progress, 0) /
            filteredActiveProjects.length
        )
      : 0;

  // Create new project
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const newMilestones = newProject.milestones
      .split(",")
      .map((m) => ({ name: m.trim(), completed: false }))
      .filter((m) => m.name);

    const progress = calculateProgress(newMilestones);
    const status = determineStatus(newProject.status, newMilestones); // Auto-set to planning if no milestones done

    setProjects([
      {
        id: projects.length + 1,
        name: newProject.name,
        description: newProject.description,
        status,
        startDate: newProject.startDate,
        endDate: newProject.endDate,
        budget: newProject.budget,
        mentor: newProject.mentor,
        technologies: newProject.technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        milestones: newMilestones,
        progress,
        interns: [],
      },
      ...projects,
    ]);

    setShowCreate(false);
    setNewProject({
      name: "",
      description: "",
      status: "planning",
      startDate: "",
      endDate: "",
      budget: "",
      mentor: "",
      technologies: "",
      milestones: "",
    });
    setPage(1);
  };

  // Remove project
  const handleRemoveProject = (projectId: number) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setConfirmingAction(null);
  };

  // Save edits
  const handleSaveEdit = () => {
    if (!editProject) return;
    const updatedProgress = calculateProgress(editProject.milestones);
    const updatedStatus = determineStatus(editProject.status, editProject.milestones);
    const updatedProject = { ...editProject, progress: updatedProgress, status: updatedStatus };

    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
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

  // Export to CSV
  const handleExport = () => {
    const headers = [
      "Name",
      "Description",
      "Status",
      "Start Date",
      "End Date",
      "Progress (%)",
      "Budget",
      "Mentor",
      "Technologies",
      "Intern Count",
      "Milestones Completed",
      "Total Milestones",
    ];

    const escapeCell = (text: string) => `"${text.toString().replace(/"/g, '""')}"`;

    const rows = filteredProjects.map((project) => {
      const completedMilestones = project.milestones.filter((m) => m.completed).length;
      const technologies = project.technologies.join(", ");
      return [
        escapeCell(project.name),
        escapeCell(project.description),
        project.status,
        project.startDate,
        project.endDate,
        project.progress,
        project.budget,
        project.mentor,
        escapeCell(technologies),
        project.interns.length,
        completedMilestones,
        project.milestones.length,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `projects-export-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status & UI Helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "planning":
        return <Badge className="bg-yellow-100 text-yellow-800">Planning</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
      default:
        return <Building2 className="h-5 w-5 text-gray-600" />;
    }
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
              <Button className="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-6 py-2 rounded-md flex items-center">
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
                  placeholder="Project Name"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="Description"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  required
                />
                <div className="flex space-x-2">
                  <select
                    className="border border-gray-200 rounded px-2 py-2 w-full"
                    value={newProject.status}
                    onChange={(e) =>
                      setNewProject({ ...newProject, status: e.target.value })
                    }
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                 
                </div>
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) =>
                      setNewProject({ ...newProject, startDate: e.target.value })
                    }
                    required
                  />
                  <Input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) =>
                      setNewProject({ ...newProject, endDate: e.target.value })
                    }
                    required
                  />
                </div>
                <Input
                  placeholder="Budget"
                  value={newProject.budget}
                  onChange={(e) =>
                    setNewProject({ ...newProject, budget: e.target.value })
                  }
                />
                <Input
                  placeholder="Mentor"
                  value={newProject.mentor}
                  onChange={(e) =>
                    setNewProject({ ...newProject, mentor: e.target.value })
                  }
                />
                <Input
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
                  placeholder="Milestones (comma separated)"
                  value={newProject.milestones}
                  onChange={(e) =>
                    setNewProject({ ...newProject, milestones: e.target.value })
                  }
                />
                <div className="flex space-x-2">
                  <Button type="submit" className="bg-black text-white hover:bg-gray-900 w-full">
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold">{filteredProjects.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-green-600">{filteredActiveProjects.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-purple-600">{filteredCompletedProjects.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                  <p className="text-2xl font-bold text-orange-600">{avgProgress}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects by name, description, technology, or mentor..."
                  className="pl-10"
                  value={searchValue}
                  onChange={handleSearchChange}
                />
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
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        <div className="space-y-6">
          {paginatedProjects.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-500">No projects found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            paginatedProjects.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        {getStatusIcon(project.status)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                          {getStatusBadge(project.status)}
                        </div>
                        <p className="text-gray-600 mb-3">{project.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Dialog
                        open={manageOpen === project.id}
                        onOpenChange={(open) => {
                          setManageOpen(open ? project.id : null);
                          setEditProject(open ? { ...project } : null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" 
                          size="sm"   
                           className="border-blue-600 text-blue-600 hover:bg-blue-50">
                            Manage Project</Button>
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
                                <label className="block text-sm font-medium mb-1">Project Status</label>
                                <select
                                  className="border border-gray-200 rounded w-full px-2 py-2"
                                  value={editProject.status}
                                  onChange={(e) =>
                                    setEditProject({ ...editProject, status: e.target.value })
                                  }
                                >
                                  <option value="planning">Planning</option>
                                  <option value="active">Active</option>
                                  <option value="completed">Completed</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Milestones</label>
                                <div className="space-y-2">
                                  {editProject.milestones.map((m, idx) => (
                                    <div key={idx} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={m.completed}
                                        onChange={(e) => {
                                          const newMilestones = [...editProject.milestones];
                                          newMilestones[idx] = { ...m, completed: e.target.checked };
                                          setEditProject({ ...editProject, milestones: newMilestones });
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                      />
                                      <label
                                        className={`${m.completed ? "line-through text-gray-500" : ""} cursor-pointer`}
                                      >
                                        {m.name}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                  className="border border-gray-200 rounded w-full px-2 py-2"
                                  value={editProject.description}
                                  onChange={(e) =>
                                    setEditProject({ ...editProject, description: e.target.value })
                                  }
                                  rows={3}
                                />
                              </div>
                              <div className="flex space-x-2">
                                <Button type="submit" className="bg-black text-white hover:bg-gray-900 w-full">
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

                      {confirmingAction?.projectId === project.id && confirmingAction.action === "remove" ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                          <p className="text-sm font-medium text-red-800">Remove Project?</p>
                          <p className="text-xs text-red-600">
                            Are you sure you want to remove "{project.name}"? This action cannot be undone.
                          </p>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              onClick={() => setConfirmingAction(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-xs h-7"
                              onClick={() => handleRemoveProject(project.id)}
                            >
                              Yes, Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() =>
                            setConfirmingAction({
                              projectId: project.id,
                              action: "remove",
                              name: project.name,
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold mb-2">Project Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Start Date:</strong> {project.startDate}</p>
                        <p><strong>End Date:</strong> {project.endDate}</p>
                        <p><strong>Budget:</strong> {project.budget}</p>
                        <p><strong>Mentor:</strong> {project.mentor}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Team Members</h4>
                      {project.interns.length > 0 ? (
                        <div className="space-y-1">
                          {project.interns.map((intern, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-sm">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{intern.name}</span>
                              <Badge variant="outline" className="text-xs">{intern.role}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No interns assigned</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Technologies</h4>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4 mt-6">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-black">Progress</span>
                      <span className="font-semibold text-black">{project.progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-3 bg-blue-500 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {project.milestones.filter(m => m.completed).length} of {project.milestones.length} milestones completed
                    </p>
                  </div>

                  {/* Milestones */}
                  <div>
                    <h4 className="font-semibold mb-3">Milestones</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      {project.milestones.map((m, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg text-xs text-center ${
                            m.completed
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <div className="flex items-center justify-center mb-1">
                            {m.completed ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          </div>
                          {m.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
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
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Project Management Best Practices</CardTitle>
            <CardDescription>Tips for successful project execution with interns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Planning Phase:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Define clear project objectives and deliverables</li>
                  <li>• Break down tasks into manageable milestones</li>
                  <li>• Assign appropriate skill levels to intern capabilities</li>
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