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
import { DashboardLayout } from "@/app/layout/dashboard-layout";
import { University, Save, Bell, Shield, Users, Mail } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
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

  const handleSave = () => {
    // Here you would typically save the settings to your backend
    console.log("Saving settings:", settings);
  };

  return (
    <DashboardLayout userRole="university" userName="INSA University">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">
              Manage your university profile and preferences
            </p>
          </div>
          <Button onClick={handleSave}>
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
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-600">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Receive notifications via SMS
                  </p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, smsNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weeklyReports">Weekly Reports</Label>
                  <p className="text-sm text-gray-600">
                    Receive weekly summary reports
                  </p>
                </div>
                <Switch
                  id="weeklyReports"
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, weeklyReports: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="evaluationReminders">
                    Evaluation Reminders
                  </Label>
                  <p className="text-sm text-gray-600">
                    Get reminders for pending evaluations
                  </p>
                </div>
                <Switch
                  id="evaluationReminders"
                  checked={settings.evaluationReminders}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, evaluationReminders: checked })
                  }
                />
              </div>
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
              <Button variant="outline" className="w-full bg-transparent">
                <Shield className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Users className="h-4 w-4 mr-2" />
                Manage User Roles
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Mail className="h-4 w-4 mr-2" />
                Email Templates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
