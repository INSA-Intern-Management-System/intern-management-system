"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function DashboardLayout({
  children,
  requiredRole,
}: DashboardLayoutProps) {
  interface User {
    name: string;
    role: string;
  }

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem(
      "user",
      JSON.stringify({ name: "Company User", role: "student" })
    );

    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (requiredRole && parsedUser.role !== requiredRole) {
        router.push("/login");
        return;
      }
      setUser(parsedUser);
    } else {
      router.push("/login");
    }
    setLoading(false);
  }, [router, requiredRole]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        userRole={user.role}
        userName={user.name}
        onLogout={handleLogout}
      />
      <div className="md:ml-64 transition-all duration-300">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
