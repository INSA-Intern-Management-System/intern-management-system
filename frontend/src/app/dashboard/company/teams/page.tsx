import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import CompanyTeamsClient from "./teamClient";
import {
  fetchTeams,
  searchProjects,
  searchUsers,
  createTeam,
  addMember,
  removeMember,
  assignProject,
  deleteTeam,
  TeamResponseItem,
  Project,
  UserSearchResult,
  removeProjectFromTeam,
} from "@/app/services/teamService";

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

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId), accessToken };
}

function mapTeams(rawTeams: TeamResponseItem[]): FrontendTeam[] {
  return rawTeams.map((t) => ({
    id: t.teams?.id || 0,
    name: t.teams?.name || "Unnamed Team",
    project: t.project
      ? t.project.name || `Project ${t.project.id || "unknown"}`
      : "",
    members:
      t.teamMembers?.map((tm) => ({
        name: tm.fullName || `User ${tm.memberId || "unknown"}`,
        teamMemberId: tm.id || 0,
        role: tm.role || "Unknown",
      })) || [],
  }));
}

export default async function CompanyTeamsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; hasProject?: string };
}) {
  const { userId } = await getUser();

  const searchParamsAwaited = await searchParams;
  const page = parseInt(searchParamsAwaited.page || "0");

  let teamsData;
  try {
    teamsData = await fetchTeams(page, 20);
  } catch (error: any) {
    console.error("Failed to fetch teams:", error);
    if (error.message === "Unauthorized access. Please log in again.") {
      redirect("/login");
    }
    teamsData = {
      content: [],
      number: 0,
      totalPages: 0,
      totalElements: 0,
      size: 20,
    };
  }

  // Get initial projects for dropdown
  let initialProjects: Project[] = [];
  try {
    const projectsData = await searchProjects("", 0, 100);
    initialProjects = projectsData.content;
  } catch (error) {
    console.error("Failed to fetch initial projects:", error);
  }

  const availableProjects: AvailableProject[] = initialProjects
    .filter((p) => p.id != null)
    .map((p) => ({
      id: p.id,
      name: p.name || `Project ${p.id}`,
    }));

  const initialTeams = mapTeams(teamsData.content);

  const handleCreateTeam = async (data: {
    name: string;
    projectId: number | null;
    members?: { userId: number; role: string }[];
  }) => {
    "use server";
    try {
      const membersObject: Record<string, string> = {};
      if (data.members) {
        data.members.forEach((member) => {
          membersObject[member.userId.toString()] = member.role;
        });
      }

      const requestData = {
        name: data.name,
        managerId: userId,
        projectId: data.projectId,
        members: membersObject,
      };

      await createTeam(requestData);
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/company/teams");
      return { success: true };
    } catch (error: any) {
      console.error("handleCreateTeam error:", error);
      return {
        success: false,
        error: error.message || "Failed to create team",
      };
    }
  };

  const handleAddMember = async (data: {
    teamId: number;
    memberId: number;
    role: string;
  }) => {
    "use server";
    try {
      await addMember(data);
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/company/teams");
      return { success: true };
    } catch (error: any) {
      console.error("handleAddMember error:", error);
      return { success: false, error: error.message || "Failed to add member" };
    }
  };

  const handleSearchUsers = async (name: string) => {
    "use server";
    try {
      const response = await searchUsers(name, 0, 10);
      return {
        success: true,
        users: response.content.map((user) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          details: `${user.fieldOfStudy} • ${user.university}`,
        })),
      };
    } catch (error: any) {
      console.error("handleSearchUsers error:", error);
      return {
        success: false,
        error: error.message || "Failed to search users",
        users: [],
      };
    }
  };

  const handleSearchProjects = async (keyword: string) => {
    "use server";
    try {
      const response = await searchProjects(keyword, 0, 10);
      return {
        success: true,
        projects: response.content.map((project) => ({
          id: project.id,
          name: project.name,
          description: project.description,
        })),
      };
    } catch (error: any) {
      console.error("handleSearchProjects error:", error);
      return {
        success: false,
        error: error.message || "Failed to search projects",
        projects: [],
      };
    }
  };

  const handleRemoveMember = async (teamMemberId: number) => {
    "use server";
    try {
      await removeMember(teamMemberId);
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/company/teams");
      return { success: true };
    } catch (error: any) {
      console.error("handleRemoveMember error:", error);
      return {
        success: false,
        error: error.message || "Failed to remove member",
      };
    }
  };

  const handleAssignProject = async (teamId: number, projectId: number) => {
    "use server";
    try {
      await assignProject(teamId, projectId);
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/company/teams");
      return { success: true };
    } catch (error: any) {
      console.error("handleAssignProject error:", error);
      return {
        success: false,
        error: error.message || "Failed to assign project",
      };
    }
  };

  const handleRemoveProject = async (teamId: number) => {
    "use server";
    try {
      await removeProjectFromTeam(teamId);
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/company/teams");
      return { success: true };
    } catch (error: any) {
      console.error("handleRemoveProject error:", error);
      return {
        success: false,
        error: error.message || "Failed to remove project",
      };
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    "use server";
    try {
      await deleteTeam(teamId);
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/company/teams");
      return { success: true };
    } catch (error: any) {
      console.error("handleDeleteTeam error:", error);
      return {
        success: false,
        error: error.message || "Failed to delete team",
      };
    }
  };

  const handleFetchData = async (
    page: number,
    size: number,
    search: string,
    hasProject: string
  ) => {
    "use server";
    try {
      const teamsData = await fetchTeams(page, size);
      let teams = mapTeams(teamsData.content);

      if (search.trim()) {
        const s = search.toLowerCase();
        teams = teams.filter(
          (t) =>
            t.name.toLowerCase().includes(s) ||
            t.project?.toLowerCase().includes(s) ||
            t.members.some((m) => m.name.toLowerCase().includes(s))
        );
      }

      if (hasProject !== "all") {
        teams = teams.filter((t) =>
          hasProject === "with-project" ? t.project : !t.project
        );
      }

      return {
        teams,
        pagination: {
          currentPage: teamsData.number,
          totalPages: teamsData.totalPages,
          totalItems: teamsData.totalElements,
          pageSize: size,
        },
      };
    } catch (error: any) {
      console.error("handleFetchData error:", error);
      return {
        teams: [],
        pagination: {
          currentPage: 0,
          totalPages: 0,
          totalItems: 0,
          pageSize: size,
        },
        error: error.message || "Failed to fetch teams",
      };
    }
  };

  return (
    <DashboardLayout requiredRole="company">
      <CompanyTeamsClient
        initialTeams={initialTeams}
        pagination={{
          currentPage: teamsData.number,
          totalPages: teamsData.totalPages,
          totalItems: teamsData.totalElements,
          pageSize: teamsData.size,
        }}
        availableProjects={availableProjects}
        managerId={userId}
        onCreateTeam={handleCreateTeam}
        onAddMember={handleAddMember}
        onSearchUsers={handleSearchUsers}
        onSearchProjects={handleSearchProjects}
        onRemoveMember={handleRemoveMember}
        onAssignProject={handleAssignProject}
        onRemoveProject={handleRemoveProject}
        onDeleteTeam={handleDeleteTeam}
        onFetchData={handleFetchData}
      />
    </DashboardLayout>
  );
}
