"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Plus } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect } from "react";

export default function CompanyTeamsPage() {
  const initialTeams = [
    {
      id: 1,
      name: "Frontend Team",
      members: ["Sophie Laurent", "Marie Dubois"],
      project: "Mobile App Redesign",
    },
    {
      id: 2,
      name: "Backend Team",
      members: ["Pierre Martin"],
      project: "E-commerce Platform",
    },
    {
      id: 3,
      name: "Analytics Team",
      members: ["Lucas Bernard"],
      project: "Customer Analytics Dashboard",
    },
    {
      id: 4,
      name: "Design Team",
      members: ["Alice Brown"],
      project: "Internal Tools Development",
    },
  ];
  const [teams, setTeams] = useState(initialTeams);
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const totalPages = Math.ceil(teams.length / pageSize);
  const paginatedTeams = teams.slice((page - 1) * pageSize, page * pageSize);

  // Create team form
  const [showCreate, setShowCreate] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", project: "", member: "" });

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name) return;
    setTeams([
      {
        id: teams.length + 1,
        name: newTeam.name,
        members: newTeam.member ? [newTeam.member] : [],
        project: newTeam.project,
      },
      ...teams,
    ]);
    setNewTeam({ name: "", project: "", member: "" });
    setShowCreate(false);
    setPage(1);
  };

  // Add member to a team
  const [addMemberId, setAddMemberId] = useState<number | null>(null);
  const [memberName, setMemberName] = useState("");
  const handleAddMember = (teamId: number) => {
    setTeams(
      teams.map((team) =>
        team.id === teamId && memberName && !team.members.includes(memberName)
          ? { ...team, members: [...team.members, memberName] }
          : team
      )
    );
    setAddMemberId(null);
    setMemberName("");
  };
  const handleRemoveMember = (teamId: number, member: string) => {
    setTeams(
      teams.map((team) =>
        team.id === teamId
          ? { ...team, members: team.members.filter((m) => m !== member) }
          : team
      )
    );
  };


  // destroy a team
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);
  const handleDestroyTeam = (teamId: number) => {
  setTeams(teams.filter((team) => team.id !== teamId));
};


  // Assign project to a team
  const [assignProjectId, setAssignProjectId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState("");
  const handleAssignProject = (teamId: number) => {
    setTeams(
      teams.map((team) =>
        team.id === teamId && projectName
          ? { ...team, project: projectName }
          : team
      )
    );
    setAssignProjectId(null);
    setProjectName("");
  };

  // For suggestions
  const availableStudents = [
    "Sophie Laurent",
    "Marie Dubois",
    "Pierre Martin",
    "Lucas Bernard",
  ];
  const availableProjects = [
    "E-commerce Platform Redesign",
    "Customer Analytics Dashboard",
    "Mobile App Development",
    "Internal Tools Optimization",
    "Mobile App Redesign",
    "E-commerce Platform",
    "Customer Analytics Dashboard",
    "Internal Tools Development",
  ];

  return (
    <DashboardLayout requiredRole="company">
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
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-lg rounded-xl">
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
                  placeholder="Initial Member (optional)"
                  value={newTeam.member}
                  onChange={(v) => setNewTeam({ ...newTeam, member: v })}
                  suggestions={availableStudents}
                />
                <AutocompleteInput
                  placeholder="Assign Project (optional)"
                  value={newTeam.project}
                  onChange={(v) => setNewTeam({ ...newTeam, project: v })}
                  suggestions={availableProjects}
                />
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Create
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Teams List */}
        <div className="space-y-4">
          {paginatedTeams.map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {team.name}
                    </h3>
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Members:</strong>
                      {team.members.length > 0 ? (
                        <ul className="inline ml-2">
                          {team.members.map((member) => (
                            <li key={member} className="inline-block mr-2">
                              {member}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="ml-1 px-1 py-0.5 text-xs text-red-600 hover:bg-red-100"
                                onClick={() =>
                                  handleRemoveMember(team.id, member)
                                }
                              >
                                ×
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="ml-2">No members yet</span>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Project:</strong>{" "}
                      {team.project || "No project assigned"}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {/* Add Member */}
                    {addMemberId === team.id ? (
                      <div className="flex space-x-2">
                        <AutocompleteInput
                          placeholder="Member Name"
                          value={memberName}
                          onChange={setMemberName}
                          suggestions={availableStudents.filter(
                            (s) => !team.members.includes(s)
                          )}
                          className="w-32"
                        />
                        <Button
                          size="sm"
                          className="bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => handleAddMember(team.id)}
                        >
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          onClick={() => setAddMemberId(null)}
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
                    {/* Assign Project */}
                    {assignProjectId === team.id ? (
                      <div className="flex space-x-2">
                        <AutocompleteInput
                          placeholder="Project Name"
                          value={projectName}
                          onChange={setProjectName}
                          suggestions={availableProjects}
                          className="w-32"
                        />
                        <Button
                          size="sm"
                          className="bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => handleAssignProject(team.id)}
                        >
                          Assign
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          onClick={() => setAssignProjectId(null)}
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
                        Assign Project
                      </Button>
                    )}

                    
{confirmingDelete === team.id ? (
  <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
    <p className="text-sm font-medium text-red-800">Destroy Team?</p>
    <p className="text-xs text-red-600">
      Are you sure you want to Remove the <strong>{team.name}</strong> ? This action cannot be undone.
    </p>
    <div className="flex space-x-2">
      <Button
        size="sm"
        variant="outline"
        className="text-xs h-7 bg-transparent"
        onClick={() => setConfirmingDelete(null)}
      >
        Cancel
      </Button>
      <Button
        size="sm"
        className="bg-red-600 hover:bg-red-700 text-xs h-7"
        onClick={() => {
          handleDestroyTeam(team.id);
          setConfirmingDelete(null);
        }}
      >
        Yes, Remove
      </Button>
    </div>
  </div>
) : (
  <Button
    size="sm"
    variant="outline"
    className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
    onClick={() => setConfirmingDelete(team.id)}
  >
    Remove Team
  </Button>
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
        {/* Team Management Tips */}
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
    </DashboardLayout>
  );
}

function AutocompleteInput({
  value,
  onChange,
  suggestions,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
}) {
  const [show, setShow] = useState(false);
  const [input, setInput] = useState(value || "");
  useEffect(() => {
    setInput(value || "");
  }, [value]);
  const filtered = suggestions.filter(
    (s: string) => s.toLowerCase().includes(input.toLowerCase()) && s !== value
  );
  return (
    <div className={`relative ${className}`}>
      <Input
        value={input}
        placeholder={placeholder}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setInput(e.target.value);
          onChange(e.target.value);
          setShow(true);
        }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 100)}
      />
      {show && filtered.length > 0 && (
        <div className="absolute left-0 right-0 bg-white border rounded shadow z-10 max-h-40 overflow-y-auto">
          {filtered.map((s: string) => (
            <div
              key={s}
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
