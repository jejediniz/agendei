import {
  AccountType,
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
    image?: string | null;
    accountType?: AccountType;
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
      image?: string | null;
      accountType: AccountType;
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
    accountType?: AccountType;
    platformRole?: PlatformRole | null;
    organizationId?: string;
    organizationSlug?: string;
    organizationName?: string;
    role?: MemberRole;
    subscriptionStatus?: SubscriptionStatus;
    onboardingCompleted?: boolean;
    trialEndsAt?: string;
    picture?: string;
  }
}
