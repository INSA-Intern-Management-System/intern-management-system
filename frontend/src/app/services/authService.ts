// app/services/authService.ts
import { api } from "@/api/axios";
import {
  User,
  LoginData,
  AuthResponse,
  LogoutResponse,
} from "@/types/entities";

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", data, {
    withCredentials: true,
  });
  if (typeof window !== "undefined") {
    document.cookie = `userId=${response.data.user.id}; path=/; SameSite=Strict; max-age=3600`;
  }
  return response.data;
};

export const getUser = async (userId: string): Promise<User> => {
  const response = await api.get<User>(`/users/${userId}`, {
    withCredentials: true,
  });
  return response.data;
};

export const logout = async (): Promise<LogoutResponse> => {
  const response = await api.post<LogoutResponse>(
    "/auth/logout",
    {},
    { withCredentials: true }
  );
  if (typeof window !== "undefined") {
    document.cookie = "userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
  return response.data;
};

export const getUserIdFromCookie = (): string | null => {
  if (typeof window === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("userId="))
      ?.split("=")[1] || null
  );
};
