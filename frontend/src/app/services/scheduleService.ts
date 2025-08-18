import { taskApi } from "@/api/axios";
import { PaginatedSchedules } from "@/types/entities";
import { cookies } from "next/headers";

export const fetchSchedules = async (
  page: number = 0,
  size: number = 10
): Promise<PaginatedSchedules> => {
  const accessToken = (await cookies()).get("access_token")?.value;

  try {
    const response = await taskApi.get<PaginatedSchedules>("/schedules", {
      params: { page, size },
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    // Fallback mock data
    return {
      content: [
        {
          scheduleId: 1,
          userId: 1,
          title: "Weekly Report",
          description: "Submit your weekly progress report",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: "PENDING",
          createdAt: new Date().toISOString(),
        },
      ],
      pageable: {
        pageNumber: 0,
        pageSize: size,
      },
      totalPages: 1,
      totalElements: 1,
      last: true,
      first: true,
      numberOfElements: 1,
      empty: false,
    };
  }
};
