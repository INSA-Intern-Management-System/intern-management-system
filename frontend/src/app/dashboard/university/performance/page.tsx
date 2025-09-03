import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import PerformanceClient from "./PerformanceClient";
import {
  fetchPerformanceData,
  fetchPerformanceStats,
  filterPerformanceBySupervisor,
  searchPerformance,
  fetchSupervisorsList,
  PerformanceUser,
  PerformanceStats,
} from "@/app/services/performanceService";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId) };
}

// Helper function to calculate overall score (server-side only)
const calculateOverallScore = (user: PerformanceUser): number => {
  if (user.performanceLabel === "N/A") return 0;

  const attendanceWeight = 0.3;
  const reportsWeight = 0.2;
  const ratingWeight = 0.3;
  const gradeWeight = 0.2;

  const attendanceScore = user.attendance;
  const reportsScore = Math.min((user.totalReports / 8) * 100, 100);
  const ratingScore = (user.lastRating / 5) * 100;

  const gradeMap: { [key: string]: number } = {
    "A+": 100,
    A: 95,
    "B+": 85,
    B: 80,
    "C+": 75,
    C: 70,
    D: 65,
    F: 50,
  };
  const gradeScore = gradeMap[user.grade] || 0;

  return Math.round(
    attendanceScore * attendanceWeight +
      reportsScore * reportsWeight +
      ratingScore * ratingWeight +
      gradeScore * gradeWeight
  );
};

// Transform API data to client format (server-side only)
const transformUserData = (users: PerformanceUser[]) => {
  return users.map((user) => ({
    id: user.userId,
    student: user.fullName,
    supervisor: user.supervisorName,
    attendance: user.attendance,
    weeklyReports: {
      submitted: user.totalReports,
      total: 8,
    },
    companyFeedback: user.lastRating,
    academicGrade: user.grade,
    overallScore: calculateOverallScore(user),
    trend: "stable",
    lastUpdate:
      user.lastReviewTime !== "N/A" ? user.lastReviewTime.split("T")[0] : "N/A",
    performanceLabel: user.performanceLabel,
    lastReviewFeedback: user.lastReviewFeedback,
  }));
};

export default async function PerformancePage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; supervisor?: string };
}) {
  const { userId } = await getUser();
  const searchParamsAwaited = await searchParams;
  const page = parseInt(searchParamsAwaited.page || "1") - 1;
  const pageSize = 3;
  const search = searchParamsAwaited.search || "";
  const supervisor = searchParamsAwaited.supervisor || "all";

  let performanceData;
  let supervisorsList: any[] = [];

  try {
    // Fetch supervisors list
    supervisorsList = await fetchSupervisorsList();

    // Use separate endpoints based on the parameters
    if (search) {
      performanceData = await searchPerformance(search, page, pageSize);
    } else if (supervisor !== "all") {
      performanceData = await filterPerformanceBySupervisor(
        supervisor,
        page,
        pageSize
      );
    } else {
      performanceData = await fetchPerformanceData(page, pageSize);
    }
  } catch (error: any) {
    console.error("Failed to fetch performance data:", error);
    if (error.message === "Unauthorized access. Please log in again.") {
      redirect("/login");
    }
    performanceData = {
      users: [],
      pageNumber: 0,
      pageSize: pageSize,
      totalElements: 0,
      totalPages: 0,
    };
  }

  let statsData;
  try {
    statsData = await fetchPerformanceStats();
  } catch (error: any) {
    console.error("Failed to fetch performance stats:", error);
    statsData = {
      totalReports: 0,
      averageRating: 0,
      score: 0,
      attendance: 0,
    };
  }

  // Server action for fetching data with proper endpoint selection
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
        data = await searchPerformance(search, page, size);
      } else if (supervisor !== "all") {
        data = await filterPerformanceBySupervisor(supervisor, page, size);
      } else {
        data = await fetchPerformanceData(page, size);
      }

      return {
        users: transformUserData(data.users),
        stats: await fetchPerformanceStats(),
        pagination: {
          currentPage: data.pageNumber + 1,
          totalPages: data.totalPages,
          totalItems: data.totalElements,
          pageSize: data.pageSize,
        },
      };
    } catch (error: any) {
      console.error("handleFetchData error:", error);
      return {
        users: [],
        stats: { totalReports: 0, averageRating: 0, score: 0, attendance: 0 },
        pagination: { currentPage: 1, totalPages: 0, totalItems: 0, pageSize },
        error: error.message || "Failed to fetch performance data",
      };
    }
  };

  return (
    <DashboardLayout requiredRole="university">
      <PerformanceClient
        initialUsers={transformUserData(performanceData.users)}
        initialStats={statsData}
        pagination={{
          currentPage: performanceData.pageNumber + 1,
          totalPages: performanceData.totalPages,
          totalItems: performanceData.totalElements,
          pageSize: performanceData.pageSize,
        }}
        searchParams={{ search, supervisor }}
        supervisorsList={supervisorsList}
        userId={userId}
        onFetchData={handleFetchData}
      />
    </DashboardLayout>
  );
}
