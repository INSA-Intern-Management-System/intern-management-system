import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardLayout from "@/app/layout/dashboard-layout";
import HRPMClient from "./ProfileClient";
import {
  fetchUserProfile,
  updateUserProfile,
  UpdateProfileRequest,
} from "@/app/services/profileService";

async function getUser() {
  const accessToken = (await cookies()).get("access_token")?.value;
  const userId = (await cookies()).get("userId")?.value;

  if (!accessToken || !userId) {
    redirect("/login");
  }

  return { userId: Number(userId) };
}

export default async function HRPMPage() {
  const { userId } = await getUser();

  // Fetch user profile
  const userProfile = await fetchUserProfile();

  const handleUpdateProfile = async (profileData: UpdateProfileRequest) => {
    "use server";
    try {
      const updatedProfile = await updateUserProfile(profileData);
      return { success: true, data: updatedProfile };
    } catch (error: any) {
      console.error("Server action error:", error);
      return {
        success: false,
        error: error.message || "Failed to update profile",
      };
    }
  };

  return (
    <DashboardLayout requiredRole="university">
      <HRPMClient
        initialProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
      />
    </DashboardLayout>
  );
}
