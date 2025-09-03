import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import UsersClient from "./UserClient";
import {
  fetchUsers,
  searchUsers,
  filterUsersByStatus,
  filterUsersByRole,
  createUser,
  deleteUser,
  resetPassword,
  User
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
      usersData = await searchUsers(search, page, 5, accessToken);
    } else if (status !== "all") {
      usersData = await filterUsersByStatus(status, page, 5, accessToken);
    } else if (role !== "all") {
      usersData = await filterUsersByRole(role, page, 5, accessToken);
    } else {
      usersData = await fetchUsers(page, 5, accessToken);
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

  const usersContent = usersData?.users || [];

  return (
    <DashboardLayout requiredRole="admin">
      <UsersClient
        initialUsers={usersContent}
        initialPagination={{
          currentPage: usersData?.currentPage || 0,
          totalPages: usersData?.totalPages || 0,
          totalItems: usersData?.totalElements || usersData?.totalUser || 0,
          pageSize: 5,
        }}
        onCreateUser={handleCreateUser}
        onDeleteUser={handleDeleteUser}
        onResetPassword={handleResetPassword}
        searchParams={searchParamsAwaited}
      />
    </DashboardLayout>
  );
}