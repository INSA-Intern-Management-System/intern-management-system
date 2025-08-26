import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import ProjectClient from "./ProjectClient";
import {
  fetchProjects,
  fetchProjectStats,
  createProject,
  updateProject,
  deleteProject,
  searchProjects,
  createMilestone,
  fetchMilestones,
  updateMilestoneStatus,
  deleteMilestone,
} from "@/app/services/projectService";
import { revalidatePath } from "next/cache";
import { Project } from "@/types/project";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId) };
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
  const pageSize = 3;

  // ✅ CREATE PROJECT WITH MILESTONES
  async function handleCreateProject(formData: FormData) {
    "use server";
    try {
      const milestonesInput = (formData.get("milestones") as string)
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m);

      const projectData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        status: (formData.get("status") as string).toUpperCase() as Project["status"],
        startDate: formData.get("startDate") as string,
        endDate: formData.get("endDate") as string,
        budget: parseFloat(formData.get("budget") as string) || 0,
        technologies: (formData.get("technologies") as string)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      // Create project
      const createdProject = await createProject(projectData);

      // ✅ Create milestones with projectId included in body
      const milestones = await Promise.all(
        milestonesInput.map(async (milestone) => {
          const milestoneData = await createMilestone({
            projectId: createdProject.id,
            title: milestone,
            description: milestone,
            status: "IN_PROGRESS",
            dueDate: projectData.endDate,
          });
          return {
            id: milestoneData.id,
            name: milestoneData.title,
            completed: milestoneData.status === "COMPLETED",
            dueDate: milestoneData.dueDate,
            description: milestoneData.description,
          };
        })
      );

      revalidatePath("/dashboard/company/projects");
      return { project: { ...createdProject, milestones, teamMembers: [], teams: [], progress: 0 } };
    } catch (error) {
      console.error("Failed to create project:", error);
      return { error: "Failed to create project" };
    }
  }

  // ✅ UPDATE PROJECT
  async function handleUpdateProject(id: number, data: Project) {
    "use server";
    try {
      const updatedProject = await updateProject(id, {
        description: data.description,
        status: data.status?.toUpperCase() as Project["status"],
      });

      if (data.milestones) {
        await Promise.all(
          data.milestones.map(async (milestone) => {
            if (milestone.id) {
              await updateMilestoneStatus(
                milestone.id,
                milestone.completed ? "COMPLETED" : "IN_PROGRESS"
              );
            }
          })
        );
      }

      const updatedMilestones = await fetchMilestones(id);

      revalidatePath("/dashboard/company/projects");
      return {
        project: {
          ...updatedProject,
          milestones: updatedMilestones.map((m) => ({
            id: m.id,
            name: m.title || m.name,
            completed: m.status === "COMPLETED",
            dueDate: m.dueDate,
            description: m.description,
          })),
          teamMembers: data.teamMembers || [],
          teams: data.teams || [],
          progress: updatedMilestones.length
            ? Math.round(
                (updatedMilestones.filter((m) => m.status === "COMPLETED").length /
                  updatedMilestones.length) *
                  100
              )
            : 0,
        },
      };
    } catch (error) {
      console.error("Failed to update project:", error);
      return { error: "Failed to update project" };
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

  // ✅ CREATE MILESTONE DIRECTLY
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

      const updatedMilestones = await fetchMilestones(projectId);

      revalidatePath("/dashboard/company/projects");
      return {
        project: {
          id: projectId,
          milestones: updatedMilestones.map((m) => ({
            id: m.id,
            name: m.title || m.name,
            completed: m.status === "COMPLETED",
            dueDate: m.dueDate,
            description: m.description,
          })),
          progress: updatedMilestones.length
            ? Math.round(
                (updatedMilestones.filter((m) => m.status === "COMPLETED").length /
                  updatedMilestones.length) *
                  100
              )
            : 0,
        },
      };
    } catch (error) {
      console.error("Failed to create milestone:", error);
      return { error: "Failed to create milestone" };
    }
  }

  // ✅ DELETE MILESTONE
  async function handleDeleteMilestone(projectId: number, milestoneId: number) {
    "use server";
    try {
      await deleteMilestone(milestoneId);
      const updatedMilestones = await fetchMilestones(projectId);

      revalidatePath("/dashboard/company/projects");
      return {
        project: {
          id: projectId,
          milestones: updatedMilestones.map((m) => ({
            id: m.id,
            name: m.title || m.name,
            completed: m.status === "COMPLETED",
            dueDate: m.dueDate,
            description: m.description,
          })),
          progress: updatedMilestones.length
            ? Math.round(
                (updatedMilestones.filter((m) => m.status === "COMPLETED").length /
                  updatedMilestones.length) *
                  100
              )
            : 0,
        },
      };
    } catch (error) {
      console.error("Failed to delete milestone:", error);
      return { error: "Failed to delete milestone" };
    }
  }

  // ✅ FETCH PROJECTS
  async function handleFetchData(page: number, size: number, search: string, status: string) {
    "use server";
    try {
      const projectsData = search.trim()
        ? await searchProjects(search, page - 1, size)
        : await fetchProjects(page - 1, size);

      const projects = await Promise.all(
        projectsData.content.map(async (item) => {
          const milestones = await fetchMilestones(item.project.id);
          return {
            ...item.project,
            teams: item.teams,
            teamMembers: item.teamMembers,
            milestones: milestones.map((m) => ({
              id: m.id,
              name: m.title || m.name,
              completed: m.status === "COMPLETED",
              dueDate: m.dueDate,
              description: m.description,
            })),
            progress: milestones.length
              ? Math.round(
                  (milestones.filter((m) => m.status === "COMPLETED").length / milestones.length) *
                    100
                )
              : 0,
          };
        })
      );

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
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
        onCreateMilestone={handleCreateMilestone}
        onDeleteMilestone={handleDeleteMilestone}
        onFetchData={handleFetchData}
      />
    </DashboardLayout>
  );
}
