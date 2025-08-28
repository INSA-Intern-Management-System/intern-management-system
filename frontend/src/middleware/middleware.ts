// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;

  // Protect API routes
  if (pathname.startsWith("/api")) {
    if (!accessToken) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!accessToken) {
      const redirectRes = NextResponse.redirect(new URL("/login", request.url));
      redirectRes.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );
      redirectRes.headers.set("Pragma", "no-cache");
      redirectRes.headers.set("Expires", "0");
      return redirectRes;
      // return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}
