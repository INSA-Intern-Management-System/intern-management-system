import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import ProjectClient from "./ProjectClient";
import {
  fetchProjects,
  fetchProjectStats,
  createProject,
  deleteProject,
  searchProjects,
  createMilestone,
  deleteMilestone,
  updateProjectAndMilestonesStatus,
} from "@/app/services/projectService";
import { revalidatePath } from "next/cache";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId) };
}

interface ProjectResponse {
  project: any;
  teams: any[];
  teamMembers: any[];
  milestones: any[];
}

export default async function CompanyProjectsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; status?: string };
}) {
  const { userId } = await getUser();
  const searchParamsAwaited = await searchParams;
  const page = parseInt(searchParamsAwaited.page || "1", 10);
  const search = searchParamsAwaited.search || "";
  const status = searchParamsAwaited.status || "all";
  const pageSize = 6; // Increased page size for better UX

  // ✅ CREATE PROJECT
  async function handleCreateProject(formData: FormData) {
    "use server";
    try {
      const projectData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        status: formData.get("status")?.toString().toUpperCase() as
          | "ACTIVE"
          | "COMPLETED"
          | "PLANNING"
          | "ONHOLD",
        startDate: formData.get("startDate") as string,
        endDate: formData.get("endDate") as string,
        budget: parseFloat(formData.get("budget") as string) || 0,
        technologies: (formData.get("technologies") as string)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const createdProject = await createProject(projectData);

      // Create milestones if provided
      const milestonesInput = (formData.get("milestones") as string)
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m);

      for (const milestone of milestonesInput) {
        await createMilestone({
          projectId: createdProject.id,
          title: milestone,
          description: milestone,
          status: "IN_PROGRESS",
          dueDate: projectData.endDate,
        });
      }

      revalidatePath("/dashboard/company/projects");
      return { success: true, project: createdProject };
    } catch (error) {
      console.error("Failed to create project:", error);
      return { error: "Failed to create project" };
    }
  }

  // ✅ UPDATE PROJECT STATUS AND MILESTONES
  async function handleUpdateProjectStatus(
    projectId: number,
    projectStatus: string,
    milestoneUpdates: Array<{
      milestoneId: number;
      status: string;
    }>
  ) {
    "use server";
    try {
      const updatedProject = await updateProjectAndMilestonesStatus(
        projectId,
        projectStatus,
        milestoneUpdates
      );

      revalidatePath("/dashboard/company/projects");
      return { success: true, project: updatedProject };
    } catch (error) {
      console.error("Failed to update project status:", error);
      return { error: "Failed to update project status" };
    }
  }

  // ✅ DELETE PROJECT
  async function handleDeleteProject(id: number) {
    "use server";
    try {
      await deleteProject(id);
      revalidatePath("/dashboard/company/projects");
      return { success: true };
    } catch (error) {
      console.error("Failed to delete project:", error);
      return { error: "Failed to delete project" };
    }
  }

  // ✅ CREATE MILESTONE
  async function handleCreateMilestone(
    projectId: number,
    milestoneData: { title: string; description: string; dueDate: string }
  ) {
    "use server";
    try {
      await createMilestone({
        projectId,
        title: milestoneData.title,
        description: milestoneData.description || milestoneData.title,
        status: "IN_PROGRESS",
        dueDate: milestoneData.dueDate,
      });

      revalidatePath("/dashboard/company/projects");
      return { success: true };
    } catch (error) {
      console.error("Failed to create milestone:", error);
      return { error: "Failed to create milestone" };
    }
  }

  // ✅ DELETE MILESTONE
  async function handleDeleteMilestone(milestoneId: number) {
    "use server";
    try {
      await deleteMilestone(milestoneId);
      revalidatePath("/dashboard/company/projects");
      return { success: true };
    } catch (error) {
      console.error("Failed to delete milestone:", error);
      return { error: "Failed to delete milestone" };
    }
  }

  // ✅ FETCH PROJECTS (OPTIMIZED)
  async function handleFetchData(
    page: number,
    size: number,
    search: string,
    status: string
  ) {
    "use server";
    try {
      const projectsData = search.trim()
        ? await searchProjects(search, page - 1, size)
        : await fetchProjects(page - 1, size);

      // Transform the response to match the expected format
      const projects = projectsData.content.map((item: ProjectResponse) => {
        const completedMilestones = item.milestones.filter(
          (m: any) => m.status === "COMPLETED"
        ).length;

        return {
          ...item.project,
          teams: item.teams,
          teamMembers: item.teamMembers,
          milestones: item.milestones.map((m: any) => ({
            id: m.id,
            name: m.title,
            completed: m.status === "COMPLETED",
            dueDate: m.dueDate,
            description: m.description,
          })),
          progress: item.milestones.length
            ? Math.round((completedMilestones / item.milestones.length) * 100)
            : 0,
        };
      });

      const statsData = await fetchProjectStats();
      return {
        projects,
        stats: statsData,
        pagination: {
          currentPage: projectsData.number + 1,
          totalPages: projectsData.totalPages,
          totalItems: projectsData.totalElements,
          pageSize: projectsData.size,
        },
      };
    } catch (error) {
      console.error("Failed to fetch data:", error);
      return {
        projects: [],
        stats: { total: 0, active: 0, completed: 0, planning: 0, onhold: 0 },
        pagination: { currentPage: 1, totalPages: 0, totalItems: 0, pageSize },
        error: "Failed to fetch data",
      };
    }
  }

  const data = await handleFetchData(page, pageSize, search, status);

  return (
    <DashboardLayout requiredRole="company">
      <ProjectClient
        initialProjects={data.projects}
        initialStats={data.stats}
        pagination={{
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          totalItems: data.pagination.totalItems,
          pageSize: data.pagination.pageSize,
        }}
        initialSearch={search}
        initialStatus={status}
        userId={userId}
        onCreateProject={handleCreateProject}
        onUpdateProjectStatus={handleUpdateProjectStatus}
        onDeleteProject={handleDeleteProject}
        onCreateMilestone={handleCreateMilestone}
        onDeleteMilestone={handleDeleteMilestone}
        onFetchData={handleFetchData}
      />
    </DashboardLayout>
  );
}
