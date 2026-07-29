import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  AccountType,
  PlatformRole,
  SubscriptionStatus,
} from "@prisma/client";
import {
  isCustomerAppointmentsPath,
  isPublicBookingPath,
  parseBookingPath,
} from "@/lib/constants/reserved-slugs";

const PUBLIC_ROUTES = ["/login", "/cadastro", "/cadastro-cliente", "/precos"];
const CUSTOMER_ALLOWED_PATHS = new Set(["/login", "/precos", "/cadastro-cliente"]);
const PLATFORM_PREFIX = "/platform";
const ONBOARDING_ROUTE = "/onboarding";
const PLAN_ROUTE = "/configuracoes/plano";
const SETTINGS_PREFIX = "/configuracoes";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  const isBookingArea = isPublicBookingPath(pathname);
  const isCustomerAppointments = isCustomerAppointmentsPath(pathname);

  const isPublic =
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/api/webhooks/") ||
    isBookingArea;

  if (isCustomerAppointments) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/api/auth/signin/google", req.nextUrl);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    if (user?.accountType !== AccountType.CUSTOMER) {
      const slug = parseBookingPath(pathname)?.slug;
      return NextResponse.redirect(
        new URL(slug ? `/${slug}` : "/precos", req.nextUrl),
      );
    }
  }

  if (!isLoggedIn) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  const isCustomer = user?.accountType === AccountType.CUSTOMER;

  if (isCustomer) {
    if (
      isBookingArea ||
      pathname.startsWith("/api/auth") ||
      CUSTOMER_ALLOWED_PATHS.has(pathname)
    ) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  const isPlatformAdmin = user?.platformRole === PlatformRole.PLATFORM_ADMIN;

  if (isPlatformAdmin) {
    if (pathname === "/login" || pathname === "/cadastro") {
      return NextResponse.redirect(new URL(PLATFORM_PREFIX, req.nextUrl));
    }
    if (
      pathname.startsWith(PLATFORM_PREFIX) ||
      pathname.startsWith("/api/") ||
      isBookingArea
    ) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(PLATFORM_PREFIX, req.nextUrl));
  }

  if (pathname === "/login" || pathname === "/cadastro") {
    if (user?.organizationId) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (isBookingArea) {
    return NextResponse.next();
  }

  if (!user?.organizationId) {
    if (
      pathname === ONBOARDING_ROUTE ||
      pathname.startsWith("/api/auth")
    ) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(ONBOARDING_ROUTE, req.nextUrl));
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

  // Onboarding concluído/ incompleto é validado no servidor (DB) em
  // /onboarding e no layout do dashboard — não no JWT do Edge,
  // para evitar loop e Prisma no middleware.

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
