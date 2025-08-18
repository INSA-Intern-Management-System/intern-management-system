import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { User } from "@/types/entities";
import { logout } from "@/services/authService";
import { Sidebar } from "@/components/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole?: string;
}

interface DashboardUser {
  id: string;
  name: string;
  role: string;
}

async function getUser(): Promise<User> {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    throw new Error("Missing access token or userId");
  }

  const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
    headers: {
      Cookie: `access_token=${accessToken}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
}

export async function DashboardLayout({
  children,
  requiredRole,
}: DashboardLayoutProps) {
  let user: User;
  try {
    user = await getUser();
  } catch (error) {
    console.error("Failed to fetch user:", error);
    redirect("/login");
  }

  const dashboardUser: DashboardUser = {
    id: user.id,
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    role: user.roles.name.toLowerCase(),
  };

  if (requiredRole && dashboardUser.role !== requiredRole.toLowerCase()) {
    redirect(`/dashboard/${dashboardUser.role}`);
  }

  // const handleLogout = logout();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        userRole={dashboardUser.role}
        userName={dashboardUser.name}
        // onLogout={handleLogout}
      />
      <div className="lg:ml-64 transition-all duration-300">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
