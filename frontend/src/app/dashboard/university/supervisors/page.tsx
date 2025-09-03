// app/dashboard/university/supervisors/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import SupervisorsPageClient from "./SupervisorsPageClient";
import {
  fetchSupervisors,
  searchSupervisors,
  filterSupervisors,
  fetchSupervisorStats,
  createSupervisor,
  updateSupervisor,
  Supervisor,
  Student,
  SupervisorFormData,
  SupervisorStats,
} from "@/app/services/supervisorService";
import { revalidatePath } from "next/cache";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId) };
}

// Transform API data to client format (server-side only)
const transformSupervisorData = (supervisors: Supervisor[]) => {
  return supervisors.map((supervisor) => ({
    id: supervisor.id,
    firstName: supervisor.firstName,
    lastName: supervisor.lastName,
    email: supervisor.email,
    phoneNumber: supervisor.phoneNumber,
    address: supervisor.address,
    gender: supervisor.gender,
    fieldOfStudy: supervisor.fieldOfStudy,
    institution: supervisor.institution,
    bio: supervisor.bio,
    linkedInUrl: supervisor.linkedInUrl,
    githubUrl: supervisor.githubUrl,
    profilePicUrl: supervisor.profilePicUrl,
    userStatus: supervisor.userStatus,
    supervisedInterns: supervisor.supervisedInterns,
    assignedStudents: supervisor.supervisedInterns.length,
  }));
};

export default async function SupervisorsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    field?: string;
  };
}) {
  const { userId } = await getUser();
  const searchParamsAwaited = await searchParams;
  const page = parseInt(searchParamsAwaited.page || "1") - 1;
  const pageSize = 4;
  const search = searchParamsAwaited.search || "";
  const status = searchParamsAwaited.status || "";
  const field = searchParamsAwaited.field || "";

  let supervisorData;
  let fieldsList: string[] = [];
  let students: Student[] = [];

  try {
    // Fetch fields list
    const allSupervisors = await fetchSupervisors(0, 1000);
    fieldsList = Array.from(
      new Set(allSupervisors.content.map((s) => s.fieldOfStudy))
    ).sort();

    // Fetch students
    students = allSupervisors.content.flatMap((supervisor) =>
      supervisor.supervisedInterns.map((student) => ({
        ...student,
        supervisorId: supervisor.id,
      }))
    );

    // Use separate endpoints based on the parameters
    if (search) {
      supervisorData = await searchSupervisors(search, page, pageSize);
    } else if (status || field) {
      supervisorData = await filterSupervisors(status, field, page, pageSize);
    } else {
      supervisorData = await fetchSupervisors(page, pageSize);
    }
  } catch (error: any) {
    console.error("Failed to fetch supervisors data:", error);
    if (error.message === "Unauthorized access. Please log in again.") {
      redirect("/login");
    }
    supervisorData = {
      content: [],
      totalPages: 0,
      totalElements: 0,
      currentPage: 0,
    };
  }

  let statsData: SupervisorStats;
  try {
    statsData = await fetchSupervisorStats();
  } catch (error: any) {
    console.error("Failed to fetch supervisor stats:", error);
    statsData = {
      totalSupervisors: 0,
      activeSupervisors: 0,
      pendingSupervisors: 0,
    };
  }

  // Server action for fetching data
  const handleFetchData = async (
    page: number,
    size: number,
    search: string,
    status: string,
    field: string
  ) => {
    "use server";
    try {
      let data;
      if (search) {
        data = await searchSupervisors(search, page, size);
      } else if (status || field) {
        data = await filterSupervisors(status, field, page, size);
      } else {
        data = await fetchSupervisors(page, size);
      }

      return {
        supervisors: transformSupervisorData(data.content),
        students: data.content.flatMap((supervisor) =>
          supervisor.supervisedInterns.map((student) => ({
            ...student,
            supervisorId: supervisor.id,
          }))
        ),
        stats: await fetchSupervisorStats(),
        pagination: {
          currentPage: data.currentPage + 1,
          totalPages: data.totalPages,
          totalItems: data.totalElements,
          pageSize: size,
        },
      };
    } catch (error: any) {
      console.error("handleFetchData error:", error);
      return {
        supervisors: [],
        students: [],
        stats: {
          totalSupervisors: 0,
          activeSupervisors: 0,
          pendingSupervisors: 0,
        },
        pagination: { currentPage: 1, totalPages: 0, totalItems: 0, pageSize },
        error: error.message || "Failed to fetch supervisors data",
      };
    }
  };

  // Server action for adding supervisor
  const handleAddSupervisor = async (supervisor: SupervisorFormData) => {
    "use server";
    try {
      const addedSupervisor = await createSupervisor(supervisor);
      revalidatePath("/dashboard/university/supervisors");
      return { supervisor: addedSupervisor, success: true };
    } catch (error: any) {
      console.error("handleAddSupervisor error:", error);
      return {
        success: false,
        error: error.message || "Failed to add supervisor",
      };
    }
  };

  // Server action for updating supervisor
  const handleEditSupervisor = async (supervisor: Supervisor) => {
    "use server";
    try {
      const updatedSupervisor = await updateSupervisor(supervisor);
      revalidatePath("/dashboard/university/supervisors");
      return { supervisor: updatedSupervisor, success: true };
    } catch (error: any) {
      console.error("handleEditSupervisor error:", error);
      return {
        success: false,
        error: error.message || "Failed to edit supervisor",
      };
    }
  };

  return (
    <DashboardLayout requiredRole="university">
      <SupervisorsPageClient
        initialSupervisors={transformSupervisorData(supervisorData.content)}
        initialStudents={students}
        initialStats={statsData}
        pagination={{
          currentPage: supervisorData.currentPage + 1,
          totalPages: supervisorData.totalPages,
          totalItems: supervisorData.totalElements,
          pageSize: pageSize,
        }}
        searchParams={{ search, status, field }}
        fieldsList={fieldsList}
        userId={userId}
        onFetchData={handleFetchData}
        onAddSupervisor={handleAddSupervisor}
        onEditSupervisor={handleEditSupervisor}
      />
    </DashboardLayout>
  );
}
