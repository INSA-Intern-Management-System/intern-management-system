"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import {
  UserProfile,
  UpdateProfileRequest,
} from "@/app/services/profileService";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  BookOpen,
  Linkedin,
  Github,
  FileText,
  Bell,
  Calendar,
  Shield,
  BadgeCheck,
} from "lucide-react";

interface ProfileClientProps {
  initialProfile: UserProfile;
  onUpdateProfile: (
    profileData: UpdateProfileRequest
  ) => Promise<{ success: boolean; data?: UserProfile; error?: string }>;
}

export default function ProfileClient({
  initialProfile,
  onUpdateProfile,
}: ProfileClientProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

   const handleSwitchChange = (name: string, checked: boolean) => {
    setProfile((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const updateData: UpdateProfileRequest = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber || undefined,
        address: profile.address || undefined,
        gender: profile.gender || undefined,
        bio: profile.bio,
        fieldOfStudy: profile.fieldOfStudy || undefined,
        institution: profile.institution,
        linkedInUrl: profile.linkedInUrl || undefined,
        githubUrl: profile.githubUrl || undefined,
        cvUrl: profile.cvUrl || undefined,
        notifyEmail: profile.notifyEmail !== null ? profile.notifyEmail : undefined,
      };

      const response = await onUpdateProfile(updateData);

      if (!response.success) {
        throw new Error(response.error);
      }

      setProfile(response.data!);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">
            Manage your personal information and profile details
          </p>
        </div>
        {!isEditing ? (
          <Button
            className="bg-black text-white hover:bg-gray-900"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="bg-black text-white hover:bg-gray-900"
              onClick={handleSaveProfile}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card className="border border-gray-200 rounded-lg bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile.profilePicUrl || ""} />
                  <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                    {getInitials(profile.firstName, profile.lastName)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-gray-600 mb-2">{profile.email}</p>
                <div className="flex items-center gap-1 text-sm text-green-600 mb-4">
                  <BadgeCheck className="h-4 w-4" />
                  <span className="capitalize">
                    {profile.userStatus?.toLowerCase()}
                  </span>
                </div>
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span className="capitalize">
                      {profile.roles.displayName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(profile.createdAt)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supervisor Info */}
          {profile.supervisor && (
            <Card className="border border-gray-200 rounded-lg bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Supervisor</CardTitle>
                <CardDescription>Your assigned supervisor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {profile.supervisor.firstName}{" "}
                        {profile.supervisor.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {profile.supervisor.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen className="h-4 w-4" />
                      <span>{profile.supervisor.fieldOfStudy}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building className="h-4 w-4" />
                      <span>{profile.supervisor.institution}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

                    {/* Notification Settings */}
                    <Card className="border border-gray-200 rounded-lg bg-white">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Bell className="h-5 w-5" />
                          Notification Settings
                        </CardTitle>
                        <CardDescription>
                          Manage your email notification preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="notifyEmail" className="text-base">
                              Email Notifications
                            </Label>
                            <p className="text-sm text-gray-500">
                              Receive important updates via email
                            </p>
                          </div>
          <Switch
            id="notifyEmail"
            checked={profile.notifyEmail === true}
            onCheckedChange={(checked) => handleSwitchChange("notifyEmail", checked)}
            disabled={!isEditing}
            className="data-[state=checked]:bg-blue-500 data-[state=checked]:hover:bg-blue-600"
          />
                        </div>
                      </CardContent>
                    </Card>
        </div>

        {/* Main Profile Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="border border-gray-200 rounded-lg bg-white">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phoneNumber"
                  className="flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={profile.phoneNumber || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={profile.gender || ""}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                    <SelectItem value="PREFER_NOT_TO_SAY">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={profile.address || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your address"
                />
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card className="border border-gray-200 rounded-lg bg-white">
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>
                Your educational background and field of study
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="institution"
                  className="flex items-center gap-2"
                >
                  <Building className="h-4 w-4" />
                  Institution
                </Label>
                <Input
                  id="institution"
                  name="institution"
                  value={profile.institution}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="fieldOfStudy"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Field of Study
                </Label>
                <Input
                  id="fieldOfStudy"
                  name="fieldOfStudy"
                  value={profile.fieldOfStudy || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your field of study"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Links */}
          <Card className="border border-gray-200 rounded-lg bg-white">
            <CardHeader>
              <CardTitle>Professional Links</CardTitle>
              <CardDescription>
                Add your professional profiles and portfolio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="linkedInUrl"
                  className="flex items-center gap-2"
                >
                  <Linkedin className="h-4 w-4 text-blue-600" />
                  LinkedIn URL
                </Label>
                <Input
                  id="linkedInUrl"
                  name="linkedInUrl"
                  type="url"
                  value={profile.linkedInUrl || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="https://linkedin.com/in/yourname"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl" className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub URL
                </Label>
                <Input
                  id="githubUrl"
                  name="githubUrl"
                  type="url"
                  value={profile.githubUrl || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="https://github.com/yourusername"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvUrl" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CV/Resume URL
                </Label>
                <Input
                  id="cvUrl"
                  name="cvUrl"
                  type="url"
                  value={profile.cvUrl || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="https://yourwebsite.com/cv.pdf"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
