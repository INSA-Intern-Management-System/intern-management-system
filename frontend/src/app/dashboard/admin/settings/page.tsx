"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings, Bell, Shield, Clock, Save, RefreshCw, AlertTriangle, CheckCircle, GraduationCap } from "lucide-react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { toast } from "@/components/ui/use-toast"

interface User {
  name: string
  role: string
}

interface SystemSettings {
  general: {
    systemName: string
    adminEmail: string
    supportEmail: string
    systemUrl: string
    timezone: string
    language: string
    maintenanceMode: boolean
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    reportReminders: string
    applicationNotifications: boolean
    systemAlerts: boolean
  }
  security: {
    passwordMinLength: number
    requireSpecialChars: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    twoFactorAuth: boolean
    ipWhitelist: string
  }
  internships: {
    maxInternsPerCompany: number
    internshipDuration: number
    reportFrequency: string
    evaluationDeadline: number
    autoApproveApplications: boolean
    requireUniversityApproval: boolean
  }
}

interface SystemStatus {
  database: string
  email: string
  storage: string
  api: string
  backup: string
}

export default function SystemSettings() {
  const [user, setUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<SystemSettings>({
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
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        if (typeof window !== 'undefined') {
          const userData = localStorage.getItem("user")
          if (userData) {
            const parsedUser = JSON.parse(userData) as User
            if (parsedUser.role !== "admin") {
              router.push("/login")
              return
            }
            setUser(parsedUser)
          } else {
            router.push("/login")
          }

          const savedSettings = localStorage.getItem("systemSettings")
          if (savedSettings) {
            setSettings(JSON.parse(savedSettings))
          }
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load settings data",
          variant: "destructive",
        })
      }
    }

    loadData()
  }, [router])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem("systemSettings", JSON.stringify(settings))
      toast({
        title: "Success",
        description: "Settings saved successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSettings = () => {
    if (confirm("Are you sure you want to reset all settings to their default values?")) {
      setIsResetting(true)
      try {
        const defaultSettings = {
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
        }
        
        setSettings(defaultSettings)
        localStorage.setItem("systemSettings", JSON.stringify(defaultSettings))
        toast({
          title: "Success",
          description: "Settings reset to defaults",
        })
      } catch (error) {
        console.error("Error resetting settings:", error)
        toast({
          title: "Error",
          description: "Failed to reset settings",
          variant: "destructive",
        })
      } finally {
        setIsResetting(false)
      }
    }
  }

  const systemStatus: SystemStatus = {
    database: "healthy",
    email: "healthy",
    storage: "warning",
    api: "healthy",
    backup: "error",
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const CustomSwitch = ({ 
    id, 
    checked, 
    onCheckedChange 
  }: {
    id: string
    checked: boolean
    onCheckedChange: (checked: boolean) => void
  }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        id={id}
        className="sr-only peer" 
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
      <div className="
        w-11 h-6 
        bg-gray-200 
        peer-focus:outline-none 
        rounded-full 
        peer 
        peer-checked:after:translate-x-full 
        peer-checked:after:border-white 
        after:content-[''] 
        after:absolute 
        after:top-[2px] 
        after:left-[2px] 
        after:bg-white 
        after:border-gray-300 
        after:border 
        after:rounded-full 
        after:h-5 
        after:w-5 
        after:transition-all 
        peer-checked:bg-green-500
      "></div>
    </label>
  )

  if (!user) return null

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 ">System Settings</h1>
            <p className="text-gray-600">Configure system-wide settings and preferences</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleResetSettings} disabled={isResetting}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {isResetting ? "Resetting..." : "Reset to Defaults"}
            </Button>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>System Status</span>
            </CardTitle>
            <CardDescription>Current status of system components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(systemStatus).map(([component, status]) => (
                <div key={component} className="flex items-center justify-between p-3 border rounded-lg">
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

        <Tabs defaultValue="general" className="space-y-6  ">
          <TabsList className="grid w-full grid-cols-4 gap-3 border rounded-lg shadow-md">
            <TabsTrigger value="general" className="data-[state=active]:bg-gray-200">General</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-gray-200">Notifications</TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-gray-200">Security</TabsTrigger>
            <TabsTrigger value="internships" className="data-[state=active]:bg-gray-200">Internships</TabsTrigger>
          </TabsList>

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
                            general: { ...settings.general, systemName: e.target.value },
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
                            general: { ...settings.general, adminEmail: e.target.value },
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
                            general: { ...settings.general, supportEmail: e.target.value },
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
                            general: { ...settings.general, systemUrl: e.target.value },
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
                        <SelectContent className="bg-gray-200">
                          <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                          <SelectItem value="Europe/London">Europe/London</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
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
                        <SelectContent className="bg-gray-200">
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                      <CustomSwitch
                        id="maintenanceMode"
                        checked={settings.general.maintenanceMode}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            general: { ...settings.general, maintenanceMode: checked },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Settings</span>
                </CardTitle>
                <CardDescription>Configure system notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Notification Channels</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="emailNotifications">Email Notifications</Label>
                          <CustomSwitch
                            id="emailNotifications"
                            checked={settings.notifications.emailNotifications}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, emailNotifications: checked },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="smsNotifications">SMS Notifications</Label>
                          <CustomSwitch
                            id="smsNotifications"
                            checked={settings.notifications.smsNotifications}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, smsNotifications: checked },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="pushNotifications">Push Notifications</Label>
                          <CustomSwitch
                            id="pushNotifications"
                            checked={settings.notifications.pushNotifications}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, pushNotifications: checked },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Notification Types</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="applicationNotifications">Application Updates</Label>
                          <CustomSwitch
                            id="applicationNotifications"
                            checked={settings.notifications.applicationNotifications}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, applicationNotifications: checked },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="systemAlerts">System Alerts</Label>
                          <CustomSwitch
                            id="systemAlerts"
                            checked={settings.notifications.systemAlerts}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, systemAlerts: checked },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reportReminders">Report Reminders</Label>
                          <Select
                            value={settings.notifications.reportReminders}
                            onValueChange={(value) =>
                              setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, reportReminders: value },
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

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription>Configure security policies and authentication</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Password Policy</h3>
                    <div className="space-y-2">
                      <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        min="6"
                        max="32"
                        value={settings.security.passwordMinLength}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            security: { ...settings.security, passwordMinLength: parseInt(e.target.value) || 8 },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                      <CustomSwitch
                        id="requireSpecialChars"
                        checked={settings.security.requireSpecialChars}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            security: { ...settings.security, requireSpecialChars: checked },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        min="1"
                        max="1440"
                        value={settings.security.sessionTimeout}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            security: { ...settings.security, sessionTimeout: parseInt(e.target.value) || 30 },
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
                        min="1"
                        max="10"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) || 5 },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                      <CustomSwitch
                        id="twoFactorAuth"
                        checked={settings.security.twoFactorAuth}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            security: { ...settings.security, twoFactorAuth: checked },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ipWhitelist">IP Whitelist (comma-separated)</Label>
                      <Textarea
                        id="ipWhitelist"
                        placeholder="192.168.1.1, 10.0.0.1"
                        value={settings.security.ipWhitelist}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            security: { ...settings.security, ipWhitelist: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="internships">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Internship Settings</span>
                </CardTitle>
                <CardDescription>Configure internship-specific policies and rules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Company Policies</h3>
                    <div className="space-y-2">
                      <Label htmlFor="maxInternsPerCompany">Max Interns per Company</Label>
                      <Input
                        id="maxInternsPerCompany"
                        type="number"
                        min="1"
                        max="50"
                        value={settings.internships.maxInternsPerCompany}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            internships: {
                              ...settings.internships,
                              maxInternsPerCompany: parseInt(e.target.value) || 10,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="internshipDuration">Default Internship Duration (months)</Label>
                      <Input
                        id="internshipDuration"
                        type="number"
                        min="1"
                        max="12"
                        value={settings.internships.internshipDuration}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            internships: {
                              ...settings.internships,
                              internshipDuration: parseInt(e.target.value) || 6,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoApproveApplications">Auto-approve Applications</Label>
                      <CustomSwitch
                        id="autoApproveApplications"
                        checked={settings.internships.autoApproveApplications}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            internships: { ...settings.internships, autoApproveApplications: checked },
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
                        value={settings.internships.reportFrequency}
                        onValueChange={(value) =>
                          setSettings({
                            ...settings,
                            internships: { ...settings.internships, reportFrequency: value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-200">
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="evaluationDeadline">Evaluation Deadline (days)</Label>
                      <Input
                        id="evaluationDeadline"
                        type="number"
                        min="1"
                        max="30"
                        value={settings.internships.evaluationDeadline}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            internships: {
                              ...settings.internships,
                              evaluationDeadline: parseInt(e.target.value) || 7,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireUniversityApproval">Require University Approval</Label>
                      <CustomSwitch
                        id="requireUniversityApproval"
                        checked={settings.internships.requireUniversityApproval}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            internships: { ...settings.internships, requireUniversityApproval: checked },
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
  )
}