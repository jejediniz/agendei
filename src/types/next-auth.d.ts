import {
  MemberRole,
  PlatformRole,
  SubscriptionStatus,
} from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    platformRole?: PlatformRole | null;
    organizationId?: string;
    organizationSlug?: string;
    organizationName?: string;
    role?: MemberRole;
    subscriptionStatus?: SubscriptionStatus;
    onboardingCompleted?: boolean;
    trialEndsAt?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      platformRole?: PlatformRole | null;
      organizationId?: string;
      organizationSlug?: string;
      organizationName?: string;
      role?: MemberRole;
      subscriptionStatus?: SubscriptionStatus;
      onboardingCompleted?: boolean;
      trialEndsAt?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    platformRole?: PlatformRole | null;
    organizationId?: string;
    organizationSlug?: string;
    organizationName?: string;
    role?: MemberRole;
    subscriptionStatus?: SubscriptionStatus;
    onboardingCompleted?: boolean;
    trialEndsAt?: string;
  }
}
