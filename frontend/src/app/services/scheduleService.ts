import { taskApi } from "@/api/axios";
import { DashboardResponse, Task } from "@/types/entities"; // ✅ updated type
import { cookies } from "next/headers";

export const fetchSchedules = async (
  page: number = 0,
  size: number = 10
): Promise<DashboardResponse> => {
  const accessToken = (await cookies()).get("access_token")?.value;

  try {
    const response = await taskApi.get<DashboardResponse>("/schedules", {
      params: { page, size },
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch dashboard:", error);

    // ✅ fallback mock data
    return {
      milestones: [
        {
          id: 4,
          title: "other Complete",
          description: "First working prototype",
          status: "PENDING",
          dueDate: "2025-09-15T00:00:00",
          createdAt: "2025-08-12T09:34:53.221",
        },
      ],
      tasks: {
        content: [
          {
            scheduleId: 1,
            userId: 7,
            title: "Weekly Report",
            description: "Finish feature X",
            dueDate: "2025-08-31T00:00:00.000+00:00",
            status: "PENDING",
            createdAt: "2025-08-16T16:45:10.595+00:00",
          },
        ],
        pageable: {
          pageNumber: 0,
          pageSize: 10,
          sort: {
            sorted: false,
            empty: true,
            unsorted: true,
          },
          offset: 0,
          paged: true,
          unpaged: false,
        },
        last: true,
        totalPages: 1,
        totalElements: 1,
        size: 10,
        number: 0,
        sort: {
          sorted: false,
          empty: true,
          unsorted: true,
        },
        first: true,
        numberOfElements: 1,
        empty: false,
      },
    };
  }
};

export const updateScheduleStatus = async (
  scheduleId: number,
  status: "PENDING" | "UPCOMING" | "COMPLETED"
): Promise<Task> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  try {
    const response = await taskApi.patch<Task>(
      `/schedules/${scheduleId}/status`,
      {},
      {
        params: { newStatus: status },
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update schedule status:", error);
    throw error;
  }
};

export const deleteSchedule = async (scheduleId: number): Promise<void> => {
  const accessToken = (await cookies()).get("access_token")?.value;

  try {
    await taskApi.delete(`/schedules/${scheduleId}`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
  } catch (error) {
    console.error("Failed to delete schedule:", error);
    throw error;
  }
};

export const createSchedule = async (
  scheduleData: Omit<Task, "scheduleId" | "createdAt">
): Promise<Task> => {
  const accessToken = (await cookies()).get("access_token")?.value;

  try {
    const response = await taskApi.post<Task>("/schedules", scheduleData, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create schedule:", error);
    throw error;
  }
};
