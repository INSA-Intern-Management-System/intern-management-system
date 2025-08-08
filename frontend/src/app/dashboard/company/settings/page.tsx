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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Building2, Bell, Shield, Users } from "lucide-react";
import { useState } from "react";

export default function CompanySettingsPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <DashboardLayout requiredRole="company">
      <div className="space-y-6 bg-gray-50 min-h-screen p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Settings</h1>
          <p className="text-gray-600">
            Manage your company profile and internship program settings
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <Card className="max-h-[500px] sticky top-6 overflow-y-auto lg:col-span-1 bg-white border-2 border-gray-200 rounded-xl ">
            <CardHeader>
              <CardTitle className="text-lg">Settings Menu</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                <a
                  href="#company"
                  className="flex items-center space-x-3 px-4 py-3 text-blue-700 bg-blue-50 border-r-2 border-blue-700"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Company Profile</span>
                </a>
                <a
                  href="#internship"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
                >
                  <Users className="h-4 w-4" />
                  <span>Internship Program</span>
                </a>
                <a
                  href="#notifications"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
                >
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </a>
                <a
                  href="#security"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
                >
                  <Shield className="h-4 w-4" />
                  <span>Security</span>
                </a>
              </nav>
            </CardContent>
          </Card>
          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Profile */}
            <Card
              id="company"
              className="border border-gray-200 rounded-xl bg-white"
            >
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>
                  Update your company information and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    className="border border-gray-200"
                    id="companyName"
                    defaultValue="Tech Corp"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select defaultValue="technology">
                      <SelectTrigger id="industry">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="manufacturing">
                          Manufacturing
                        </SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="companySize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Startup (1-50)</SelectItem>
                        <SelectItem value="small">Small (51-200)</SelectItem>
                        <SelectItem value="medium">
                          Medium (201-1000)
                        </SelectItem>
                        <SelectItem value="large">Large (1000+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    className="border border-gray-200"
                    id="website"
                    type="url"
                    defaultValue="https://techcorp.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    defaultValue="123 Tech Street, Innovation District, Lyon, France"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your company and what makes it a great place for internships..."
                    defaultValue="Leading technology company specializing in innovative software solutions. We provide hands-on learning experiences for interns in a collaborative environment."
                    rows={4}
                  />
                </div>
                <Button className="bg-black text-white hover:bg-gray-900">
                  Save Company Profile
                </Button>
              </CardContent>
            </Card>
            {/* Internship Program Settings */}
            <Card
              id="internship"
              className="border border-gray-200 rounded-xl bg-white"
            >
              <CardHeader>
                <CardTitle>Internship Program Settings</CardTitle>
                <CardDescription>
                  Configure your internship program preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxInterns">Maximum Interns</Label>
                    <Input
                      className="border border-gray-200"
                      id="maxInterns"
                      type="number"
                      defaultValue="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="internshipDuration">
                      Default Duration (months)
                    </Label>
                    <Select defaultValue="6">
                      <SelectTrigger id="internshipDuration">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 months</SelectItem>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-base font-semibold">
                    Available Positions
                  </Label>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Software Developer</p>
                        <p className="text-sm text-gray-600">
                          Full-stack development with React and Node.js
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Data Analyst</p>
                        <p className="text-sm text-gray-600">
                          Data analysis and visualization projects
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">UI/UX Designer</p>
                        <p className="text-sm text-gray-600">
                          User interface and experience design
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-3 bg-transparent">
                    Add New Position
                  </Button>
                </div>
                <div>
                  <Label className="text-base font-semibold">
                    Application Requirements
                  </Label>
                  <div className="mt-3 space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded"
                        id="requireResume"
                      />
                      <div>
                        <p className="font-medium">Resume/CV Required</p>
                        <p className="text-sm text-gray-600">
                          Applicants must submit a resume
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded"
                        id="requireCoverLetter"
                      />
                      <div>
                        <p className="font-medium">Cover Letter Required</p>
                        <p className="text-sm text-gray-600">
                          Applicants must submit a cover letter
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="rounded"
                        id="requirePortfolio"
                      />
                      <div>
                        <p className="font-medium">Portfolio Required</p>
                        <p className="text-sm text-gray-600">
                          Applicants must submit a portfolio (for design roles)
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded"
                        id="requireGPA"
                      />
                      <div>
                        <p className="font-medium">Minimum GPA Requirement</p>
                        <p className="text-sm text-gray-600">
                          Require minimum GPA of 3.0
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
                <Button className="bg-black text-white hover:bg-gray-900">
                  Save Program Settings
                </Button>
              </CardContent>
            </Card>
            {/* Notification Settings */}
            <Card
              id="notifications"
              className="border border-gray-200 rounded-xl bg-white"
            >
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about intern activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Email Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded"
                        id="notifNewApplications"
                      />
                      <div>
                        <p className="font-medium">New Applications</p>
                        <p className="text-sm text-gray-600">
                          Get notified when students apply for positions
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded"
                        id="notifWeeklyReports"
                      />
                      <div>
                        <p className="font-medium">Weekly Reports</p>
                        <p className="text-sm text-gray-600">
                          Notification when interns submit weekly reports
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded"
                        id="notifLeaveRequests"
                      />
                      <div>
                        <p className="font-medium">Leave Requests</p>
                        <p className="text-sm text-gray-600">
                          Get notified about intern leave requests
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="rounded"
                        id="notifDailyDigest"
                      />
                      <div>
                        <p className="font-medium">Daily Digest</p>
                        <p className="text-sm text-gray-600">
                          Daily summary of intern activities
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Push Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded"
                        id="notifUrgentMessages"
                      />
                      <div>
                        <p className="font-medium">Urgent Messages</p>
                        <p className="text-sm text-gray-600">
                          Important messages from interns or supervisors
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded"
                        id="notifWeeklySummary"
                      />
                      <div>
                        <p className="font-medium">Weekly Summary</p>
                        <p className="text-sm text-gray-600">
                          Weekly summary of all activities
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
                <Button className="bg-black text-white hover:bg-gray-900">
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
            {/* Security Settings */}
            <Card
              id="security"
              className="border border-gray-200 rounded-xl bg-white"
            >
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Change Password</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        className="border border-gray-200"
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        className="border border-gray-200"
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        className="border border-gray-200"
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                      />
                    </div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={() => setShowPassword(!showPassword)}
                        id="showPasswords"
                      />
                      <span>Show Passwords</span>
                    </label>
                  </div>
                  <Button className="bg-black text-white hover:bg-gray-900">
                    Change Password
                  </Button>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">
                    Two-Factor Authentication
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" id="enable2fa" />
                      <span>Enable 2FA for account login</span>
                    </label>
                  </div>
                  <Button className="bg-black text-white hover:bg-gray-900">
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
