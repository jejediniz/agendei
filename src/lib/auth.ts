import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { AccountType, MemberRole, PlatformRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { expireTrials } from "@/lib/billing/subscription";
import { linkGuestClientsToCustomer } from "@/lib/customer/link-clients";
import {
  clearGoogleAuthIntent,
  readGoogleAuthIntent,
} from "@/lib/auth/google-intent-server";
import {
  isBusinessAccount,
  isCustomerAccount,
} from "@/lib/auth/account-guards";

export type SessionUserPayload = {
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
  subscriptionStatus?: import("@prisma/client").SubscriptionStatus;
  onboardingCompleted?: boolean;
  trialEndsAt?: string;
};

async function loadUserSessionData(userId: string): Promise<SessionUserPayload | null> {
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

  if (user.accountType === AccountType.CUSTOMER) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      accountType: AccountType.CUSTOMER,
      platformRole: null,
    };
  }

  if (user.platformRole === PlatformRole.PLATFORM_ADMIN) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      accountType: AccountType.BUSINESS,
      platformRole: user.platformRole,
    };
  }

  const membership = user.memberships[0];
  if (!membership) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      accountType: AccountType.BUSINESS,
      platformRole: user.platformRole,
      onboardingCompleted: false,
    };
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    accountType: AccountType.BUSINESS,
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

async function upsertGoogleCustomer(profile: {
  sub: string;
  email: string;
  name?: string | null;
  picture?: string | null;
}): Promise<SessionUserPayload | null> {
  const existing = await prisma.user.findUnique({
    where: { email: profile.email },
    include: { memberships: { take: 1 } },
  });

  if (existing && isBusinessAccount(existing)) {
    return null;
  }

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          googleId: profile.sub,
          name: profile.name ?? existing.name,
          image: profile.picture ?? existing.image,
        },
      })
    : await prisma.user.create({
        data: {
          name: profile.name ?? profile.email,
          email: profile.email,
          googleId: profile.sub,
          image: profile.picture ?? null,
          accountType: AccountType.CUSTOMER,
          passwordHash: null,
        },
      });

  await linkGuestClientsToCustomer(user.id, { email: profile.email });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    accountType: AccountType.CUSTOMER,
    platformRole: null,
  };
}

async function upsertGoogleBusiness(profile: {
  sub: string;
  email: string;
  name?: string | null;
  picture?: string | null;
}): Promise<SessionUserPayload | null> {
  const existing = await prisma.user.findUnique({
    where: { email: profile.email },
  });

  if (existing?.platformRole === PlatformRole.PLATFORM_ADMIN) {
    return null;
  }

  let user = existing;

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: profile.name ?? profile.email,
        email: profile.email,
        googleId: profile.sub,
        image: profile.picture ?? null,
        accountType: AccountType.BUSINESS,
        passwordHash: null,
      },
    });
  } else if (user.accountType === AccountType.CUSTOMER) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        accountType: AccountType.BUSINESS,
        googleId: profile.sub,
        name: profile.name ?? user.name,
        image: profile.picture ?? user.image,
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: profile.sub,
        name: profile.name ?? user.name,
        image: profile.picture ?? user.image,
      },
    });
  }

  return loadUserSessionData(user.id);
}

function applySessionToToken(
  token: Record<string, unknown>,
  data: SessionUserPayload,
) {
  token.id = data.id;
  token.accountType = data.accountType;
  token.platformRole = data.platformRole ?? null;
  token.organizationId = data.organizationId;
  token.organizationSlug = data.organizationSlug;
  token.organizationName = data.organizationName;
  token.role = data.role;
  token.subscriptionStatus = data.subscriptionStatus;
  token.onboardingCompleted = data.onboardingCompleted;
  token.trialEndsAt = data.trialEndsAt;
  token.picture = data.image;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
        loginIntent: { label: "Intent", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const loginIntent = credentials.loginIntent as string | undefined;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { memberships: { take: 1 } },
        });
        if (!user || !user.passwordHash) return null;

        if (loginIntent === "customer" && isBusinessAccount(user)) {
          return null;
        }

        if (loginIntent === "business" && isCustomerAccount(user)) {
          return null;
        }

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
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;

      const googleProfile = profile as {
        sub?: string;
        email?: string;
        name?: string;
        picture?: string;
      };

      const sub = googleProfile.sub ?? account.providerAccountId;
      const email = googleProfile.email;

      if (!sub || !email) {
        return false;
      }

      const existing = await prisma.user.findUnique({
        where: { email },
        include: { memberships: { take: 1 } },
      });

      const intent = await readGoogleAuthIntent();

      if (intent === "customer") {
        if (existing && isBusinessAccount(existing)) {
          return "/login?area=cliente&error=ContaEmpresa";
        }
      } else if (existing?.platformRole === PlatformRole.PLATFORM_ADMIN) {
        return "/login?error=ContaPlataforma";
      }

      return true;
    },
    async jwt({ token, user, account, profile, trigger }) {
      if (account?.provider === "google" && profile) {
        const googleProfile = profile as {
          sub?: string;
          email?: string;
          name?: string;
          picture?: string;
        };

        const sub = googleProfile.sub ?? account.providerAccountId;
        const email = googleProfile.email;

        if (email && sub) {
          const intent = await readGoogleAuthIntent();
          await clearGoogleAuthIntent();

          const sessionData =
            intent === "customer"
              ? await upsertGoogleCustomer({
                  sub,
                  email,
                  name: googleProfile.name,
                  picture: googleProfile.picture,
                })
              : await upsertGoogleBusiness({
                  sub,
                  email,
                  name: googleProfile.name,
                  picture: googleProfile.picture,
                });

          if (sessionData) {
            applySessionToToken(token, sessionData);
          }
        }
      } else if (user) {
        applySessionToToken(token, user as SessionUserPayload);
      }

      // Só consulta o banco no trigger "update" (POST /api/auth/session no Node).
      // Nunca no Edge/middleware — Prisma quebra a sessão (JWTSessionError).
      const userId = (token.id ?? token.sub) as string | undefined;
      if (trigger === "update" && userId) {
        const fresh = await loadUserSessionData(userId);
        if (fresh) {
          applySessionToToken(token, fresh);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.accountType = token.accountType as AccountType;
        session.user.platformRole = token.platformRole as PlatformRole | null;
        session.user.organizationId = token.organizationId as string | undefined;
        session.user.organizationSlug = token.organizationSlug as string | undefined;
        session.user.organizationName = token.organizationName as string | undefined;
        session.user.role = token.role as MemberRole | undefined;
        session.user.subscriptionStatus = token.subscriptionStatus as
          | import("@prisma/client").SubscriptionStatus
          | undefined;
        session.user.onboardingCompleted = token.onboardingCompleted as
          | boolean
          | undefined;
        session.user.trialEndsAt = token.trialEndsAt as string | undefined;
        session.user.image =
          (token.picture as string | undefined) ?? session.user.image;
      }
      return session;
    },
  },
});
