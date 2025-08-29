import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import CompanyTeamsClient from "./teamClient";
import { fetchTeams, fetchProjects, addMemberByEmail, createTeam, addMember, removeMember, assignProject, deleteTeam } from "@/app/services/teamService";

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

function mapTeams(rawTeams: any[]): FrontendTeam[] {
  return rawTeams.map((t) => ({
    id: t.teams?.id || 0,
    name: t.teams?.name || "Unnamed Team",
    project: t.project ? t.project.name || `Project ${t.project.id || 'unknown'}` : "",
    members: t.teamMembers?.map((tm: any) => ({
      name: tm.fullName || `User ${tm.memberId || 'unknown'}`,
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
  const { userId, accessToken } = await getUser();

  const searchParamsAwaited = await searchParams;
  const page = parseInt(searchParamsAwaited.page || "0");

  let teamsData;
  try {
    teamsData = await fetchTeams(page, 3, accessToken);
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
      size: 3,
    };
  }

  let projectsData;
  try {
    projectsData = await fetchProjects(0, 100, accessToken);
  } catch (error: any) {
    console.error("Failed to fetch projects:", error);
    if (error.message === "Unauthorized access. Please log in again.") {
      redirect("/login");
    }
    projectsData = {
      content: [],
      number: 0,
      totalPages: 0,
      totalElements: 0,
      size: 100,
    };
  }

  const availableProjects: AvailableProject[] = projectsData.content
    .filter((p) => p.id != null)
    .map((p) => ({
      id: p.id,
      name: p.name || `Project ${p.id}`,
    }));

  const initialTeams = mapTeams(teamsData.content);

  const handleCreateTeam = async (data: { name: string; projectId: number | null; memberEmail?: string }) => {
    "use server";
    try {
      await createTeam({ name: data.name, projectId: data.projectId, memberEmail: data.memberEmail, managerId: Number(userId) }, accessToken);
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/company/teams");
      return { success: true };
    } catch (error: any) {
      console.error("handleCreateTeam error:", error);
      return { success: false, error: error.message || "Failed to create team" };
    }
  };

  const handleAddMember = async (data: { teamId: number; memberId: number; role: string }) => {
    "use server";
    try {
      await addMember(data, accessToken);
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/company/teams");
      return { success: true };
    } catch (error: any) {
      console.error("handleAddMember error:", error);
      return { success: false, error: error.message || "Failed to add member" };
    }
  };

  const handleAddMemberByEmail = async (email: string) => {
    "use server";
    try {
      const response = await addMemberByEmail(email, accessToken);
      return { success: true, user: { id: response.userId, fullName: response.fullName } };
    } catch (error: any) {
      console.error("handleAddMemberByEmail error:", error);
      return { success: false, error: error.message || "Failed to add member by email", user: null };
    }
  };

  const handleRemoveMember = async (teamMemberId: number) => {
    "use server";
    try {
      await removeMember(teamMemberId, accessToken);
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/company/teams");
      return { success: true };
    } catch (error: any) {
      console.error("handleRemoveMember error:", error);
      return { success: false, error: error.message || "Failed to remove member" };
    }
  };

  const handleAssignProject = async (teamId: number, projectId: number) => {
    "use server";
    try {
      await assignProject(teamId, projectId, accessToken);
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/company/teams");
      return { success: true };
    } catch (error: any) {
      console.error("handleAssignProject error:", error);
      return { success: false, error: error.message || "Failed to assign project" };
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    "use server";
    try {
      await deleteTeam(teamId, accessToken);
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/company/teams");
      return { success: true };
    } catch (error: any) {
      console.error("handleDeleteTeam error:", error);
      return { success: false, error: error.message || "Failed to delete team" };
    }
  };

  const handleFetchData = async (page: number, size: number, search: string, hasProject: string) => {
    "use server";
    try {
      const teamsData = await fetchTeams(page, size, accessToken);
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
          totalPages: Math.ceil(teams.length / size) || 1,
          totalItems: teams.length,
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
        managerId={Number(userId)}
        onCreateTeam={handleCreateTeam}
        onAddMember={handleAddMember}
        onAddMemberByEmail={handleAddMemberByEmail}
        onRemoveMember={handleRemoveMember}
        onAssignProject={handleAssignProject}
        onDeleteTeam={handleDeleteTeam}
        onFetchData={handleFetchData}
      />
    </DashboardLayout>
  );
}