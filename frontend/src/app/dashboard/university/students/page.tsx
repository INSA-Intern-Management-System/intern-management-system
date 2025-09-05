import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import StudentsClient from "./StudentClient";
import {
  fetchStudents,
  assignSupervisor,
  searchStudents,
  filterStudentsBySupervisor,
  Student,
} from "@/app/services/studentService";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId), accessToken };
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    supervisor?: string;
  };
}) {
  const { accessToken } = await getUser();

  const searchParamsAwaited = await searchParams;
  const page = parseInt(searchParamsAwaited.page || "0");
  const search = searchParamsAwaited.search || "";
  const supervisor = searchParamsAwaited.supervisor || "all";

  console.log("Page params:", { page, search, supervisor });

  let studentsData;
  try {
    if (search) {
      studentsData = await searchStudents(search, page, 10, accessToken);
    } else if (supervisor !== "all") {
      studentsData = await filterStudentsBySupervisor(supervisor, page, 10, accessToken);
    } else {
      studentsData = await fetchStudents(page, 10, accessToken);
    }
    
    console.log("Students data received:", studentsData);
    
  } catch (error: any) {
    console.error("Failed to fetch students:", error);
    if (error.message === "Unauthorized access. Please log in again.") {
      redirect("/login");
    }
    studentsData = {
      content: [],
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
    };
  }

  const handleAssignSupervisor = async (data: {
    studentEmail: string;
    supervisorEmail: string;
  }) => {
    "use server";
    try {
      const result = await assignSupervisor(data, accessToken);
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/university/students");
      return { success: true, message: result.message };
    } catch (error: any) {
      console.error("handleAssignSupervisor error:", error);
      return {
        success: false,
        error: error.message || "Failed to assign supervisor",
      };
    }
  };

  const handleFetchData = async (
    page: number,
    size: number,
    search: string,
    supervisor: string
  ) => {
    "use server";
    try {
      let data;
      if (search) {
        data = await searchStudents(search, page, size, accessToken);
      } else if (supervisor !== "all") {
        data = await filterStudentsBySupervisor(supervisor, page, size, accessToken);
      } else {
        data = await fetchStudents(page, size, accessToken);
      }

      console.log("Handle fetch data result:", data);

      return {
        students: data?.content || [],
        pagination: {
          currentPage: data?.currentPage || 0,
          totalPages: data?.totalPages || 0,
          totalItems: data?.totalElements || 0,
          pageSize: size,
        },
      };
    } catch (error: any) {
      console.error("handleFetchData error:", error);
      return {
        students: [],
        pagination: {
          currentPage: 0,
          totalPages: 0,
          totalItems: 0,
          pageSize: size,
        },
        error: error.message || "Failed to fetch students",
      };
    }
  };

  // Safe access to content with fallback
  const studentsContent = studentsData?.content || [];
  
  console.log("Students content to render:", studentsContent.length, "students");

  // Get unique supervisors for filter with safe access
  const supervisorsList = studentsContent
    .filter((student: Student) => student.supervisor?.email)
    .map((student: Student) => student.supervisor?.email)
    .filter((email): email is string => email !== undefined && email !== null);

  console.log("Supervisors list:", supervisorsList);

  return (
    <DashboardLayout requiredRole="university">
      <StudentsClient
        initialStudents={studentsContent}
        initialPagination={{
          currentPage: studentsData?.currentPage || 0,
          totalPages: studentsData?.totalPages || 0,
          totalItems: studentsData?.totalElements || 0,
          pageSize: 10,
        }}
        initialSupervisors={supervisorsList}
        onAssignSupervisor={handleAssignSupervisor}
        onFetchData={handleFetchData}
      />
    </DashboardLayout>
  );
}



