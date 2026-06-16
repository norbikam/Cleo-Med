import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

const SHOP_PREFIXES = ["/catalog", "/cart", "/orders", "/account"];
const SKIP_GATE    = ["/gate", "/admin", "/landing", "/_next", "/favicon.ico"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdmin = pathname.startsWith("/admin");

  // ── Admin: check gm_session with admin role ──
  if (isAdmin) {
    const token = request.cookies.get("gm_session")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    try {
      const { payload } = await jwtVerify(token, secret) as { payload: { clientId: string; role: string } };
      if (payload.role !== "admin") return NextResponse.next();
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ── Gate check (everything except /gate, /admin, /landing, static) ──
  const skipGate = SKIP_GATE.some(p => pathname === p || pathname.startsWith(p + "/"));
  if (!skipGate) {
    const gateToken = request.cookies.get("gm_gate")?.value;
    if (!gateToken) return NextResponse.redirect(new URL("/gate", request.url));
    try {
      await jwtVerify(gateToken, secret);
    } catch {
      return NextResponse.redirect(new URL("/gate", request.url));
    }
  }

  // ── Shop routes: additionally need gm_session ──
  const isShop = SHOP_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"));
  if (isShop) {
    const token = request.cookies.get("gm_session")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    try {
      await jwtVerify(token, secret);
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|api/).*)"],
};
