// app/services/systemSettingService.ts
import { api as systemApi } from "@/api/axios";
import { getAccessToken } from "./notificationService";

export interface SystemSetting {
  id: number;
  systemName: string;
  adminEmail: string;
  supportEmail: string;
  systemUrl: string;
  timeZone: string;
  defaultLanguage: string;
  minimumPasswordLength: number;
  requireSpecialCharacters: boolean;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  failedAttempts: number | null;
  ipWhitelist: string;
  maxInterns: number;
  internshipDuration: number;
  reportFrequency: string;
  evaluationDeadline: number;
  maintenanceMode: boolean;
  emailNotificationEnabled: boolean;
  accountLocked: boolean | null;
}

export interface SystemSettingResponse {
  message: string;
  "system-setting": SystemSetting;
}

export interface UpdateSystemSettingRequest {
  systemName: string;
  adminEmail: string;
  supportEmail: string;
  systemUrl: string;
  timeZone: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
  emailNotificationEnabled: boolean;
  minimumPasswordLength: number;
  requireSpecialCharacters: boolean;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  failedAttempts: number;
  accountLocked: boolean;
  ipWhitelist: string;
  maxInterns: number;
  internshipDuration: number;
  reportFrequency: string;
  evaluationDeadline: number;
}

// Get system settings
export const getSystemSettings = async (): Promise<SystemSetting> => {
  const accessToken = await getAccessToken();

  try {
    const response = await systemApi.get<SystemSettingResponse>(
      "/system/setting",
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data["system-setting"];
  } catch (error: any) {
    console.error("Failed to fetch system settings:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch system settings"
    );
  }
};

// Update system settings
export const updateSystemSettings = async (
  settings: UpdateSystemSettingRequest
): Promise<SystemSetting> => {
  const accessToken = await getAccessToken();

  try {
    const response = await systemApi.put<{
      "Updated system setting": SystemSetting;
      message: string;
    }>("/system/setting", settings, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data["Updated system setting"];
  } catch (error: any) {
    console.error("Failed to update system settings:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to update system settings"
    );
  }
};

// Create system settings
export const createSystemSettings = async (
  settings: UpdateSystemSettingRequest
): Promise<SystemSetting> => {
  const accessToken = await getAccessToken();

  try {
    const response = await systemApi.post<{
      "Created System Setting": SystemSetting;
      message: string;
    }>("/system/setting/create", settings, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data["Created System Setting"];
  } catch (error: any) {
    console.error("Failed to create system settings:", error);
    if (error.response?.status === 403) {
      throw new Error("Unauthorized access. Please log in again.");
    }
    throw new Error(
      error.response?.data?.message || "Failed to create system settings"
    );
  }
};

// app/services/systemSettingService.ts
export interface SystemHealth {
  component: string;
  status: string;
  message: string;
}

export interface SystemHealthResponse {
  message: string;
  health: SystemHealth[];
}

// Get system health status
export const getSystemHealth = async (): Promise<SystemHealth[]> => {
  const accessToken = await getAccessToken();

  try {
    const response = await systemApi.get<SystemHealthResponse>(
      "/system/setting/health",
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
        withCredentials: true,
      }
    );
    return response.data.health;
  } catch (error: any) {
    console.error("Failed to fetch system health:", error);
    // Return backup data if API fails
    return getBackupSystemHealth();
  }
};

// Backup health data in case API fails
const getBackupSystemHealth = (): SystemHealth[] => {
  return [
    {
      component: "Database",
      status: "Unknown",
      message: "Unable to check status",
    },
    {
      component: "Email",
      status: "Unknown",
      message: "Unable to check status",
    },
    {
      component: "Storage",
      status: "Unknown",
      message: "Unable to check status",
    },
    { component: "API", status: "Unknown", message: "Unable to check status" },
    {
      component: "Backup",
      status: "Unknown",
      message: "Unable to check status",
    },
  ];
};
