import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import UsersClient from "./UserClient";
import {
  fetchUsers,
  filterUsersByStatus,
  searchUsers,
  createUser,
  deleteUser,
  resetPassword,
  User,
} from "@/app/services/userService";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId), accessToken };
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    role?: string;
  };
}) {
  const { accessToken } = await getUser();

  const searchParamsAwaited = await searchParams;
  const page = parseInt(searchParamsAwaited.page || "0");
  const search = searchParamsAwaited.search || "";
  const status = searchParamsAwaited.status || "all";
  const role = searchParamsAwaited.role || "all";

  let usersData;
  try {
    if (search) {
      usersData = await searchUsers(search, page, 10, accessToken);
    } else if (status !== "all") {
      usersData = await filterUsersByStatus(status, page, 10, accessToken);
    } else {
      usersData = await fetchUsers(page, 10, accessToken);
    }
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
    if (error.message === "Unauthorized access. Please log in again.") {
      redirect("/login");
    }
    usersData = {
      users: [],
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      totalUser: 0,
      message: "",
    };
  }

  const handleCreateUser = async (userData: any) => {
    "use server";
    try {
      const result = await createUser(userData, accessToken);
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/admin/users");
      return { success: true, message: result.message, user: result.user };
    } catch (error: any) {
      console.error("handleCreateUser error:", error);
      return {
        success: false,
        error: error.message || "Failed to create user",
      };
    }
  };

  const handleDeleteUser = async (userId: number) => {
    "use server";
    try {
      const result = await deleteUser(userId, accessToken);
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/admin/users");
      return { success: true, message: result.message };
    } catch (error: any) {
      console.error("handleDeleteUser error:", error);
      return {
        success: false,
        error: error.message || "Failed to delete user",
      };
    }
  };

  const handleResetPassword = async (data: { targetUserEmail: string; newPassword: string }) => {
    "use server";
    try {
      const result = await resetPassword(data, accessToken);
      return { success: true, message: result.message };
    } catch (error: any) {
      console.error("handleResetPassword error:", error);
      return {
        success: false,
        error: error.message || "Failed to reset password",
      };
    }
  };

  const handleFetchData = async (
    page: number,
    size: number,
    search: string,
    status: string,
    role: string
  ) => {
    "use server";
    try {
      let data;
      if (search) {
        data = await searchUsers(search, page, size, accessToken);
      } else if (status !== "all") {
        data = await filterUsersByStatus(status, page, size, accessToken);
      } else {
        data = await fetchUsers(page, size, accessToken);
      }

      return {
        users: data?.users || [],
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
        users: [],
        pagination: {
          currentPage: 0,
          totalPages: 0,
          totalItems: 0,
          pageSize: size,
        },
        error: error.message || "Failed to fetch users",
      };
    }
  };

  return (
    <DashboardLayout requiredRole="admin">
      <UsersClient
        initialUsers={usersData.users || []}
        initialPagination={{
          currentPage: usersData.currentPage || 0,
          totalPages: usersData.totalPages || 0,
          totalItems: usersData.totalElements || 0,
          pageSize: 10,
        }}
        onCreateUser={handleCreateUser}
        onDeleteUser={handleDeleteUser}
        onResetPassword={handleResetPassword}
        onFetchData={handleFetchData}
      />
    </DashboardLayout>
  );
}