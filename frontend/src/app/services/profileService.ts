import { api as userApi } from "@/api/axios";
import { cookies } from "next/headers";

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  gender: string | null;
  notifyEmail: boolean | null;
  visibility: string | null;
  bio: string;
  duration: string | null;
  linkedInUrl: string | null;
  githubUrl: string | null;
  cvUrl: string | null;
  profilePicUrl: string | null;
  fieldOfStudy: string | null;
  institution: string;
  lastLogin: string | null;
  supervisor: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    fieldOfStudy: string;
    institution: string;
  } | null;
  projectManager: any | null;
  userStatus: string;
  roles: {
    id: number;
    name: string;
    displayName: string;
    description: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  gender?: string;
  bio?: string;
  fieldOfStudy?: string;
  institution?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  cvUrl?: string;
  profilePicUrl?: string;
  notifyEmail?: boolean;
}

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await userApi.get<UserProfile>("/users/me", {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (
  profileData: UpdateProfileRequest
): Promise<UserProfile> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }

  try {
    const response = await userApi.put<UserProfile>("/users", profileData, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update user profile:", error);
    throw error;
  }
};
