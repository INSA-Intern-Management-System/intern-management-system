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
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/layout/dashboard-layout";
import { toast } from "@/components/ui/use-toast";
import { User as UserType } from "@/app/services/userService";

interface UsersClientProps {
  initialUsers: UserType[];
  initialPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  onCreateUser: (userData: any) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    user?: any;
  }>;
  onDeleteUser: (userId: number) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
  onResetPassword: (data: { targetUserEmail: string; newPassword: string }) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
  onFetchData: (
    page: number,
    size: number,
    search: string,
    status: string,
    role: string
  ) => Promise<{
    users: UserType[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      pageSize: number;
    };
    error?: string;
  }>;
}

export default function UsersManagement({
  initialUsers,
  initialPagination,
  onCreateUser,
  onDeleteUser,
  onResetPassword,
  onFetchData,
}: UsersClientProps) {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<UserType[]>(initialUsers || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewUser, setViewUser] = useState<UserType | null>(null);
  const [editUser, setEditUser] = useState<UserType | null>(null);
  const [newUserData, setNewUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    gender: "",
    fieldOfStudy: "",
    duration: "",
    bio: "",
    notifyEmail: true,
    visibility: true,
    institution: "",
    linkedInUrl: "",
    githubUrl: "",
    cvUrl: "",
    profilePicUrl: "",
    lastReadNotificationAt: "",
    role: "student",
    userStatus: "ACTIVE"
  });
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

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const data = await onFetchData(0, 10000, searchTerm, filterStatus, filterRole);
      
      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      } else {
        setUsers(data.users || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.institution && user.institution.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === "all" || user.roles.name.toLowerCase() === filterRole.toLowerCase();
    const matchesStatus = filterStatus === "all" || user.userStatus.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "student":
        return <GraduationCap className="h-4 w-4" />;
      case "company":
      case "hr":
        return <Building2 className="h-4 w-4" />;
      case "university":
        return <University className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "supervisor":
        return <UserCheck className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "INACTIVE":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "SUSPENDED":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors: { [key: string]: string } = {
      student: "bg-blue-100 text-blue-800",
      hr: "bg-green-100 text-green-800",
      company: "bg-green-100 text-green-800",
      university: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800",
      supervisor: "bg-orange-100 text-orange-800",
    };
    
    return (
      <Badge className={roleColors[role.toLowerCase()] || "bg-gray-100 text-gray-800"}>
        <span className="flex items-center space-x-1">
          {getRoleIcon(role)}
          <span className="capitalize">{role.toLowerCase()}</span>
        </span>
      </Badge>
    );
  };

  const handleCreateUser = async () => {
    setIsSubmitting(true);
    try {
      const result = await onCreateUser(newUserData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "User created successfully!",
        });
        setIsAddUserOpen(false);
        setNewUserData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          phoneNumber: "",
          address: "",
          gender: "",
          fieldOfStudy: "",
          duration: "",
          bio: "",
          notifyEmail: true,
          visibility: true,
          institution: "",
          linkedInUrl: "",
          githubUrl: "",
          cvUrl: "",
          profilePicUrl: "",
          lastReadNotificationAt: "",
          role: "student",
          userStatus: "ACTIVE"
        });
        loadAllData();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const result = await onDeleteUser(userId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "User deleted successfully!",
        });
        loadAllData();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (userEmail: string) => {
    const newPassword = prompt("Enter new password for the user:");
    if (!newPassword) return;
    
    try {
      const result = await onResetPassword({
        targetUserEmail: userEmail,
        newPassword: newPassword
      });
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Password reset successfully!",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) return null;

  return (
    <DashboardLayout userRole="admin" userName={user.name}>
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
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account in the system
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={newUserData.firstName}
                      onChange={(e) => setNewUserData({...newUserData, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newUserData.lastName}
                      onChange={(e) => setNewUserData({...newUserData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newUserData.role}
                      onValueChange={(value) => setNewUserData({...newUserData, role: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="university">University</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newUserData.userStatus}
                      onValueChange={(value) => setNewUserData({...newUserData, userStatus: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    value={newUserData.institution}
                    onChange={(e) => setNewUserData({...newUserData, institution: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={newUserData.phoneNumber}
                    onChange={(e) => setNewUserData({...newUserData, phoneNumber: e.target.value})}
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
                <Button 
                  onClick={handleCreateUser}
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Create User
                </Button>
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
                    {users.filter((u) => u.userStatus === "ACTIVE").length}
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
                    {users.filter((u) => u.userStatus === "PENDING").length}
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
                    {users.filter((u) => u.userStatus === "INACTIVE").length}
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
            {/* Search and Filter */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="university">Universities</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="supervisor">Supervisors</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No users found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                          <span>{user.institution}</span>
                          <span>•</span>
                          <span>Joined: {formatDate(user.createdAt)}</span>
                          <span>•</span>
                          <span>Last login: {user.lastLogin ? formatDate(user.lastLogin) : "Never"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRoleBadge(user.roles.name)}
                      {getStatusBadge(user.userStatus)}
                      <Button variant="outline" size="sm" onClick={() => setViewUser(user)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResetPassword(user.email)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Reset Password
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Details Dialog */}
      {viewUser && (
        <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Detailed information about {viewUser.firstName} {viewUser.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Name</Label>
                  <p>{viewUser.firstName} {viewUser.lastName}</p>
                </div>
                <div>
                  <Label className="font-semibold">Email</Label>
                  <p>{viewUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Phone</Label>
                  <p>{viewUser.phoneNumber || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold">Institution</Label>
                  <p>{viewUser.institution || "N/A"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Role</Label>
                  <p>{viewUser.roles.name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <p>{viewUser.userStatus}</p>
                   </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Created At</Label>
              <p>{formatDate(viewUser.createdAt)}</p>
            </div>
            <div>
              <Label className="font-semibold">Last Updated</Label>
              <p>{formatDate(viewUser.updatedAt)}</p>
            </div>
          </div>
          
          {viewUser.fieldOfStudy && (
            <div>
              <Label className="font-semibold">Field of Study</Label>
              <p>{viewUser.fieldOfStudy}</p>
            </div>
          )}
          
          {viewUser.bio && (
            <div>
              <Label className="font-semibold">Bio</Label>
              <p>{viewUser.bio}</p>
            </div>
          )}
          
          {(viewUser.linkedInUrl || viewUser.githubUrl) && (
            <div>
              <Label className="font-semibold">Social Links</Label>
              <div className="flex space-x-2 mt-1">
                {viewUser.linkedInUrl && (
                  <a 
                    href={viewUser.linkedInUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    LinkedIn
                  </a>
                )}
                {viewUser.githubUrl && (
                  <a 
                    href={viewUser.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:underline"
                  >
                    GitHub
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )}
</DashboardLayout>
);
}