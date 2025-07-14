"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  Menu,
  X,
  Send,
  CheckCircle,
  Star,
  User,
  GraduationCap,
} from "lucide-react";

interface SidebarProps {
  userRole: string;
  userName: string;
  onLogout: () => void;
}

const sidebarItems = {
  student: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/student" },
    {
      icon: FileText,
      label: "Plan & Tasks",
      href: "/dashboard/student/applications",
    },
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
      icon: Calendar,
      label: "Schedules",
      href: "/dashboard/university/schedules",
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
  student: "text-blue-600",
  company: "text-green-600",
  university: "text-purple-600",
  admin: "text-red-600",
};

export function Sidebar({ userRole, userName, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const items = sidebarItems[userRole as keyof typeof sidebarItems] || [];
  const RoleIcon = roleIcons[userRole as keyof typeof roleIcons] || User;
  const roleColor =
    roleColors[userRole as keyof typeof roleColors] || "text-gray-600";

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
          isCollapsed ? "-translate-x-full md:translate-x-0 md:w-16" : "w-64",
          "md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <RoleIcon className={cn("h-8 w-8", roleColor)} />
            {!isCollapsed && (
              <div>
                <h2 className="font-semibold text-gray-900 capitalize">
                  {userRole} Portal
                </h2>
                <p className="text-sm text-gray-600">{userName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-700 hover:bg-gray-100",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {!isCollapsed && <span>{item.label}</span>}
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
              "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50",
              isCollapsed && "justify-center"
            )}
            onClick={onLogout}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}
