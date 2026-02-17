import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { setSecurityHeaders } from "@/lib/security/headers";

export async function middleware(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua && request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (request.url.length > 8192) {
    return NextResponse.json({ error: "URI too long" }, { status: 414 });
  }
  const response = await updateSession(request);
  return setSecurityHeaders(response, request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
    "/auth/:path*",
    "/api/stripe/:path*",
    "/",
    "/terms",
    "/privacy",
    "/refund",
  ],
};
