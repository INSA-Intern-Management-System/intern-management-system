import { taskApi } from "@/api/axios";
import { Task } from "@/types/entities";
import { cookies } from "next/headers";

export const fetchTasks = async (): Promise<Task[]> => {
  const accessToken = (await cookies()).get("access_token")?.value;

  try {
    const response = await taskApi.get<Task[]>("/tasks", {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    // Fallback mock data
    return [
      {
        id: 1,
        title: "Complete Week 3 Report",
        description: "Finish and submit the week 3 report",
        due: "2024-06-10",
        status: "todo",
        priority: "high",
      },
      {
        id: 2,
        title: "Mentor Meeting",
        description: "Prepare for mentor meeting",
        due: "2024-06-12",
        status: "todo",
        priority: "medium",
      },
    ];
  }
};
