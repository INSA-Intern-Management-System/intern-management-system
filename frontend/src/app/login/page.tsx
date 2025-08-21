"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { login } from "@/app/services/authService";
import { LoginData, AuthResponse, User } from "@/types/entities";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Check for existing user session
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) throw new Error("Not authenticated");
        return await response.json();
      } catch {
        return null;
      }
    },
    retry: false,
  });

  // Redirect if user is authenticated
  useEffect(() => {
    if (user && !isLoading) {
      router.push(`/dashboard/${user.roles.name.toLowerCase()}`);
    }
  }, [user, isLoading, router]);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data: AuthResponse) => {
      router.push(`/dashboard/${data.user.roles.name.toLowerCase()}`);
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.error ||
          "Check your email and password and try again."
      );
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/*  Navbar at the top */}
      <nav className="w-full flex items-center justify-between py-3 px-6 bg-white shadow-md">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image
            src="/logo.png" 
            alt="Logo"
            width={50}
            height={50}
            className="mr-2"
          />
           <span className="text-l font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                INSA 
              </span>
        </div>
      </nav>

      {/* ✅ Centered login form */}
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="text-3xl font-extrabold text-blue-800 mb-1">
              Welcome Back!
            </div>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="text-red-600 bg-red-100 border border-red-300 rounded px-3 py-2 mb-2 text-center">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 "
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
        
         
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
