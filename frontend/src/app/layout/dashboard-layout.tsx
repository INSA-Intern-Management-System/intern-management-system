import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { User } from "@/types/entities";
import { Sidebar } from "@/components/sidebar";
import { api } from "@/api/axios";
import { University } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole?: string;
}

async function getUser(): Promise<User> {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  try {
    const response = await api.get<User>(`/users/me`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    redirect("/login");
  }
}

export default async function DashboardLayout({
  children,
  requiredRole,
}: DashboardLayoutProps) {
  const user = await getUser();
  let userRole = user.roles.name.toLowerCase();
  if (userRole === "admin") {
    userRole = "admin";}
  else if (userRole === "hr" || userRole === "project_manager") {
    userRole="company"
  }
  else if (userRole === "supervisor") {
    userRole="University"
  }
  else if (userRole === "student") {
    userRole="student"
  }

  if (requiredRole && userRole !== requiredRole.toLowerCase()) {
    redirect(`/dashboard/${userRole}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        userRole={userRole}
        userName={`${user.firstName} ${user.lastName}`.trim()}
      />
      <div className="lg:ml-64 transition-all duration-300">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
