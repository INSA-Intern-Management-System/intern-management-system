"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { User, Bell, Shield, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6 bg-gray-50 min-h-screen p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <Card className="lg:col-span-1 bg-white border-2 border-gray-200 rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Settings Menu</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                <a
                  href="#profile"
                  className="flex items-center space-x-3 px-4 py-3 text-blue-700 bg-blue-50 border-r-2 border-blue-700"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </a>
                <a
                  href="#notifications"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
                >
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </a>
                <a href="#security" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50">
                  <Shield className="h-4 w-4" />
                  <span>Security</span>
                </a>
              </nav>
            </CardContent>
          </Card>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <Card id="profile" className="border border-gray-200 rounded-xl bg-white">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="john.doe@student.insa.fr" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" defaultValue="+33 6 12 34 56 78" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Input id="university" defaultValue="INSA Lyon" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program">Program/Major</Label>
                  <Input id="program" defaultValue="Computer Science" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    defaultValue="Computer Science student at INSA Lyon with a passion for web development and artificial intelligence."
                    rows={3}
                  />
                </div>
                <Button className="bg-black text-white hover:bg-gray-900">Save Profile</Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card id="notifications" className="border-2 border-gray-200 rounded-xl bg-white">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Email Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <div>
                        <p className="font-medium">Report Deadlines</p>
                        <p className="text-sm text-gray-600">Get reminded about upcoming report submissions</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <div>
                        <p className="font-medium">Feedback Received</p>
                        <p className="text-sm text-gray-600">Notification when mentors provide feedback</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <div>
                        <p className="font-medium">Meeting Reminders</p>
                        <p className="text-sm text-gray-600">Reminders for scheduled meetings</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" />
                      <div>
                        <p className="font-medium">Weekly Digest</p>
                        <p className="text-sm text-gray-600">Weekly summary of your activities</p>
                      </div>
                    </label>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Push Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <div>
                        <p className="font-medium">Urgent Messages</p>
                        <p className="text-sm text-gray-600">Important messages from mentors or supervisors</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <div>
                        <p className="font-medium">Application Updates</p>
                        <p className="text-sm text-gray-600">Status changes on your applications</p>
                      </div>
                    </label>
                  </div>
                </div>
                <Button className="bg-black text-white hover:bg-gray-900">Save Notification Settings</Button>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card id="security" className="border-2 border-gray-200 rounded-xl bg-white">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and privacy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Change Password</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
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
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" placeholder="Enter new password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                    </div>
                    <Button className="bg-black text-white hover:bg-gray-900">Update Password</Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Privacy Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <div>
                        <p className="font-medium">Profile Visibility</p>
                        <p className="text-sm text-gray-600">Allow companies to view your profile</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <div>
                        <p className="font-medium">Contact Information</p>
                        <p className="text-sm text-gray-600">Share contact details with mentors</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" />
                      <div>
                        <p className="font-medium">Activity Status</p>
                        <p className="text-sm text-gray-600">Show when you're online</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-red-600">Danger Zone</h4>
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <p className="text-sm text-red-600 mb-3">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent">
                      Delete Account
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
