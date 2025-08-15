"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { University, Save, Bell, Shield, Users, Mail } from "lucide-react";

interface Settings {
  universityName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  description: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  weeklyReports: boolean;
  evaluationReminders: boolean;
  autoAssignSupervisors: boolean;
  requireApproval: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    universityName: "INSA University",
    contactEmail: "admin@insa.fr",
    contactPhone: "+33 1 23 45 67 89",
    address: "123 University Street, Lyon, France",
    description:
      "Leading engineering school specializing in technology and innovation.",
    emailNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    evaluationReminders: true,
    autoAssignSupervisors: false,
    requireApproval: true,
  });

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }
    setPasswordError("");
    alert("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsPasswordDialogOpen(false);
  };

  const handleSave = () => {
    console.log("Saving settings:", settings);
    alert("Settings saved successfully!"); // Replace with backend call
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">
              Manage your university profile and preferences
            </p>
          </div>
          <Button onClick={handleSave} className="bg-black text-white">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* University Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <University className="h-5 w-5" />
                <span>University Information</span>
              </CardTitle>
              <CardDescription>
                Update your university's basic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="universityName">University Name</Label>
                <Input
                  id="universityName"
                  value={settings.universityName}
                  onChange={(e) =>
                    setSettings({ ...settings, universityName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, contactEmail: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={settings.contactPhone}
                  onChange={(e) =>
                    setSettings({ ...settings, contactPhone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
                  }
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) =>
                    setSettings({ ...settings, description: e.target.value })
                  }
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Settings</span>
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  id: "emailNotifications",
                  label: "Email Notifications",
                  description: "Receive notifications via email",
                  value: settings.emailNotifications,
                },
                {
                  id: "smsNotifications",
                  label: "SMS Notifications",
                  description: "Receive notifications via SMS",
                  value: settings.smsNotifications,
                },
                {
                  id: "weeklyReports",
                  label: "Weekly Reports",
                  description: "Receive weekly summary reports",
                  value: settings.weeklyReports,
                },
                {
                  id: "evaluationReminders",
                  label: "Evaluation Reminders",
                  description: "Get reminders for pending evaluations",
                  value: settings.evaluationReminders,
                },
              ].map(({ id, label, description, value }) => (
                <div key={id} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={id}>{label}</Label>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                  <Switch
                    id={id}
                    checked={value}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, [id]: checked })
                    }
                    className="relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full bg-white transition-colors duration-300 data-[state=checked]:bg-blue-500 before:content-[''] before:absolute before:top-0.7 before:left-0.7 before:h-5 before:w-5 before:rounded-full before:bg-blue-500 before:transition-transform before:duration-300 data-[state=checked]:before:translate-x-6 data-[state=checked]:before:bg-white"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>System Settings</span>
              </CardTitle>
              <CardDescription>
                Configure system behavior and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoAssignSupervisors">
                    Auto-assign Supervisors
                  </Label>
                  <p className="text-sm text-gray-600">
                    Automatically assign supervisors based on availability
                  </p>
                </div>
                <Switch
                  id="autoAssignSupervisors"
                  checked={settings.autoAssignSupervisors}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoAssignSupervisors: checked })
                  }
                  className="relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full bg-white transition-colors duration-300 data-[state=checked]:bg-blue-500 before:content-[''] before:absolute before:top-0.7 before:left-0.7 before:h-5 before:w-5 before:rounded-full before:bg-blue-500 before:transition-transform before:duration-300 data-[state=checked]:before:translate-x-6 data-[state=checked]:before:bg-white"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireApproval">Require Approval</Label>
                  <p className="text-sm text-gray-600">
                    Require approval for new internship applications
                  </p>
                </div>
                <Switch
                  id="requireApproval"
                  checked={settings.requireApproval}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, requireApproval: checked })
                  }
                  className="relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full bg-white transition-colors duration-300 data-[state=checked]:bg-blue-500 before:content-[''] before:absolute before:top-0.7 before:left-0.7 before:h-5 before:w-5 before:rounded-full before:bg-blue-500 before:transition-transform before:duration-300 data-[state=checked]:before:translate-x-6 data-[state=checked]:before:bg-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Account Management</span>
              </CardTitle>
              <CardDescription>
                Manage account security and access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Change Password Modal */}
              <Dialog
                open={isPasswordDialogOpen}
                onOpenChange={setIsPasswordDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white text-black">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      type="password"
                      placeholder="Current Password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Input
                      type="password"
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {passwordError && (
                      <p className="text-red-500 text-sm">{passwordError}</p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button onClick={handleChangePassword}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
