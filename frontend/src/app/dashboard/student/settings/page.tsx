"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  User,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Mail,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

interface UserSettings {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  institution: string;
  field_of_study: string;
  bio: string;
  profile_pic_url: string;
  notify_email: boolean;
  visibility: string;
  email_preferences: {
    report_deadlines: boolean;
    feedback_received: boolean;
    meeting_reminders: boolean;
    weekly_digest: boolean;
  };
  push_preferences: {
    urgent_messages: boolean;
    application_updates: boolean;
  };
  privacy_settings: {
    profile_visible: boolean;
    share_contact: boolean;
    show_online_status: boolean;
  };
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@student.insa.fr",
    phone_number: "+33 6 12 34 56 78",
    institution: "INSA Lyon",
    field_of_study: "Computer Science",
    bio: "Computer Science student at INSA Lyon with a passion for web development and artificial intelligence.",
    profile_pic_url: "",
    notify_email: true,
    visibility: "public",
    email_preferences: {
      report_deadlines: true,
      feedback_received: true,
      meeting_reminders: true,
      weekly_digest: false,
    },
    push_preferences: {
      urgent_messages: true,
      application_updates: true,
    },
    privacy_settings: {
      profile_visible: true,
      share_contact: true,
      show_online_status: false,
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailPrefChange = (
    key: keyof UserSettings["email_preferences"],
    value: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      email_preferences: { ...prev.email_preferences, [key]: value },
    }));
  };

  const handlePushPrefChange = (
    key: keyof UserSettings["push_preferences"],
    value: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      push_preferences: { ...prev.push_preferences, [key]: value },
    }));
  };

  const handlePrivacyChange = (
    key: keyof UserSettings["privacy_settings"],
    value: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      privacy_settings: { ...prev.privacy_settings, [key]: value },
    }));
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification preferences saved",
      description: "Your notification settings have been updated",
    });
  };

  const handlePasswordChange = () => {
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion requested",
      description: "A confirmation email has been sent to your address",
      variant: "destructive",
    });
  };

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6 bg-gray-50 min-h-screen p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <Card className="lg:col-span-1 bg-white border border-gray-200 rounded-lg">
            <CardHeader>
              <CardTitle className="text-lg">Settings Menu</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center w-full text-left space-x-3 px-4 py-3 ${
                    activeTab === "profile"
                      ? "text-blue-700 bg-blue-50 border-r-2 border-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex items-center w-full text-left space-x-3 px-4 py-3 ${
                    activeTab === "notifications"
                      ? "text-blue-700 bg-blue-50 border-r-2 border-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`flex items-center w-full text-left space-x-3 px-4 py-3 ${
                    activeTab === "security"
                      ? "text-blue-700 bg-blue-50 border-r-2 border-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>Security</span>
                </button>
              </nav>
            </CardContent>
          </Card>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            {activeTab === "profile" && (
              <Card className="border border-gray-200 rounded-lg bg-white">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and profile details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={settings.profile_pic_url} />
                      <AvatarFallback>
                        {settings.first_name.charAt(0)}
                        {settings.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Label>Profile Picture</Label>
                      <div className="flex gap-2">
                        <Button variant="outline">Upload New</Button>
                        <Button
                          variant="outline"
                          className="text-red-600 border-red-100 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={settings.first_name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={settings.last_name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={settings.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      type="tel"
                      name="phone_number"
                      value={settings.phone_number}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institution">University</Label>
                    <Input
                      id="institution"
                      name="institution"
                      value={settings.institution}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="field_of_study">Program/Major</Label>
                    <Input
                      id="field_of_study"
                      name="field_of_study"
                      value={settings.field_of_study}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell us about yourself..."
                      value={settings.bio}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  <Button
                    className="bg-black text-white hover:bg-gray-900"
                    onClick={handleSaveProfile}
                  >
                    Save Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <Card className="border border-gray-200 rounded-lg bg-white">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold">Email Notifications</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="report-deadlines">
                            Report Deadlines
                          </Label>
                          <p className="text-sm text-gray-600">
                            Get reminded about upcoming report submissions
                          </p>
                        </div>
                        <Switch
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-200 [&>span]:data-[state=checked]:bg-white"
                          id="report-deadlines"
                          checked={settings.email_preferences.report_deadlines}
                          onCheckedChange={(checked) =>
                            handleEmailPrefChange("report_deadlines", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="feedback-received">
                            Feedback Received
                          </Label>
                          <p className="text-sm text-gray-600">
                            Notification when mentors provide feedback
                          </p>
                        </div>
                        <Switch
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-200 [&>span]:data-[state=checked]:bg-white"
                          id="feedback-received"
                          checked={settings.email_preferences.feedback_received}
                          onCheckedChange={(checked) =>
                            handleEmailPrefChange("feedback_received", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="meeting-reminders">
                            Meeting Reminders
                          </Label>
                          <p className="text-sm text-gray-600">
                            Reminders for scheduled meetings
                          </p>
                        </div>
                        <Switch
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-200 [&>span]:data-[state=checked]:bg-white"
                          id="meeting-reminders"
                          checked={settings.email_preferences.meeting_reminders}
                          onCheckedChange={(checked) =>
                            handleEmailPrefChange("meeting_reminders", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="weekly-digest">Weekly Digest</Label>
                          <p className="text-sm text-gray-600">
                            Weekly summary of your activities
                          </p>
                        </div>
                        <Switch
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-200 [&>span]:data-[state=checked]:bg-white"
                          id="weekly-digest"
                          checked={settings.email_preferences.weekly_digest}
                          onCheckedChange={(checked) =>
                            handleEmailPrefChange("weekly_digest", checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Smartphone className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold">Push Notifications</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="urgent-messages">
                            Urgent Messages
                          </Label>
                          <p className="text-sm text-gray-600">
                            Important messages from mentors or supervisors
                          </p>
                        </div>
                        <Switch
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-200 [&>span]:data-[state=checked]:bg-white"
                          id="urgent-messages"
                          checked={settings.push_preferences.urgent_messages}
                          onCheckedChange={(checked) =>
                            handlePushPrefChange("urgent_messages", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="application-updates">
                            Application Updates
                          </Label>
                          <p className="text-sm text-gray-600">
                            Status changes on your applications
                          </p>
                        </div>
                        <Switch
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-200 [&>span]:data-[state=checked]:bg-white"
                          id="application-updates"
                          checked={
                            settings.push_preferences.application_updates
                          }
                          onCheckedChange={(checked) =>
                            handlePushPrefChange("application_updates", checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    className="bg-black text-white hover:bg-gray-900"
                    onClick={handleSaveNotifications}
                  >
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <Card className="border border-gray-200 rounded-lg bg-white">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and privacy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Change Password</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">
                          Current Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter current password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <Button
                        className="bg-black text-white hover:bg-gray-900"
                        onClick={handlePasswordChange}
                      >
                        Update Password
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Privacy Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="profile-visible">
                            Profile Visibility
                          </Label>
                          <p className="text-sm text-gray-600">
                            Allow companies to view your profile
                          </p>
                        </div>
                        <Switch
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-200 [&>span]:data-[state=checked]:bg-white"
                          id="profile-visible"
                          checked={settings.privacy_settings.profile_visible}
                          onCheckedChange={(checked) =>
                            handlePrivacyChange("profile_visible", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="share-contact">
                            Contact Information
                          </Label>
                          <p className="text-sm text-gray-600">
                            Share contact details with mentors
                          </p>
                        </div>
                        <Switch
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-200 [&>span]:data-[state=checked]:bg-white"
                          id="share-contact"
                          checked={settings.privacy_settings.share_contact}
                          onCheckedChange={(checked) =>
                            handlePrivacyChange("share_contact", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="online-status">Activity Status</Label>
                          <p className="text-sm text-gray-600">
                            Show when you're online
                          </p>
                        </div>
                        <Switch
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-200 [&>span]:data-[state=checked]:bg-white"
                          id="online-status"
                          checked={settings.privacy_settings.show_online_status}
                          onCheckedChange={(checked) =>
                            handlePrivacyChange("show_online_status", checked)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-red-600">
                      Danger Zone
                    </h4>
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <p className="text-sm text-red-600 mb-3">
                        Once you delete your account, there is no going back.
                        Please be certain.
                      </p>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                        onClick={handleDeleteAccount}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
