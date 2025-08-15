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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Bell,
  Shield,
  Clock,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  GraduationCap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/layout/dashboard-layout";

export default function SystemSettings() {
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    general: {
      systemName: "INSA Internship Portal",
      adminEmail: "admin@insa.fr",
      supportEmail: "support@insa.fr",
      systemUrl: "https://internships.insa.fr",
      timezone: "Europe/Paris",
      language: "en",
      maintenanceMode: false,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      reportReminders: "weekly",
      applicationNotifications: true,
      systemAlerts: true,
    },
    security: {
      passwordMinLength: 8,
      requireSpecialChars: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      twoFactorAuth: false,
      ipWhitelist: "",
    },
    internships: {
      maxInternsPerCompany: 10,
      internshipDuration: 6,
      reportFrequency: "weekly",
      evaluationDeadline: 7,
      autoApproveApplications: false,
      requireUniversityApproval: true,
    },
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

  if (!user) return null;

  const handleSaveSettings = () => {
    // Save settings logic
    console.log("Settings saved:", settings);
  };

  const handleResetSettings = () => {
    // Reset to defaults logic
    console.log("Settings reset to defaults");
  };

  const systemStatus = {
    database: "healthy",
    email: "healthy",
    storage: "warning",
    api: "healthy",
    backup: "error",
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <DashboardLayout userRole="admin" userName={user.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              System Settings
            </h1>
            <p className="text-gray-600">
              Configure system-wide settings and preferences
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleResetSettings}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSaveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>System Status</span>
            </CardTitle>
            <CardDescription>
              Current status of system components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(systemStatus).map(([component, status]) => (
                <div
                  key={component}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status)}
                    <span className="font-medium capitalize">{component}</span>
                  </div>
                  {getStatusBadge(status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="internships">Internships</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>General Settings</span>
                </CardTitle>
                <CardDescription>Basic system configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="systemName">System Name</Label>
                      <Input
                        id="systemName"
                        value={settings.general.systemName}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            general: {
                              ...settings.general,
                              systemName: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">Admin Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={settings.general.adminEmail}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            general: {
                              ...settings.general,
                              adminEmail: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={settings.general.supportEmail}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            general: {
                              ...settings.general,
                              supportEmail: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="systemUrl">System URL</Label>
                      <Input
                        id="systemUrl"
                        value={settings.general.systemUrl}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            general: {
                              ...settings.general,
                              systemUrl: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={settings.general.timezone}
                        onValueChange={(value) =>
                          setSettings({
                            ...settings,
                            general: { ...settings.general, timezone: value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Paris">
                            Europe/Paris
                          </SelectItem>
                          <SelectItem value="Europe/London">
                            Europe/London
                          </SelectItem>
                          <SelectItem value="America/New_York">
                            America/New_York
                          </SelectItem>
                          <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Default Language</Label>
                      <Select
                        value={settings.general.language}
                        onValueChange={(value) =>
                          setSettings({
                            ...settings,
                            general: { ...settings.general, language: value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                      <Switch
                        id="maintenanceMode"
                        checked={settings.general.maintenanceMode}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            general: {
                              ...settings.general,
                              maintenanceMode: checked,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure system notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Notification Channels
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="emailNotifications">
                            Email Notifications
                          </Label>
                          <Switch
                            id="emailNotifications"
                            checked={settings.notifications.emailNotifications}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                notifications: {
                                  ...settings.notifications,
                                  emailNotifications: checked,
                                },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="smsNotifications">
                            SMS Notifications
                          </Label>
                          <Switch
                            id="smsNotifications"
                            checked={settings.notifications.smsNotifications}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                notifications: {
                                  ...settings.notifications,
                                  smsNotifications: checked,
                                },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="pushNotifications">
                            Push Notifications
                          </Label>
                          <Switch
                            id="pushNotifications"
                            checked={settings.notifications.pushNotifications}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                notifications: {
                                  ...settings.notifications,
                                  pushNotifications: checked,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Notification Types
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="applicationNotifications">
                            Application Updates
                          </Label>
                          <Switch
                            id="applicationNotifications"
                            checked={
                              settings.notifications.applicationNotifications
                            }
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                notifications: {
                                  ...settings.notifications,
                                  applicationNotifications: checked,
                                },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="systemAlerts">System Alerts</Label>
                          <Switch
                            id="systemAlerts"
                            checked={settings.notifications.systemAlerts}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                notifications: {
                                  ...settings.notifications,
                                  systemAlerts: checked,
                                },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reportReminders">
                            Report Reminders
                          </Label>
                          <Select
                            value={settings.notifications.reportReminders}
                            onValueChange={(value) =>
                              setSettings({
                                ...settings,
                                notifications: {
                                  ...settings.notifications,
                                  reportReminders: value,
                                },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="disabled">Disabled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure security policies and authentication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Password Policy</h3>
                    <div className="space-y-2">
                      <Label htmlFor="passwordMinLength">
                        Minimum Password Length
                      </Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            security: {
                              ...settings.security,
                              passwordMinLength: Number.parseInt(
                                e.target.value
                              ),
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireSpecialChars">
                        Require Special Characters
                      </Label>
                      <Switch
                        id="requireSpecialChars"
                        checked={settings.security.requireSpecialChars}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            security: {
                              ...settings.security,
                              requireSpecialChars: checked,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">
                        Session Timeout (minutes)
                      </Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            security: {
                              ...settings.security,
                              sessionTimeout: Number.parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Access Control</h3>
                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts">
                        Max Login Attempts
                      </Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            security: {
                              ...settings.security,
                              maxLoginAttempts: Number.parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="twoFactorAuth">
                        Two-Factor Authentication
                      </Label>
                      <Switch
                        id="twoFactorAuth"
                        checked={settings.security.twoFactorAuth}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            security: {
                              ...settings.security,
                              twoFactorAuth: checked,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ipWhitelist">
                        IP Whitelist (comma-separated)
                      </Label>
                      <Textarea
                        id="ipWhitelist"
                        placeholder="192.168.1.1, 10.0.0.1"
                        value={settings.security.ipWhitelist}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            security: {
                              ...settings.security,
                              ipWhitelist: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Internship Settings */}
          <TabsContent value="internships">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Internship Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure internship-specific policies and rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Company Policies</h3>
                    <div className="space-y-2">
                      <Label htmlFor="maxInternsPerCompany">
                        Max Interns per Company
                      </Label>
                      <Input
                        id="maxInternsPerCompany"
                        type="number"
                        value={settings.internships.maxInternsPerCompany}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            internships: {
                              ...settings.internships,
                              maxInternsPerCompany: Number.parseInt(
                                e.target.value
                              ),
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="internshipDuration">
                        Default Internship Duration (months)
                      </Label>
                      <Input
                        id="internshipDuration"
                        type="number"
                        value={settings.internships.internshipDuration}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            internships: {
                              ...settings.internships,
                              internshipDuration: Number.parseInt(
                                e.target.value
                              ),
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoApproveApplications">
                        Auto-approve Applications
                      </Label>
                      <Switch
                        id="autoApproveApplications"
                        checked={settings.internships.autoApproveApplications}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            internships: {
                              ...settings.internships,
                              autoApproveApplications: checked,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Evaluation Policies
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="reportFrequency">Report Frequency</Label>
                      <Select
                        value={settings.internships.reportFrequency}
                        onValueChange={(value) =>
                          setSettings({
                            ...settings,
                            internships: {
                              ...settings.internships,
                              reportFrequency: value,
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="evaluationDeadline">
                        Evaluation Deadline (days)
                      </Label>
                      <Input
                        id="evaluationDeadline"
                        type="number"
                        value={settings.internships.evaluationDeadline}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            internships: {
                              ...settings.internships,
                              evaluationDeadline: Number.parseInt(
                                e.target.value
                              ),
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireUniversityApproval">
                        Require University Approval
                      </Label>
                      <Switch
                        id="requireUniversityApproval"
                        checked={settings.internships.requireUniversityApproval}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            internships: {
                              ...settings.internships,
                              requireUniversityApproval: checked,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
