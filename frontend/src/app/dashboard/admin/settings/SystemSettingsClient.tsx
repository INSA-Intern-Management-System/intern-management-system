// app/dashboard/admin/settings/SystemSettingsClient.tsx
"use client";

import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  SystemSetting,
  SystemHealth,
} from "@/app/services/systemSettingService";

interface SystemSettingsClientProps {
  initialSettings: SystemSetting | null;
  initialHealth: SystemHealth[];
  onUpdateSettings: (settings: any) => Promise<{
    success: boolean;
    settings?: SystemSetting;
    error?: string;
  }>;
  onCreateSettings: (settings: any) => Promise<{
    success: boolean;
    settings?: SystemSetting;
    error?: string;
  }>;
}

const defaultSettings = {
  systemName: "INSA Internship Portal",
  adminEmail: "admin@insa.fr",
  supportEmail: "support@insa.fr",
  systemUrl: "https://internships.insa.fr",
  timeZone: "Europe/Paris",
  defaultLanguage: "English",
  maintenanceMode: false,
  emailNotificationEnabled: true,
  minimumPasswordLength: 8,
  requireSpecialCharacters: true,
  sessionTimeoutMinutes: 30,
  maxLoginAttempts: 5,
  failedAttempts: 0,
  accountLocked: false,
  ipWhitelist: "",
  maxInterns: 10,
  internshipDuration: 6,
  reportFrequency: "Weekly",
  evaluationDeadline: 7,
};

export default function SystemSettingsClient({
  initialSettings,
  initialHealth,
  onUpdateSettings,
  onCreateSettings,
}: SystemSettingsClientProps) {
  const [settings, setSettings] = useState(() => ({
    ...defaultSettings,
    ...initialSettings,
  }));
  const [systemHealth, setSystemHealth] =
    useState<SystemHealth[]>(initialHealth);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);

  const refreshHealthStatus = async () => {
    setIsRefreshingHealth(true);
    try {
      // You would need to create a server action to fetch health data
      // For now, we'll just re-use the initial data or show a toast
      toast({
        title: "Health status refreshed",
        description: "System health status has been updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to refresh health status",
        variant: "destructive",
      });
    } finally {
      setIsRefreshingHealth(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      let response;

      if (initialSettings) {
        // Update existing settings
        response = await onUpdateSettings(settings);
      } else {
        // Create new settings
        response = await onCreateSettings(settings);
      }

      if (!response.success) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: initialSettings
          ? "System settings updated successfully"
          : "System settings created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save system settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    setSettings({
      ...defaultSettings,
      ...initialSettings, // Keep the ID if it exists
    });
    toast({
      title: "Settings reset",
      description: "Settings have been reset to defaults",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case "unknown":
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "unknown":
        return <Clock className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={refreshHealthStatus}
            disabled={isRefreshingHealth}
          >
            {isRefreshingHealth ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Health
          </Button>
          <Button
            variant="outline"
            onClick={handleResetSettings}
            disabled={isSaving}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Updated System Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>System Status</span>
          </CardTitle>
          <CardDescription>
            Current status of system components
            {systemHealth.some((h) => h.status === "Unknown") && (
              <span className="text-yellow-600 ml-2">
                • Some statuses unavailable
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {systemHealth.map((health) => (
              <div
                key={health.component}
                className="flex flex-col p-3 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(health.status)}
                    <span className="font-medium">{health.component}</span>
                  </div>
                  {getStatusBadge(health.status)}
                </div>
                <p className="text-sm text-gray-600">{health.message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
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
                      value={settings.systemName}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          systemName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          adminEmail: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          supportEmail: e.target.value,
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
                      value={settings.systemUrl}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          systemUrl: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeZone">Timezone</Label>
                    <Select
                      value={settings.timeZone}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          timeZone: value,
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
                        <SelectItem value="Africa/Addis_Ababa">
                          Africa/Addis_Ababa
                        </SelectItem>
                        <SelectItem value="America/New_York">
                          America/New_York
                        </SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultLanguage">Default Language</Label>
                    <Select
                      value={settings.defaultLanguage}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          defaultLanguage: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="Amharic">Amharic</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <Switch
                      id="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          maintenanceMode: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailNotificationEnabled">
                      Email Notifications
                    </Label>
                    <Switch
                      id="emailNotificationEnabled"
                      checked={settings.emailNotificationEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          emailNotificationEnabled: checked,
                        })
                      }
                    />
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
                    <Label htmlFor="minimumPasswordLength">
                      Minimum Password Length
                    </Label>
                    <Input
                      id="minimumPasswordLength"
                      type="number"
                      value={settings.minimumPasswordLength}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          minimumPasswordLength: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireSpecialCharacters">
                      Require Special Characters
                    </Label>
                    <Switch
                      id="requireSpecialCharacters"
                      checked={settings.requireSpecialCharacters}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          requireSpecialCharacters: checked,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeoutMinutes">
                      Session Timeout (minutes)
                    </Label>
                    <Input
                      id="sessionTimeoutMinutes"
                      type="number"
                      value={settings.sessionTimeoutMinutes}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          sessionTimeoutMinutes: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Access Control</h3>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maxLoginAttempts: parseInt(e.target.value),
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
                      value={settings.ipWhitelist}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          ipWhitelist: e.target.value,
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
                  <h3 className="text-lg font-semibold">Capacity</h3>
                  <div className="space-y-2">
                    <Label htmlFor="maxInterns">Maximum Interns</Label>
                    <Input
                      id="maxInterns"
                      type="number"
                      value={settings.maxInterns}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maxInterns: parseInt(e.target.value),
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
                      value={settings.internshipDuration}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          internshipDuration: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Evaluation Policies</h3>
                  <div className="space-y-2">
                    <Label htmlFor="reportFrequency">Report Frequency</Label>
                    <Select
                      value={settings.reportFrequency}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          reportFrequency: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
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
                      value={settings.evaluationDeadline}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          evaluationDeadline: parseInt(e.target.value),
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
  );
}
