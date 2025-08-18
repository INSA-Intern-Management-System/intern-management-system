"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logout } from "@/app/services/authService";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Calendar,
  Bell,
  Users,
  Building2,
  University,
  Shield,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle,
  Star,
  User,
  GraduationCap,
} from "lucide-react";

interface SidebarProps {
  userRole: string;
  userName: string;
  userEmail?: string;
}

const sidebarItems = {
  student: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/student" },
    { icon: FileText, label: "Plan & Tasks", href: "/dashboard/student/plans" },
    { icon: Send, label: "Reports", href: "/dashboard/student/reports" },
    {
      icon: MessageSquare,
      label: "Messages",
      href: "/dashboard/student/messages",
    },
    {
      icon: Calendar,
      label: "Leave Requests",
      href: "/dashboard/student/leave",
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/dashboard/student/notifications",
    },
    { icon: Settings, label: "Settings", href: "/dashboard/student/settings" },
  ],
  company: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/company" },
    {
      icon: FileText,
      label: "Applications",
      href: "/dashboard/company/applications",
    },
    { icon: Users, label: "Interns", href: "/dashboard/company/interns" },
    { icon: Users, label: "Teams", href: "/dashboard/company/teams" },
    { icon: Building2, label: "Projects", href: "/dashboard/company/projects" },
    { icon: CheckCircle, label: "Reports", href: "/dashboard/company/reports" },
    {
      icon: MessageSquare,
      label: "Messages",
      href: "/dashboard/company/messages",
    },
    {
      icon: Calendar,
      label: "Leave Management",
      href: "/dashboard/company/leave",
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/dashboard/company/notifications",
    },
    { icon: Settings, label: "Settings", href: "/dashboard/company/settings" },
  ],
  university: [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard/university",
    },
    {
      icon: FileText,
      label: "Applications",
      href: "/dashboard/university/applications",
    },
    { icon: Users, label: "Students", href: "/dashboard/university/students" },
    {
      icon: GraduationCap,
      label: "Supervisors",
      href: "/dashboard/university/supervisors",
    },
    {
      icon: Star,
      label: "Performance",
      href: "/dashboard/university/performance",
    },
    {
      icon: CheckCircle,
      label: "Evaluations",
      href: "/dashboard/university/evaluations",
    },
    {
      icon: MessageSquare,
      label: "Messages",
      href: "/dashboard/university/messages",
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/dashboard/university/notifications",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/dashboard/university/settings",
    },
  ],
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/admin" },
    { icon: Users, label: "User Management", href: "/dashboard/admin/users" },
    { icon: Shield, label: "Role Management", href: "/dashboard/admin/roles" },
    {
      icon: Settings,
      label: "System Settings",
      href: "/dashboard/admin/settings",
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/dashboard/admin/notifications",
    },
  ],
};

const roleIcons = {
  student: GraduationCap,
  company: Building2,
  university: University,
  admin: Shield,
};

const roleColors = {
  student: "text-blue-600 bg-blue-50",
  company: "text-green-600 bg-green-50",
  university: "text-purple-600 bg-purple-50",
  admin: "text-red-600 bg-red-50",
};

export function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      router.push("/login");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      router.push("/login");
    },
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsCollapsed(mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const items = sidebarItems[userRole as keyof typeof sidebarItems] || [];
  const RoleIcon = roleIcons[userRole as keyof typeof roleIcons] || User;
  const roleColor =
    roleColors[userRole as keyof typeof roleColors] ||
    "text-gray-600 bg-gray-50";

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
          isCollapsed ? "w-20" : "w-64",
          isCollapsed && isMobile ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Collapse Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute -right-5 lg:-right-2 top-4 z-50 flex md:hidden items-center justify-center p-1 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-100"
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        {/* Header */}
        <div
          className={cn(
            "p-4 border-b border-gray-200 flex items-center",
            isCollapsed ? "justify-center" : "space-x-3"
          )}
        >
          <div className={cn("p-2 rounded-lg", roleColor)}>
            <RoleIcon className="h-6 w-6" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h2 className="font-semibold text-gray-900 truncate capitalize">
                {userRole} Portal
              </h2>
              <p className="text-sm text-gray-600 truncate">{userName}</p>
              {userEmail && (
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard/" + userRole &&
                  pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                    {isActive && !isCollapsed && (
                      <span className="ml-auto w-1.5 h-1.5 bg-blue-700 rounded-full"></span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-gray-700 hover:bg-gray-100",
              isCollapsed && "justify-center"
            )}
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && (
              <span className="ml-2 text-sm">
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </span>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
