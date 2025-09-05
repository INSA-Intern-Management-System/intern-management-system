"use client";

import { useState, useMemo, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Search,
  Plus,
  Users,
  CheckCircle,
  Clock,
  Trash2,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { toast } from "@/components/ui/use-toast";
import { Project, ProjectStats } from "@/types/project";

interface ProjectClientProps {
  initialProjects: Project[];
  initialStats: ProjectStats;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  initialSearch: string;
  initialStatus: string;
  userId: number;
  onCreateProject: (
    formData: FormData
  ) => Promise<{ success?: boolean; project?: Project; error?: string }>;
  onUpdateProjectStatus: (
    projectId: number,
    projectStatus: string,
    milestoneUpdates: Array<{ milestoneId: number; status: string }>
  ) => Promise<{ success?: boolean; project?: Project; error?: string }>;
  onDeleteProject: (
    id: number
  ) => Promise<{ success?: boolean; error?: string }>;
  onCreateMilestone: (
    projectId: number,
    milestoneData: { title: string; description: string; dueDate: string }
  ) => Promise<{ success?: boolean; error?: string }>;
  onDeleteMilestone: (
    milestoneId: number
  ) => Promise<{ success?: boolean; error?: string }>;
  onFetchData: (
    page: number,
    size: number,
    search: string,
    status: string
  ) => Promise<{
    projects: Project[];
    stats: ProjectStats;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      pageSize: number;
    };
    error?: string;
  }>;
}

