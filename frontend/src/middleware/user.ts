// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { User } from "@/types/entities";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Check cookies
  const accessToken = request.cookies.get("access_token")?.value;
  const userId = request.cookies.get("userId")?.value;

  if (!accessToken || !userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Fetch user from /api/users/:id
    const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const user: User = await response.json();

    // Protect dashboard routes
    if (pathname.startsWith("/dashboard")) {
      const role = user.roles.name.toLowerCase();
      const allowedRoutes = [`/dashboard/${role}`];

      if (
        pathname === "/dashboard" ||
        allowedRoutes.some((route) => pathname.startsWith(route))
      ) {
        return NextResponse.next();
      }

      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
