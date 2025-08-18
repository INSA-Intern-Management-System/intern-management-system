
"use client";
import { getMe, login } from "@/services/authService";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Link } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true); // NEW
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const cookies = document.cookie.split("; ");
        const userId = cookies
          .find((cookie) => cookie.startsWith("userId="))
          ?.split("=")[1];

        if (!userId) {
          setCheckingAuth(false); // Not logged in, show form
          return;
        }

        const user = await getMe(userId);
        if (user) {
          // Redirect immediately without showing login
          switch (user.roles.name?.toLowerCase()) {
            case "student":
              router.replace("/dashboard/student");
              break;
            case "company":
              router.replace("/dashboard/company");
              break;
            case "university":
              router.replace("/dashboard/university");
              break;
            case "admin":
              router.replace("/dashboard/admin");
              break;
            default:
              router.replace("/dashboard");
          }
        } else {
          setCheckingAuth(false); // No valid user, show form
        }
      } catch (error) {
        console.error("Not authenticated", error);
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loginResponse = await login(formData);

      switch (loginResponse.user.roles.name?.toLowerCase()) {
        case "student":
          router.replace("/dashboard/student");
          break;
        case "company":
          router.replace("/dashboard/company");
          break;
        case "university":
          router.replace("/dashboard/university");
          break;
        case "admin":
          router.replace("/dashboard/admin");
          break;
        default:
          router.replace("/dashboard");
      }
    } catch (err) {
      console.error("Login failed", err);
      alert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // Don't render form while checking auth
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid" />
        <span className="ml-4 text-blue-700 font-semibold">
          Checking login status...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="text-3xl font-extrabold text-blue-800 mb-1">
            Welcome Back!
          </div>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="absolute right-0 top-0 h-full px-3 py-2 bg-blue-200 hover:bg-blue-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



