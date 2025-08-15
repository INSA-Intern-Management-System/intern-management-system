"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit,
  Plus,
  Shield,
  User,
  Building2,
  University,
  GraduationCap,
  Settings,
  Eye,
  Users,
  FileText,
  MessageSquare,
  Calendar,
  Bell,
  Star,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/layout/dashboard-layout";

export default function RoleManagement() {
  const [user, setUser] = useState<any>(null);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "admin") {
        router.push("/login");
        return;
      }
      setUser(parsedUser);
    } else {
      router.push("/login");
    }
  }, [router]);

  if (!user) return null;

  // Mock data
  const roles = [
    {
      id: 1,
      name: "student",
      displayName: "Student",
      description: "Students applying for internships and submitting reports",
      userCount: 89,
      permissions: {
        dashboard: { view: true, edit: false, delete: false },
        applications: { view: true, edit: true, delete: true },
        reports: { view: true, edit: true, delete: false },
        messages: { view: true, edit: true, delete: false },
        leave: { view: true, edit: true, delete: true },
        notifications: { view: true, edit: false, delete: false },
        settings: { view: true, edit: true, delete: false },
      },
      features: [
        "Apply for internships",
        "Submit weekly reports",
        "Request leave",
        "View feedback",
        "Message supervisors",
        "Track progress",
      ],
    },
    {
      id: 2,
      name: "company",
      displayName: "Company",
      description: "Companies offering internships and managing interns",
      userCount: 23,
      permissions: {
        dashboard: { view: true, edit: false, delete: false },
        applications: { view: true, edit: true, delete: false },
        interns: { view: true, edit: true, delete: false },
        projects: { view: true, edit: true, delete: true },
        reports: { view: true, edit: false, delete: false },
        messages: { view: true, edit: true, delete: false },
        leave: { view: true, edit: true, delete: false },
        notifications: { view: true, edit: false, delete: false },
        settings: { view: true, edit: true, delete: false },
      },
      features: [
        "Review applications",
        "Manage interns",
        "Create projects",
        "Evaluate reports",
        "Approve leave requests",
        "Message students",
      ],
    },
    {
      id: 3,
      name: "university",
      displayName: "University",
      description:
        "University staff supervising students and managing evaluations",
      userCount: 12,
      permissions: {
        dashboard: { view: true, edit: false, delete: false },
        students: { view: true, edit: true, delete: false },
        supervisors: { view: true, edit: true, delete: true },
        performance: { view: true, edit: false, delete: false },
        evaluations: { view: true, edit: true, delete: false },
        messages: { view: true, edit: true, delete: false },
        settings: { view: true, edit: true, delete: false },
      },
      features: [
        "Assign supervisors",
        "View performance",
        "Grade internships",
        "Manage evaluations",
        "Monitor progress",
        "Generate reports",
      ],
    },
    {
      id: 4,
      name: "admin",
      displayName: "Administrator",
      description: "System administrators with full access",
      userCount: 4,
      permissions: {
        dashboard: { view: true, edit: true, delete: true },
        users: { view: true, edit: true, delete: true },
        roles: { view: true, edit: true, delete: true },
        settings: { view: true, edit: true, delete: true },
        notifications: { view: true, edit: true, delete: true },
        analytics: { view: true, edit: true, delete: true },
      },
      features: [
        "Manage users",
        "Configure roles",
        "System settings",
        "View analytics",
        "Send notifications",
        "Full system access",
      ],
    },
  ];

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case "student":
        return <GraduationCap className="h-6 w-6 text-blue-600" />;
      case "company":
        return <Building2 className="h-6 w-6 text-green-600" />;
      case "university":
        return <University className="h-6 w-6 text-purple-600" />;
      case "admin":
        return <Shield className="h-6 w-6 text-red-600" />;
      default:
        return <User className="h-6 w-6 text-gray-600" />;
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case "dashboard":
        return <Eye className="h-4 w-4" />;
      case "applications":
        return <FileText className="h-4 w-4" />;
      case "messages":
        return <MessageSquare className="h-4 w-4" />;
      case "leave":
        return <Calendar className="h-4 w-4" />;
      case "notifications":
        return <Bell className="h-4 w-4" />;
      case "users":
        return <Users className="h-4 w-4" />;
      case "settings":
        return <Settings className="h-4 w-4" />;
      case "performance":
        return <Star className="h-4 w-4" />;
      case "evaluations":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setIsEditRoleOpen(true);
  };

  return (
    <DashboardLayout userRole="admin" userName={user.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Role Management
            </h1>
            <p className="text-gray-600">
              Configure role permissions and access levels
            </p>
          </div>
          <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Define a new role with specific permissions
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="roleName" className="text-right">
                    Role Name
                  </Label>
                  <Input id="roleName" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="displayName" className="text-right">
                    Display Name
                  </Label>
                  <Input id="displayName" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea id="description" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddRoleOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setIsAddRoleOpen(false)}>
                  Create Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Role Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {role.displayName}
                    </p>
                    <p className="text-2xl font-bold">{role.userCount}</p>
                    <p className="text-xs text-gray-500">users</p>
                  </div>
                  {getRoleIcon(role.name)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Roles List */}
        <div className="space-y-6">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getRoleIcon(role.name)}
                    <div>
                      <CardTitle className="capitalize">
                        {role.displayName}
                      </CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{role.userCount} users</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRole(role)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Permissions
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Features */}
                  <div>
                    <h4 className="font-semibold mb-2">Key Features</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {role.features.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="justify-start"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <h4 className="font-semibold mb-2">Permissions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(role.permissions).map(
                        ([permission, access]) => (
                          <div
                            key={permission}
                            className="border rounded-lg p-3"
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              {getPermissionIcon(permission)}
                              <span className="font-medium capitalize">
                                {permission}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm">
                              {Object.entries(access as any).map(
                                ([action, allowed]) => (
                                  <div
                                    key={action}
                                    className="flex items-center justify-between"
                                  >
                                    <span className="capitalize">{action}</span>
                                    <Badge
                                      variant={
                                        allowed ? "default" : "secondary"
                                      }
                                      className={
                                        allowed
                                          ? "bg-green-100 text-green-800"
                                          : "bg-gray-100 text-gray-600"
                                      }
                                    >
                                      {allowed ? "Allowed" : "Denied"}
                                    </Badge>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Role Dialog */}
        <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                Edit Role Permissions - {selectedRole?.displayName}
              </DialogTitle>
              <DialogDescription>
                Configure permissions for this role
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {selectedRole && (
                <div className="space-y-4">
                  {Object.entries(selectedRole.permissions).map(
                    ([permission, access]) => (
                      <div key={permission} className="border rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          {getPermissionIcon(permission)}
                          <h4 className="font-semibold capitalize">
                            {permission}
                          </h4>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          {Object.entries(access as any).map(
                            ([action, allowed]) => (
                              <div
                                key={action}
                                className="flex items-center justify-between"
                              >
                                <Label
                                  htmlFor={`${permission}-${action}`}
                                  className="capitalize"
                                >
                                  {action}
                                </Label>
                                <Switch
                                  id={`${permission}-${action}`}
                                  checked={allowed as boolean}
                                  onCheckedChange={() => {
                                    // Handle permission change
                                  }}
                                />
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditRoleOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsEditRoleOpen(false)}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