export default function ProjectClient({
  initialProjects,
  initialStats,
  pagination,
  initialSearch,
  initialStatus,
  userId,
  onCreateProject,
  onUpdateProjectStatus,
  onDeleteProject,
  onCreateMilestone,
  onDeleteMilestone,
  onFetchData,
}: ProjectClientProps) {
  const router = useRouter();
  const [allProjects, setAllProjects] = useState<Project[]>(initialProjects);
  const [stats, setStats] = useState<ProjectStats>(initialStats);
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "PLANNING" as Project["status"],
    startDate: "",
    endDate: "",
    budget: 0,
    technologies: "",
    milestones: "",
  });
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [page, setPage] = useState(pagination.currentPage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmingAction, setConfirmingAction] = useState<{
    projectId: number;
    action: string;
    name?: string;
    milestoneId?: number;
  } | null>(null);
  const [manageOpen, setManageOpen] = useState<number | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [filterOpen, setFilterOpen] = useState(false);

  const loadAllProjects = async () => {
    try {
      const data = await onFetchData(0, 10000, "", "all");
      if (data.error) {
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive",
        });
      } else {
        setAllProjects(data.projects);
        setStats(data.stats);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadAllProjects();
  }, []);

  const updateStats = async () => {
    try {
      const data = await onFetchData(0, 1, "", "all");
      if (!data.error) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to update stats:", error);
    }
  };

  const filteredProjects = useMemo(() => {
    let filtered = allProjects;
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (p) => p.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    if (searchValue.trim()) {
      const s = searchValue.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.description.toLowerCase().includes(s) ||
          p.technologies.some((t) => t.toLowerCase().includes(s))
      );
    }
    return filtered;
  }, [allProjects, statusFilter, searchValue]);

  const totalItems = filteredProjects.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pagination.pageSize));

  const currentProjects = useMemo(() => {
    const start = (page - 1) * pagination.pageSize;
    return filteredProjects.slice(start, start + pagination.pageSize);
  }, [filteredProjects, page, pagination.pageSize]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    } else if (totalPages === 0) {
      setPage(1);
    }
  }, [page, totalPages]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Manual FormData creation
      const formData = new FormData();
      const formElements = e.currentTarget.elements as unknown as Record<
        string,
        HTMLInputElement | HTMLSelectElement
      >;

      // Add all form fields manually
      formData.append("name", formElements.name?.value || "");
      formData.append("description", formElements.description?.value || "");
      formData.append("status", formElements.status?.value || "PLANNING");
      formData.append("startDate", formElements.startDate?.value || "");
      formData.append("endDate", formElements.endDate?.value || "");
      formData.append("budget", formElements.budget?.value || "0");
      formData.append("technologies", formElements.technologies?.value || "");
      formData.append("milestones", formElements.milestones?.value || "");

      const result = await onCreateProject(formData);

      if (result.success) {
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveProject = async (projectId: number) => {
    try {
      const result = await onDeleteProject(projectId);
      if (result.success) {
        setAllProjects((prev) => prev.filter((p) => p.id !== projectId));
        setStats((prev) => ({
          ...prev,
          total: prev.total - 1,
          [allProjects.find((p) => p.id === projectId)?.status.toLowerCase() ||
          "active"]:
            (prev[
              allProjects
                .find((p) => p.id === projectId)
                ?.status.toLowerCase() as keyof ProjectStats
            ] || 1) - 1,
        }));
        setConfirmingAction(null);
        toast({
          title: "Success",
          description: "Project deleted successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editProject || !editProject.id) return;
    setIsSubmitting(true);
    try {
      // Prepare milestone updates
      const milestoneUpdates =
        editProject.milestones?.map((milestone) => ({
          milestoneId: milestone.id!,
          status: milestone.completed ? "COMPLETED" : "IN_PROGRESS",
        })) || [];

      const result = await onUpdateProjectStatus(
        editProject.id,
        editProject.status,
        milestoneUpdates
      );

      if (result.success) {
        setAllProjects((prev) =>
          prev.map((p) => (p.id === editProject.id ? { ...editProject } : p))
        );
        setManageOpen(null);
        setEditProject(null);
        toast({
          title: "Success",
          description: "Project updated successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update project",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMilestoneAction = async (projectId: number) => {
    if (!newMilestone.title || !newMilestone.dueDate) {
      toast({
        title: "Error",
        description: "Milestone title and due date are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onCreateMilestone(projectId, newMilestone);
      if (result.success) {
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create milestone",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMilestoneAction = async (milestoneId: number) => {
    setIsSubmitting(true);
    try {
      const result = await onDeleteMilestone(milestoneId);
      if (result.success) {
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete milestone",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPage(1);
  };

  const handleExport = () => {
    const headers = [
      "Name",
      "Description",
      "Status",
      "Start Date",
      "End Date",
      "Progress (%)",
      "Budget",
      "Technologies",
      "Team Members",
      "Milestones Completed",
      "Total Milestones",
    ];

    const escapeCell = (text: string) =>
      `"${text.toString().replace(/"/g, '""')}"`;

    const rows = filteredProjects.map((project) => {
      const completedMilestones =
        project.milestones?.filter((m) => m.completed).length || 0;
      const technologies = project.technologies.join(", ");
      const teamMembers =
        project.teamMembers?.map((m) => `${m.name} (${m.role})`).join(", ") ||
        "";
      return [
        escapeCell(project.name),
        escapeCell(project.description),
        project.status,
        project.startDate,
        project.endDate,
        project.progress || 0,
        project.budget,
        escapeCell(technologies),
        escapeCell(teamMembers),
        completedMilestones,
        project.milestones?.length || 0,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });
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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case "completed":
        return <Badge className="bg-blue-500 text-white">Completed</Badge>;
      case "planning":
        return <Badge className="bg-yellow-500 text-white">Planning</Badge>;
      case "onhold":
        return <Badge className="bg-gray-500 text-white">On Hold</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case "planning":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "onhold":
        return <Clock className="h-5 w-5 text-gray-600" />;
      default:
        return <Building2 className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
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
                name="name"
                placeholder="Project Name"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
                required
              />
              <Input
                name="description"
                placeholder="Description"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
                required
              />
              <div className="flex space-x-2">
                <select
                  name="status"
                  className="border border-gray-200 rounded px-2 py-2 w-full"
                  value={newProject.status}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      status: e.target.value as Project["status"],
                    })
                  }
                >
                  <option value="PLANNING">Planning</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ONHOLD">On Hold</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <Input
                  name="startDate"
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) =>
                    setNewProject({ ...newProject, startDate: e.target.value })
                  }
                  required
                />
                <Input
                  name="endDate"
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) =>
                    setNewProject({ ...newProject, endDate: e.target.value })
                  }
                  required
                />
              </div>
              <Input
                name="budget"
                type="number"
                placeholder="Budget"
                value={newProject.budget || ""}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    budget: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <Input
                name="technologies"
                placeholder="Technologies (comma separated)"
                value={newProject.technologies}
                onChange={(e) =>
                  setNewProject({ ...newProject, technologies: e.target.value })
                }
              />
              <Input
                name="milestones"
                placeholder="Milestones (comma separated)"
                value={newProject.milestones}
                onChange={(e) =>
                  setNewProject({ ...newProject, milestones: e.target.value })
                }
              />
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  className="bg-black text-white hover:bg-gray-900 w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create"
                  )}
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
                <p className="text-sm font-medium text-gray-600">
                  Total Projects
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Projects
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
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
                <p className="text-2xl font-bold text-purple-600">
                  {stats.completed}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Planning</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.planning}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
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
                placeholder="Search projects by name, description, or technology..."
                className="pl-10"
                value={searchValue}
                onChange={handleSearchChange}
              />
            </div>

            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setFilterOpen((o) => !o)}
              >
                Filter
              </Button>

              {filterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10 p-4 space-y-4 text-sm">
                  <div>
                    <label className="block font-medium mb-1">Status</label>
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => {
                        setStatusFilter(value);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="onhold">On Hold</SelectItem>
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
                        setPage(1);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <div className="space-y-6">
        {currentProjects.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-500">
              No projects found
            </h3>
            <p className="text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          currentProjects.map((project) => (
            <Card key={project.id}>
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
                      </div>
                      <p className="text-gray-600 mb-3">
                        {project.description}
                      </p>
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
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
                            {/* Project Status */}
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Project Status
                              </label>
                              <select
                                name="status"
                                className="border border-gray-200 rounded w-full px-2 py-2"
                                value={editProject.status}
                                onChange={(e) =>
                                  setEditProject({
                                    ...editProject,
                                    status: e.target.value as Project["status"],
                                  })
                                }
                              >
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ONHOLD">On Hold</option>
                              </select>
                            </div>

                            {/* Project Description */}
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Description
                              </label>
                              <textarea
                                name="description"
                                className="border border-gray-200 rounded w-full px-2 py-2"
                                value={editProject.description}
                                onChange={(e) =>
                                  setEditProject({
                                    ...editProject,
                                    description: e.target.value,
                                  })
                                }
                                rows={3}
                              />
                            </div>

                            {/* New Milestone Section */}
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                New Milestone
                              </label>
                              <div className="space-y-2">
                                <Input
                                  name="newMilestoneTitle"
                                  placeholder="Milestone Title"
                                  value={newMilestone.title}
                                  onChange={(e) =>
                                    setNewMilestone({
                                      ...newMilestone,
                                      title: e.target.value,
                                    })
                                  }
                                />
                                <Input
                                  name="newMilestoneDescription"
                                  placeholder="Description"
                                  value={newMilestone.description}
                                  onChange={(e) =>
                                    setNewMilestone({
                                      ...newMilestone,
                                      description: e.target.value,
                                    })
                                  }
                                />
                                <Input
                                  name="newMilestoneDueDate"
                                  type="date"
                                  value={newMilestone.dueDate}
                                  onChange={(e) =>
                                    setNewMilestone({
                                      ...newMilestone,
                                      dueDate: e.target.value,
                                    })
                                  }
                                />
                                <Button
                                  type="button"
                                  onClick={() =>
                                    handleCreateMilestoneAction(editProject.id!)
                                  }
                                  className="bg-blue-600 text-white hover:bg-blue-700"
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Add Milestone"
                                  )}
                                </Button>
                              </div>
                            </div>

                            {/* Existing Milestones */}
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Milestones
                              </label>
                              <div className="space-y-2">
                                {editProject.milestones?.map((m, idx) => (
                                  <div
                                    key={m.id || idx}
                                    className="flex items-center space-x-2"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={m.completed}
                                      onChange={(e) => {
                                        const newMilestones = [
                                          ...(editProject.milestones || []),
                                        ];
                                        newMilestones[idx] = {
                                          ...m,
                                          completed: e.target.checked,
                                        };
                                        setEditProject({
                                          ...editProject,
                                          milestones: newMilestones,
                                          progress: newMilestones.length
                                            ? Math.round(
                                                (newMilestones.filter(
                                                  (m) => m.completed
                                                ).length /
                                                  newMilestones.length) *
                                                  100
                                              )
                                            : 0,
                                        });
                                      }}
                                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                    />
                                    <label
                                      className={`${
                                        m.completed
                                          ? "line-through text-gray-500"
                                          : ""
                                      } cursor-pointer flex-1`}
                                    >
                                      {m.name}
                                    </label>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 border-red-600 hover:bg-red-50"
                                      onClick={() =>
                                        setConfirmingAction({
                                          projectId: editProject.id!,
                                          action: "removeMilestone",
                                          milestoneId: m.id!,
                                          name: m.name,
                                        })
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                type="submit"
                                className="bg-black text-white hover:bg-gray-900 w-full"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Save"
                                )}
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

                    {confirmingAction?.projectId === project.id &&
                    confirmingAction.action === "remove" ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                        <p className="text-sm font-medium text-red-800">
                          Remove Project?
                        </p>
                        <p className="text-xs text-red-600">
                          Are you sure you want to remove "{project.name}"? This
                          action cannot be undone.
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
                            onClick={() => handleRemoveProject(project.id!)}
                          >
                            Yes, Remove
                          </Button>
                        </div>
                      </div>
                    ) : confirmingAction?.projectId === project.id &&
                      confirmingAction.action === "removeMilestone" ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                        <p className="text-sm font-medium text-red-800">
                          Remove Milestone?
                        </p>
                        <p className="text-xs text-red-600">
                          Are you sure you want to remove "
                          {confirmingAction.name}"? This action cannot be
                          undone.
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
                            onClick={() =>
                              handleDeleteMilestoneAction(
                                confirmingAction.milestoneId!
                              )
                            }
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
                            projectId: project.id!,
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
                      <p>
                        <strong>Start Date:</strong> {project.startDate}
                      </p>
                      <p>
                        <strong>End Date:</strong> {project.endDate}
                      </p>
                      <p>
                        <strong>Budget:</strong> €
                        {project.budget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Team Members</h4>
                    {project.teamMembers?.length ? (
                      <div className="space-y-1">
                        {project.teamMembers.map((member, idx) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{member.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {member.role}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No team members assigned
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4 mt-6">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-black">Progress</span>
                    <span className="font-semibold text-black">
                      {project.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-blue-500 rounded-full transition-all"
                      style={{ width: `${project.progress || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {project.milestones?.filter((m) => m.completed).length || 0}{" "}
                    of {project.milestones?.length || 0} milestones completed
                  </p>
                </div>

                {/* Milestones */}
                <div>
                  <h4 className="font-semibold mb-3">Milestones</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    {project.milestones?.map((m, idx) => (
                      <div
                        key={m.id || idx}
                        className={`p-2 rounded-lg text-xs text-center ${
                          m.completed
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <div className="flex items-center justify-center mb-1">
                          {m.completed ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
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
                  if (page > 1) handlePageChange(page - 1);
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
                    handlePageChange(i + 1);
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
                  if (page < totalPages) handlePageChange(page + 1);
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
  );
}
