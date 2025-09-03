// app/dashboard/admin/settings/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import SystemSettingsClient from "./SystemSettingsClient";
import {
  getSystemSettings,
  SystemSetting,
  getSystemHealth,
  SystemHealth,
} from "@/app/services/systemSettingService";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId) };
}

export default async function SystemSettingsPage() {
  const user = await getUser();

  let systemSettings: SystemSetting | null = null;
  let systemHealth: SystemHealth[] = [];

  try {
    [systemSettings, systemHealth] = await Promise.all([
      getSystemSettings(),
      getSystemHealth(),
    ]);
  } catch (error: any) {
    console.error("Failed to fetch system data:", error);
    if (error.message === "Unauthorized access. Please log in again.") {
      redirect("/login");
    }
    // Get backup health data
    systemHealth = [
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
      {
        component: "API",
        status: "Unknown",
        message: "Unable to check status",
      },
      {
        component: "Backup",
        status: "Unknown",
        message: "Unable to check status",
      },
    ];
  }

  const handleUpdateSettings = async (settings: any) => {
    "use server";
    try {
      const { updateSystemSettings } = await import(
        "@/app/services/systemSettingService"
      );
      const updatedSettings = await updateSystemSettings(settings);
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/admin/settings");
      return { success: true, settings: updatedSettings };
    } catch (error: any) {
      console.error("Failed to update settings:", error);
      return {
        success: false,
        error: error.message || "Failed to update system settings",
      };
    }
  };

  const handleCreateSettings = async (settings: any) => {
    "use server";
    try {
      const { createSystemSettings } = await import(
        "@/app/services/systemSettingService"
      );
      const newSettings = await createSystemSettings(settings);
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/admin/settings");
      return { success: true, settings: newSettings };
    } catch (error: any) {
      console.error("Failed to create settings:", error);
      return {
        success: false,
        error: error.message || "Failed to create system settings",
      };
    }
  };

  return (
    <DashboardLayout requiredRole="admin">
      <SystemSettingsClient
        initialSettings={systemSettings}
        initialHealth={systemHealth}
        onUpdateSettings={handleUpdateSettings}
        onCreateSettings={handleCreateSettings}
      />
    </DashboardLayout>
  );
}
