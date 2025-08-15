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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  User,
  Building2,
  University,
  GraduationCap,
  Shield,
  Eye,
  UserCheck,
  UserX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function UsersManagement() {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null); // For view/edit
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const router = useRouter();

  // Mock data with useState to allow updates
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@student.insa.fr",
      role: "student",
      organization: "INSA Lyon",
      status: "active",
      lastLogin: "2024-01-15",
      joinDate: "2023-09-01",
      internships: 2,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@student.insa.fr",
      role: "student",
      organization: "INSA Toulouse",
      status: "active",
      lastLogin: "2024-01-14",
      joinDate: "2023-09-01",
      internships: 1,
    },
    {
      id: 3,
      name: "Tech Corp",
      email: "hr@techcorp.com",
      role: "company",
      organization: "Tech Corp",
      status: "active",
      lastLogin: "2024-01-15",
      joinDate: "2023-08-15",
      internships: 5,
    },
    {
      id: 4,
      name: "Dr. Smith",
      email: "smith@insa.fr",
      role: "university",
      organization: "INSA Lyon",
      status: "active",
      lastLogin: "2024-01-15",
      joinDate: "2023-07-01",
      internships: 12,
    },
    {
      id: 5,
      name: "Innovation Labs",
      email: "contact@innovationlabs.com",
      role: "company",
      organization: "Innovation Labs",
      status: "pending",
      lastLogin: "Never",
      joinDate: "2024-01-10",
      internships: 0,
    },
    {
      id: 6,
      name: "Mike Johnson",
      email: "mike@student.insa.fr",
      role: "student",
      organization: "INSA Rennes",
      status: "inactive",
      lastLogin: "2024-01-01",
      joinDate: "2023-09-01",
      internships: 0,
    },
  ]);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    organization: "INSA",
    status: "active",
  });

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

  /** ----------------- USER ACTIONS ----------------- **/

  const handleAddUser = () => {
    const userToAdd = {
      id: Math.max(...users.map((u) => u.id)) + 1,
      ...newUser,
      lastLogin: "2024-01-01",
      joinDate: new Date().toISOString().split("T")[0],
      internships: 0,
    };
    setUsers([...users, userToAdd]);
    setNewUser({
      name: "",
      email: "",
      role: "",
      organization: "INSA",
      status: "active",
    });
    setIsAddUserOpen(false);
  };

  const handleEditUser = () => {
    setUsers(users.map((u) => (u.id === selectedUser.id ? selectedUser : u)));
    setIsEditOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  /** ----------------- FILTER & SEARCH ----------------- **/

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "student":
        return <GraduationCap className="h-4 w-4" />;
      case "company":
        return <Building2 className="h-4 w-4" />;
      case "university":
        return <University className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors: { [key: string]: string } = {
      student: "bg-blue-100 text-blue-800",
      company: "bg-green-100 text-green-800",
      university: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={roleColors[role] || "bg-gray-100 text-gray-800"}>
        <span className="flex items-center space-x-1">
          {getRoleIcon(role)}
          <span className="capitalize">{role}</span>
        </span>
      </Badge>
    );
  };

  /** ----------------- RETURN JSX ----------------- **/

  return (
    <DashboardLayout requiredRole="admin" >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-gray-600">
              Manage system users and their access
            </p>
          </div>
          {/* Add User Dialog */}
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-blue-50 to-indigo-50">
              <DialogHeader className="">
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account in the system
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="items-center gap-4">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="items-center gap-4">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>
                <div className="items-center gap-4">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) =>
                      setNewUser((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-200">
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="items-center gap-4">
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    value={newUser.organization}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        organization: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddUserOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddUser} className="bg-black text-white">Create User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Users
                  </p>
                  <p className="text-2xl font-bold">
                    {users.filter((u) => u.status === "active").length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Users
                  </p>
                  <p className="text-2xl font-bold">
                    {users.filter((u) => u.status === "pending").length}
                  </p>
                </div>
                <UserX className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Inactive Users
                  </p>
                  <p className="text-2xl font-bold">
                    {users.filter((u) => u.status === "inactive").length}
                  </p>
                </div>
                <UserX className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Manage and monitor all system users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-200">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="company">Companies</SelectItem>
                  <SelectItem value="university">Universities</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-200">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            <div className="space-y-4">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{u.name}</h3>
                      <p className="text-sm text-gray-600">{u.email}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <span>{u.organization}</span> •{" "}
                        <span>Joined: {u.joinDate}</span> •{" "}
                        <span>Last login: {u.lastLogin}</span>
                        {u.role !== "admin" && (
                          <>
                            {" "}
                            • <span>{u.internships} internships</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getRoleBadge(u.role)}
                    {getStatusBadge(u.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(u);
                        setIsViewOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(u);
                        setIsEditOpen(true);
                      }}
                  
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                      onClick={() => handleDeleteUser(u.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="bg-gradient-to-br from-blue-50 to-indigo-50">
            <DialogHeader>
              <DialogTitle className="bg-gradient-to-br from-blue-50 to-indigo-50">
                View User
              </DialogTitle>
              <DialogDescription>
                Details of {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 bg-gradient-to-br from-blue-50 to-indigo-50">
              <p>
                <strong>Name:</strong> {selectedUser?.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser?.email}
              </p>
              <p>
                <strong>Role:</strong> {selectedUser?.role}
              </p>
              <p>
                <strong>Organization:</strong> {selectedUser?.organization}
              </p>
              <p>
                <strong>Status:</strong> {selectedUser?.status}
              </p>
              <p>
                <strong>Joined:</strong> {selectedUser?.joinDate}
              </p>
              <p>
                <strong>Last Login:</strong> {selectedUser?.lastLogin}
              </p>
              {selectedUser?.role !== "admin" && (
                <p>
                  <strong>Internships:</strong> {selectedUser?.internships}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setIsViewOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-gradient-to-br from-blue-50 to-indigo-50">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 ">
              <div className="items-center gap-4">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={selectedUser?.name || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, name: e.target.value })
                  }
                />
              </div>
              <div className="items-center gap-4">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={selectedUser?.email || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                />
              </div>
              <div className="items-center gap-4 ">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={selectedUser?.role || ""}
                  onValueChange={(value) =>
                    setSelectedUser({ ...selectedUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-200">
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="items-center gap-4">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={selectedUser?.organization || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      organization: e.target.value,
                    })
                  }
                />
              </div>
              <div className="items-center gap-4">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={selectedUser?.status || ""}
                  onValueChange={(value) =>
                    setSelectedUser({ ...selectedUser, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditUser}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
