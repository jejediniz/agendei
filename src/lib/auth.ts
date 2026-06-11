import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { MemberRole, PlatformRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { expireTrials } from "@/lib/billing/subscription";

async function loadUserSessionData(userId: string) {
  await expireTrials();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        include: { organization: true },
        take: 1,
      },
    },
  });

  if (!user) return null;

  if (user.platformRole === PlatformRole.PLATFORM_ADMIN) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      platformRole: user.platformRole,
    };
  }

  const membership = user.memberships[0];
  if (!membership) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    platformRole: user.platformRole,
    organizationId: membership.organizationId,
    organizationSlug: membership.organization.slug,
    organizationName: membership.organization.name,
    role: membership.role,
    subscriptionStatus: membership.organization.subscriptionStatus,
    onboardingCompleted: !!membership.organization.onboardingCompletedAt,
    trialEndsAt: membership.organization.trialEndsAt?.toISOString(),
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        const sessionData = await loadUserSessionData(user.id);
        if (!sessionData) return null;

        return sessionData;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.platformRole = user.platformRole;
        token.organizationId = user.organizationId;
        token.organizationSlug = user.organizationSlug;
        token.organizationName = user.organizationName;
        token.role = user.role;
        token.subscriptionStatus = user.subscriptionStatus;
        token.onboardingCompleted = user.onboardingCompleted;
        token.trialEndsAt = user.trialEndsAt;
      }

      if (trigger === "update" && token.id) {
        const fresh = await loadUserSessionData(token.id as string);
        if (fresh) {
          token.platformRole = fresh.platformRole;
          token.organizationId = fresh.organizationId;
          token.organizationSlug = fresh.organizationSlug;
          token.organizationName = fresh.organizationName;
          token.role = fresh.role;
          token.subscriptionStatus = fresh.subscriptionStatus;
          token.onboardingCompleted = fresh.onboardingCompleted;
          token.trialEndsAt = fresh.trialEndsAt;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.platformRole = token.platformRole as PlatformRole | null;
        session.user.organizationId = token.organizationId as string | undefined;
        session.user.organizationSlug = token.organizationSlug as string | undefined;
        session.user.organizationName = token.organizationName as string | undefined;
        session.user.role = token.role as MemberRole | undefined;
        session.user.subscriptionStatus = token.subscriptionStatus as
          | import("@prisma/client").SubscriptionStatus
          | undefined;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
        session.user.trialEndsAt = token.trialEndsAt as string | undefined;
      }
      return session;
    },
  },
});
