import api from "../api/axios";
import {
  LoginData,
  AuthResponse,
  User,
  LogoutResponse,
} from "../types/entities";

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", data, {
    withCredentials: true,
  });
  // Set userId cookie (not HTTP-only, so frontend can read it)
  document.cookie = `userId=${response.data.user.id}; path=/; SameSite=Strict; max-age=3600`;
  return response.data;
};

export const getMe = async (userId: string): Promise<User> => {
  console.log("Fetching user with ID:", userId); // Debug log
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
  // Clear userId cookie
  document.cookie = "userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  return response.data;
};
