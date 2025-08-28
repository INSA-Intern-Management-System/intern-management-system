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
import { Plus, Search, Users, Trash2, Download, Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface AvailableProject {
  id: number;
  name: string;
}

interface FrontendTeam {
  id: number;
  name: string;
  project: string;
  members: { name: string; teamMemberId: number; role: string }[];
}

interface CompanyTeamsClientProps {
  initialTeams: FrontendTeam[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  availableProjects: AvailableProject[];
  managerId: number;
  onCreateTeam: (data: {
    name: string;
    projectId: number | null;
    members?: { userId: number; role: string }[];
  }) => Promise<{ success: boolean; error?: string }>;
  onAddMember: (data: {
    teamId: number;
    memberId: number;
    role: string;
  }) => Promise<{ success: boolean; error?: string }>;
  onSearchUsers: (name: string) => Promise<{
    success: boolean;
    users: { id: number; name: string; details: string }[];
    error?: string;
  }>;
  onSearchProjects: (keyword: string) => Promise<{
    success: boolean;
    projects: { id: number; name: string; description: string }[];
    error?: string;
  }>;
  onRemoveMember: (
    teamMemberId: number
  ) => Promise<{ success: boolean; error?: string }>;
  onAssignProject: (
    teamId: number,
    projectId: number
  ) => Promise<{ success: boolean; error?: string }>;
  onRemoveProject: (
    teamId: number
  ) => Promise<{ success: boolean; error?: string }>;
  onDeleteTeam: (
    teamId: number
  ) => Promise<{ success: boolean; error?: string }>;
  onFetchData: (
    page: number,
    size: number,
    search: string,
    hasProject: string
  ) => Promise<{
    teams: FrontendTeam[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      pageSize: number;
    };
    error?: string;
  }>;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (v: string) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type?: string;
}

function AutocompleteInput({
  value,
  onChange,
  suggestions = [],
  placeholder,
  className = "",
  disabled = false,
  type = "text",
}: AutocompleteInputProps) {
  const [show, setShow] = useState(false);
  const [input, setInput] = useState(value || "");

  useEffect(() => {
    setInput(value || "");
  }, [value]);

  const filtered = suggestions
    .filter((s): s is string => s != null)
    .filter((s) => s.toLowerCase().includes(input.toLowerCase()) && s !== value)
    .slice(0, 10);

  return (
    <div className={`relative ${className}`}>
      <Input
        type={type}
        value={input}
        placeholder={placeholder}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setInput(e.target.value);
          onChange(e.target.value);
          setShow(true);
        }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 100)}
        disabled={disabled}
      />
      {show && filtered.length > 0 && (
        <div className="absolute left-0 right-0 bg-white border rounded shadow z-10 max-h-40 overflow-y-auto">
          {filtered.map((s, index) => (
            <div
              key={index}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
              onMouseDown={() => {
                onChange(s);
                setInput(s);
                setShow(false);
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CompanyTeamsClient({
  initialTeams,
  pagination,
  availableProjects,
  managerId,
  onCreateTeam,
  onAddMember,
  onSearchUsers,
  onSearchProjects,
  onRemoveMember,
  onAssignProject,
  onRemoveProject,
  onDeleteTeam,
  onFetchData,
}: CompanyTeamsClientProps) {
  const router = useRouter();
  const pageSize = 3;
  const [allTeams, setAllTeams] = useState<FrontendTeam[]>(initialTeams);
  const [searchValue, setSearchValue] = useState("");
  const [hasProjectFilter, setHasProjectFilter] = useState("all");
  const [page, setPage] = useState(pagination.currentPage);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: "",
    project: "",
    memberSearch: "",
  });
  const [userSearchResults, setUserSearchResults] = useState<
    { id: number; name: string; details: string }[]
  >([]);
  const [projectSearchResults, setProjectSearchResults] = useState<
    { id: number; name: string; description: string }[]
  >([]);
  const [selectedUsers, setSelectedUsers] = useState<
    { id: number; name: string; role: string }[]
  >([]);
  const [addMemberId, setAddMemberId] = useState<number | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [assignProjectId, setAssignProjectId] = useState<number | null>(null);
  const [projectSearch, setProjectSearch] = useState("");
  const [confirmingAction, setConfirmingAction] = useState<{
    teamId: number;
    action: string;
    name?: string;
    teamMemberId?: number;
  } | null>(null);

  const loadAllTeams = async () => {
    try {
      setIsLoading(true);
      const data = await onFetchData(0, 10000, "", "all");
      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        if (data.error.includes("Unauthorized")) {
          router.push("/login");
        }
      } else {
        setAllTeams(data.teams);
      }
    } catch (error: any) {
      console.error("Failed to load teams:", error);
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isValidData =
      Array.isArray(initialTeams) &&
      Array.isArray(availableProjects) &&
      pagination != null;

    if (isValidData) {
      setAllTeams(initialTeams);
      const validPage = Math.max(
        1,
        Math.min(pagination.currentPage + 1, pagination.totalPages)
      );
      setPage(validPage);
    } else {
      console.error("Invalid data received");
      toast({
        title: "Error",
        description: "Invalid data received",
        variant: "destructive",
      });
      setAllTeams([]);
      setPage(1);
    }
  }, [initialTeams, pagination, availableProjects]);

  useEffect(() => {
    loadAllTeams();
  }, []);

  const filteredTeams = useMemo(() => {
    let filtered = allTeams;
    if (searchValue.trim()) {
      const s = searchValue.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(s) ||
          t.project?.toLowerCase().includes(s) ||
          t.members.some((m) => m.name.toLowerCase().includes(s))
      );
    }
    if (hasProjectFilter !== "all") {
      filtered = filtered.filter((t) =>
        hasProjectFilter === "with-project" ? t.project : !t.project
      );
    }
    return filtered;
  }, [allTeams, hasProjectFilter, searchValue]);

  const totalItems = filteredTeams.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const currentTeams = useMemo(() => {
    if (totalItems === 0) return [];
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredTeams.slice(start, end);
  }, [filteredTeams, page, pageSize]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    } else if (totalPages === 0) {
      setPage(1);
    }
  }, [page, totalPages]);

  const handleSearchUsers = async (query: string) => {
    if (query.length < 2) {
      setUserSearchResults([]);
      return;
    }

    try {
      const response = await onSearchUsers(query);
      if (response.success) {
        setUserSearchResults(response.users);
      } else {
        toast({
          title: "Search failed",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSearchProjects = async (query: string) => {
    if (query.length < 2) {
      setProjectSearchResults([]);
      return;
    }

    try {
      const response = await onSearchProjects(query);
      if (response.success) {
        setProjectSearchResults(response.projects);
      } else {
        toast({
          title: "Search failed",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const projectId =
      availableProjects.find((p) => p.name === newTeam.project)?.id || null;

    try {
      const members = selectedUsers.map((user) => ({
        userId: user.id,
        role: user.role,
      }));

      const response = await onCreateTeam({
        name: newTeam.name,
        projectId,
        members: members.length > 0 ? members : undefined,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to create team");
      }

      setNewTeam({ name: "", project: "", memberSearch: "" });
      setSelectedUsers([]);
      setUserSearchResults([]);
      setShowCreate(false);
      toast({
        title: "Success",
        description: "Team created successfully",
      });
      await loadAllTeams();
      router.refresh();
    } catch (error: any) {
      console.error("handleCreateTeam error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create team",
        variant: "destructive",
      });
      if (error.message.includes("Unauthorized")) {
        router.push("/login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMember = async (
    teamId: number,
    userId: number,
    userName: string
  ) => {
    setIsSubmitting(true);
    try {
      const response = await onAddMember({
        teamId,
        memberId: userId,
        role: "Developer",
      });

      if (!response.success)
        throw new Error(response.error || "Failed to add member");

      setAddMemberId(null);
      setMemberSearch("");
      setUserSearchResults([]);
      toast({
        title: "Success",
        description: `${userName} added to team successfully`,
      });
      await loadAllTeams();
      router.refresh();
    } catch (error: any) {
      console.error("handleAddMember error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add member",
        variant: "destructive",
      });
      if (error.message.includes("Unauthorized")) {
        router.push("/login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (teamMemberId: number, teamId: number) => {
    setIsSubmitting(true);
    try {
      const response = await onRemoveMember(teamMemberId);
      if (!response.success)
        throw new Error(response.error || "Failed to remove member");
      setConfirmingAction(null);
      toast({ title: "Success", description: "Member removed successfully" });
      await loadAllTeams();
      router.refresh();
    } catch (error: any) {
      console.error("handleRemoveMember error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove member",
        variant: "destructive",
      });
      if (error.message.includes("Unauthorized")) {
        router.push("/login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignProject = async (
    teamId: number,
    projectId: number,
    projectName: string
  ) => {
    setIsSubmitting(true);
    try {
      const response = await onAssignProject(teamId, projectId);
      if (!response.success)
        throw new Error(response.error || "Failed to assign project");
      setAssignProjectId(null);
      setProjectSearch("");
      setProjectSearchResults([]);
      toast({
        title: "Success",
        description: `Project "${projectName}" assigned successfully`,
      });
      await loadAllTeams();
      router.refresh();
    } catch (error: any) {
      console.error("handleAssignProject error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign project",
        variant: "destructive",
      });
      if (error.message.includes("Unauthorized")) {
        router.push("/login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveProject = async (teamId: number) => {
    setIsSubmitting(true);
    try {
      const response = await onRemoveProject(teamId);
      if (!response.success)
        throw new Error(response.error || "Failed to remove project");
      toast({ title: "Success", description: "Project removed from team" });
      await loadAllTeams();
      router.refresh();
    } catch (error: any) {
      console.error("handleRemoveProject error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove project",
        variant: "destructive",
      });
      if (error.message.includes("Unauthorized")) {
        router.push("/login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    setIsSubmitting(true);
    try {
      const response = await onDeleteTeam(teamId);
      if (!response.success)
        throw new Error(response.error || "Failed to delete team");
      setConfirmingAction(null);
      toast({ title: "Success", description: "Team deleted successfully" });
      await loadAllTeams();
      router.refresh();
    } catch (error: any) {
      console.error("handleDeleteTeam error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete team",
        variant: "destructive",
      });
      if (error.message.includes("Unauthorized")) {
        toast({
          title: "Unauthorized",
          description: "You do not have permission to delete this team.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    const headers = ["Team Name", "Project", "Members", "Member Roles"];
    const escapeCell = (text: string) =>
      `"${text.toString().replace(/"/g, '""')}"`;
    const rows = filteredTeams.map((team) =>
      [
        escapeCell(team.name),
        escapeCell(team.project || "No project"),
        escapeCell(team.members.map((m) => m.name).join(", ")),
        escapeCell(team.members.map((m) => m.role).join(", ")),
      ].join(",")
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `teams-export-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHasProjectFilter(e.target.value);
    setPage(1);
  };

  const availableProjectsNames =
    availableProjects.length > 0 ? availableProjects.map((p) => p.name) : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600">
            Manage your teams, members, and project assignments
          </p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-6 py-2 rounded-md flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-lg rounded-xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleCreateTeam}>
              <Input
                placeholder="Team Name"
                value={newTeam.name}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, name: e.target.value })
                }
                required
              />

              <AutocompleteInput
                placeholder={
                  availableProjects.length === 0
                    ? "No projects available"
                    : "Assign Project (optional)"
                }
                value={newTeam.project}
                onChange={(v) => setNewTeam({ ...newTeam, project: v })}
                suggestions={availableProjectsNames}
                disabled={availableProjects.length === 0}
              />

              <div>
                <Label>Add Members (optional)</Label>
                <Input
                  placeholder="Search users by name..."
                  value={newTeam.memberSearch}
                  onChange={(e) => {
                    setNewTeam({ ...newTeam, memberSearch: e.target.value });
                    handleSearchUsers(e.target.value);
                  }}
                />
                {userSearchResults.length > 0 && (
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {userSearchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          if (!selectedUsers.some((u) => u.id === user.id)) {
                            setSelectedUsers([
                              ...selectedUsers,
                              {
                                id: user.id,
                                name: user.name,
                                role: "Developer",
                              },
                            ]);
                          }
                          setNewTeam({ ...newTeam, memberSearch: "" });
                          setUserSearchResults([]);
                        }}
                      >
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">
                            {user.details}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={selectedUsers.some((u) => u.id === user.id)}
                        >
                          {selectedUsers.some((u) => u.id === user.id)
                            ? "Added"
                            : "Add"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {selectedUsers.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm font-medium">Selected Members:</p>
                    {selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <span>{user.name}</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            setSelectedUsers(
                              selectedUsers.filter((u) => u.id !== user.id)
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700 w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create Team"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setShowCreate(false);
                    setNewTeam({ name: "", project: "", memberSearch: "" });
                    setSelectedUsers([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search teams by name, project, or member..."
                className="pl-10"
                value={searchValue}
                onChange={handleSearchChange}
              />
            </div>
            <select
              className="border border-gray-200 rounded px-2 py-1"
              value={hasProjectFilter}
              onChange={handleFilterChange}
            >
              <option value="all">All Teams</option>
              <option value="with-project">With Project</option>
              <option value="no-project">No Project</option>
            </select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {currentTeams.length === 0 ? (
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <CardContent className="p-6 text-center text-gray-500">
              No teams found. Try adjusting your search or filter criteria.
            </CardContent>
          </Card>
        ) : (
          currentTeams.map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {team.name}
                      </h3>
                      {team.project ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          Assigned to {team.project}
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          No Project
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Members:</strong>
                      {team.members.length > 0 ? (
                        <div className="space-y-1 mt-1">
                          {team.members.map((member) => (
                            <div
                              key={member.teamMemberId}
                              className="flex items-center space-x-2"
                            >
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{member.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {member.role}
                              </Badge>
                              {confirmingAction?.teamId === team.id &&
                              confirmingAction.action === "removeMember" &&
                              confirmingAction.teamMemberId ===
                                member.teamMemberId ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                                  <p className="text-xs text-red-600">
                                    Remove "{member.name}"?
                                  </p>
                                  <div className="flex space-x-2 mt-1">
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
                                        handleRemoveMember(
                                          member.teamMemberId,
                                          team.id
                                        )
                                      }
                                      disabled={isSubmitting}
                                    >
                                      {isSubmitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        "Yes, Remove"
                                      )}
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
                                      teamId: team.id,
                                      action: "removeMember",
                                      name: member.name,
                                      teamMemberId: member.teamMemberId,
                                    })
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="ml-2">No members yet</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {addMemberId === team.id ? (
                      <div className="space-y-2">
                        <Input
                          placeholder="Search users by name..."
                          value={memberSearch}
                          onChange={(e) => {
                            setMemberSearch(e.target.value);
                            handleSearchUsers(e.target.value);
                          }}
                        />
                        {userSearchResults.length > 0 && (
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {userSearchResults.map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                                onClick={() =>
                                  handleAddMember(team.id, user.id, user.name)
                                }
                              >
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {user.details}
                                  </p>
                                </div>
                                <Button size="sm" variant="outline">
                                  Add
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAddMemberId(null);
                            setMemberSearch("");
                            setUserSearchResults([]);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() => setAddMemberId(team.id)}
                      >
                        Add Member
                      </Button>
                    )}

                    {assignProjectId === team.id ? (
                      <div className="space-y-2">
                        <Input
                          placeholder="Search projects..."
                          value={projectSearch}
                          onChange={(e) => {
                            setProjectSearch(e.target.value);
                            handleSearchProjects(e.target.value);
                          }}
                        />
                        {projectSearchResults.length > 0 && (
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {projectSearchResults.map((project) => (
                              <div
                                key={project.id}
                                className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                                onClick={() =>
                                  handleAssignProject(
                                    team.id,
                                    project.id,
                                    project.name
                                  )
                                }
                              >
                                <div>
                                  <p className="font-medium">{project.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {project.description}
                                  </p>
                                </div>
                                <Button size="sm" variant="outline">
                                  Assign
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAssignProjectId(null);
                            setProjectSearch("");
                            setProjectSearchResults([]);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() => setAssignProjectId(team.id)}
                      >
                        {team.project ? "Change Project" : "Assign Project"}
                      </Button>
                    )}

                    {team.project && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-orange-600 border-orange-600 hover:bg-orange-50"
                        onClick={() => handleRemoveProject(team.id)}
                        disabled={isSubmitting}
                      >
                        Remove Project
                      </Button>
                    )}

                    {confirmingAction?.teamId === team.id &&
                    confirmingAction.action === "removeTeam" ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                        <p className="text-sm font-medium text-red-800">
                          Remove Team?
                        </p>
                        <p className="text-xs text-red-600">
                          Are you sure you want to remove "{team.name}"? This
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
                            onClick={() => handleDeleteTeam(team.id)}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Yes, Remove"
                            )}
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
                            teamId: team.id,
                            action: "removeTeam",
                            name: team.name,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Team
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
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
                  if (page < totalPages) setPage(page + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Team Management Best Practices</CardTitle>
          <CardDescription>
            Tips for building and managing effective teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Team Formation:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Define clear team roles and responsibilities</li>
                <li>• Balance skills and experience among members</li>
                <li>• Set shared goals and expectations</li>
                <li>• Foster open communication and collaboration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Ongoing Management:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Hold regular team meetings and check-ins</li>
                <li>• Encourage feedback and knowledge sharing</li>
                <li>• Support professional growth and learning</li>
                <li>• Celebrate team achievements and milestones</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add the missing Label component
const Label = ({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-medium text-gray-700 mb-1"
  >
    {children}
  </label>
);
