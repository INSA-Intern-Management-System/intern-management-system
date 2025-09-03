"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
    user?: UserType;
    error?: string;
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
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    role?: string;
  };
}

export default function UsersClient({
  initialUsers,
  initialPagination,
  onCreateUser,
  onDeleteUser,
  onResetPassword,
  searchParams,
}: UsersClientProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  
  const [users, setUsers] = useState<UserType[]>(initialUsers || []);
  const [searchTerm, setSearchTerm] = useState(searchParams.search || "");
  const [filterRole, setFilterRole] = useState(searchParams.role || "all");
  const [filterStatus, setFilterStatus] = useState(searchParams.status || "all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewUser, setViewUser] = useState<UserType | null>(null);
  const [editUser, setEditUser] = useState<UserType | null>(null);
  const [resetPasswordData, setResetPasswordData] = useState({
    email: "",
    newPassword: "",
  });

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    gender: "Male",
    fieldOfStudy: "",
    duration: "",
    bio: "",
    institution: "",
    linkedInUrl: "",
    githubUrl: "",
    profilePicUrl: "",
    role: "student",
    userStatus: "ACTIVE",
    notifyEmail: true,
    visibility: true,
  });

  const currentPage = parseInt(searchParams.page || "0");
  const pageSize = 5;

  useEffect(() => {
    setUsers(initialUsers || []);
  }, [initialUsers]);

  const updateUrlParams = (updates: { 
    page?: number; 
    search?: string; 
    status?: string;
    role?: string;
  }) => {
    const params = new URLSearchParams(searchParamsHook.toString());
    
    if (updates.page !== undefined) {
      params.set('page', updates.page.toString());
    }
    
    if (updates.search !== undefined) {
      if (updates.search) {
        params.set('search', updates.search);
      } else {
        params.delete('search');
      }
    }
    
    if (updates.status !== undefined) {
      if (updates.status !== 'all') {
        params.set('status', updates.status);
      } else {
        params.delete('status');
      }
    }
    
    if (updates.role !== undefined) {
      if (updates.role !== 'all') {
        params.set('role', updates.role);
      } else {
        params.delete('role');
      }
    }
    
    router.push(`/dashboard/admin/users?${params.toString()}`);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    updateUrlParams({ search: term, page: 0 });
  };

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
    updateUrlParams({ status, page: 0 });
  };

  const handleRoleFilter = (role: string) => {
    setFilterRole(role);
    updateUrlParams({ role, page: 0 });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < initialPagination.totalPages) {
      updateUrlParams({ page: newPage });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "student":
        return <GraduationCap className="h-4 w-4" />;
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
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case "INACTIVE":
        return <Badge className="bg-gray-500 text-white">Inactive</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case "SUSPENDED":
        return <Badge className="bg-red-500 text-white">Suspended</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-500 text-white">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleName = role.toLowerCase();
    const roleColors: { [key: string]: string } = {
      student: "bg-blue-500 text-white",
      hr: "bg-green-500 text-white",
      university: "bg-purple-500 text-white",
      admin: "bg-red-500 text-white",
      supervisor: "bg-orange-500 text-white",
    };
    
    return (
      <Badge className={roleColors[roleName] || "bg-gray-500 text-white"}>
        <span className="flex items-center space-x-1">
          {getRoleIcon(role)}
          <span className="capitalize">{roleName}</span>
        </span>
      </Badge>
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await onCreateUser(newUser);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "User created successfully!",
        });
        setIsAddUserOpen(false);
        setNewUser({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          phoneNumber: "",
          address: "",
          gender: "Male",
          fieldOfStudy: "",
          duration: "",
          bio: "",
          institution: "",
          linkedInUrl: "",
          githubUrl: "",
          profilePicUrl: "",
          role: "student",
          userStatus: "ACTIVE",
          notifyEmail: true,
          visibility: true,
        });
        // Refresh the page to show new user
        window.location.reload();
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
        // Refresh the page
        window.location.reload();
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

  const handleResetPassword = async () => {
    if (!editUser || !resetPasswordData.newPassword) {
      toast({
        title: "Error",
        description: "Please enter a new password",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await onResetPassword({
        targetUserEmail: editUser.email,
        newPassword: resetPasswordData.newPassword,
      });
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Password reset successfully!",
        });
        setResetPasswordData({ email: "", newPassword: "" });
        setEditUser(null);
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
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their access</p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add New User</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Create a new user account in the system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    required
                    className="text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    required
                    className="text-foreground"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                    className="text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    className="text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-foreground">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={newUser.phoneNumber}
                    onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                    className="text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-foreground">Gender</Label>
                  <Select
                    value={newUser.gender}
                    onValueChange={(value) => setNewUser({ ...newUser, gender: value })}
                  >
                    <SelectTrigger className="text-foreground">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-foreground">Address</Label>
                <Input
                  id="address"
                  value={newUser.address}
                  onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                  className="text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="institution" className="text-foreground">Institution/Company</Label>
                  <Input
                    id="institution"
                    value={newUser.institution}
                    onChange={(e) => setNewUser({ ...newUser, institution: e.target.value })}
                    className="text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fieldOfStudy" className="text-foreground">Field of Study/Role</Label>
                  <Input
                    id="fieldOfStudy"
                    value={newUser.fieldOfStudy}
                    onChange={(e) => setNewUser({ ...newUser, fieldOfStudy: e.target.value })}
                    className="text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-foreground">Role *</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                  >
                    <SelectTrigger className="text-foreground">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userStatus" className="text-foreground">Status *</Label>
                  <Select
                    value={newUser.userStatus}
                    onValueChange={(value) => setNewUser({ ...newUser, userStatus: value })}
                  >
                    <SelectTrigger className="text-foreground">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedInUrl" className="text-foreground">LinkedIn URL</Label>
                  <Input
                    id="linkedInUrl"
                    value={newUser.linkedInUrl}
                    onChange={(e) => setNewUser({ ...newUser, linkedInUrl: e.target.value })}
                    className="text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubUrl" className="text-foreground">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    value={newUser.githubUrl}
                    onChange={(e) => setNewUser({ ...newUser, githubUrl: e.target.value })}
                    className="text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-foreground">Bio</Label>
                <Input
                  id="bio"
                  value={newUser.bio}
                  onChange={(e) => setNewUser({ ...newUser, bio: e.target.value })}
                  className="text-foreground"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddUserOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Create User
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">All Users ({initialPagination.totalItems})</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage and monitor all system users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, or institution..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 text-foreground"
                />
              </div>
            </div>
            <Select value={filterRole} onValueChange={handleRoleFilter}>
              <SelectTrigger className="w-48 text-foreground">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="university">Universities</SelectItem>
                <SelectItem value="supervisor">Supervisors</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-48 text-foreground">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">No users found</h3>
                <p className="text-muted-foreground">
                  No users available.
                </p>
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-muted rounded-full">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{user.firstName} {user.lastName}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
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
                    <Button variant="outline" size="sm" onClick={() => {
                      setEditUser(user);
                      setResetPasswordData({ email: user.email, newPassword: "" });
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

                  {/* Pagination */}
          {initialPagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, initialPagination.totalItems)} of {initialPagination.totalItems} users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: initialPagination.totalPages }, (_, i) => i).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="h-8 w-8 p-0"
                    >
                      {pageNum + 1}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= initialPagination.totalPages - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View User Dialog */}
      {viewUser && (
        <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-foreground">User Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-muted rounded-full">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{viewUser.firstName} {viewUser.lastName}</h3>
                  <p className="text-muted-foreground">{viewUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {getRoleBadge(viewUser.roles.name)}
                    {getStatusBadge(viewUser.userStatus)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold text-foreground">Phone Number</Label>
                  <p className="text-sm mt-1 text-foreground">{viewUser.phoneNumber || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold text-foreground">Gender</Label>
                  <p className="text-sm mt-1 text-foreground">{viewUser.gender || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold text-foreground">Institution</Label>
                  <p className="text-sm mt-1 text-foreground">{viewUser.institution || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold text-foreground">Field of Study</Label>
                  <p className="text-sm mt-1 text-foreground">{viewUser.fieldOfStudy || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold text-foreground">Address</Label>
                  <p className="text-sm mt-1 text-foreground">{viewUser.address || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-semibold text-foreground">Joined Date</Label>
                  <p className="text-sm mt-1 text-foreground">{formatDate(viewUser.createdAt)}</p>
                </div>
              </div>
              
              {viewUser.bio && (
                <div>
                  <Label className="font-semibold text-foreground">Bio</Label>
                  <p className="text-sm mt-1 text-foreground">{viewUser.bio}</p>
                </div>
              )}

              {(viewUser.linkedInUrl || viewUser.githubUrl) && (
                <div>
                  <Label className="font-semibold text-foreground">Social Links</Label>
                  <div className="flex space-x-4 mt-1">
                    {viewUser.linkedInUrl && (
                      <a
                        href={viewUser.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        LinkedIn
                      </a>
                    )}
                    {viewUser.githubUrl && (
                      <a
                        href={viewUser.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:text-foreground/80 text-sm"
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

      {/* Edit User Dialog - Reset Password */}
      {editUser && (
        <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-foreground">Reset Password</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Reset password for {editUser.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={resetPasswordData.newPassword}
                  onChange={(e) => setResetPasswordData({
                    ...resetPasswordData,
                    newPassword: e.target.value
                  })}
                  placeholder="Enter new password"
                  className="mt-1 text-foreground"
                />
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditUser(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleResetPassword}
                  disabled={!resetPasswordData.newPassword}
                >
                  Reset Password
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}