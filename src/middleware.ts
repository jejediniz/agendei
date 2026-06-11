import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { PlatformRole, SubscriptionStatus } from "@prisma/client";

const PUBLIC_ROUTES = ["/login", "/cadastro", "/precos"];
const PLATFORM_PREFIX = "/platform";
const ONBOARDING_ROUTE = "/onboarding";
const PLAN_ROUTE = "/configuracoes/plano";
const SETTINGS_PREFIX = "/configuracoes";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;

  const isPublic =
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/api/webhooks/");

  if (!isLoggedIn) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  const isPlatformAdmin = user?.platformRole === PlatformRole.PLATFORM_ADMIN;

  if (isPlatformAdmin) {
    if (pathname === "/login" || pathname === "/cadastro") {
      return NextResponse.redirect(new URL(PLATFORM_PREFIX, req.nextUrl));
    }
    if (pathname.startsWith(PLATFORM_PREFIX) || pathname.startsWith("/api/")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(PLATFORM_PREFIX, req.nextUrl));
  }

  if (pathname === "/login" || pathname === "/cadastro") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (!user?.organizationId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  const status = user.subscriptionStatus;
  const isExpired =
    status === SubscriptionStatus.EXPIRED ||
    status === SubscriptionStatus.CANCELLED;

  const isAllowedWhenExpired =
    pathname.startsWith(PLAN_ROUTE) ||
    pathname.startsWith(SETTINGS_PREFIX) ||
    pathname.startsWith("/api/auth");

  if (isExpired && !isAllowedWhenExpired && !pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL(PLAN_ROUTE, req.nextUrl));
  }

  const needsOnboarding = !user.onboardingCompleted;
  if (
    needsOnboarding &&
    pathname !== ONBOARDING_ROUTE &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith(SETTINGS_PREFIX)
  ) {
    return NextResponse.redirect(new URL(ONBOARDING_ROUTE, req.nextUrl));
  }

  if (!needsOnboarding && pathname === ONBOARDING_ROUTE) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
