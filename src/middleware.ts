import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { setSecurityHeaders } from "@/lib/security/headers";
import { applyMiddlewareRateLimit } from "@/lib/security/middleware-rate-limit";
import { applyWaf } from "@/lib/security/waf";

export async function middleware(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua && request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (request.url.length > 8192) {
    return NextResponse.json({ error: "URI too long" }, { status: 414 });
  }

  // WAF-lite: reject scanner UAs, vuln-endpoint probes, path traversal,
  // SQLi query patterns. Cheapest first — runs before Supabase / Upstash.
  const wafBlock = applyWaf(request);
  if (wafBlock) return setSecurityHeaders(wafBlock, request);

  // Middleware-level rate limit on every /api/* request. Webhooks and
  // cron are exempt — they're authenticated by signature / secret.
  const rl = await applyMiddlewareRateLimit(request);
  if (rl) return setSecurityHeaders(rl, request);
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
