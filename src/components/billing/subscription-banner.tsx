"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { SubscriptionStatus } from "@prisma/client";
import { AlertTriangle, Clock } from "lucide-react";
import { getTrialDaysRemaining } from "@/lib/billing/subscription";

export function SubscriptionBanner() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user?.subscriptionStatus) return null;

  if (user.subscriptionStatus === SubscriptionStatus.TRIAL && user.trialEndsAt) {
    const days = getTrialDaysRemaining(new Date(user.trialEndsAt));
    if (days <= 7) {
      return (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800/50 dark:bg-amber-900/30 dark:text-amber-200">
          <Clock className="h-5 w-5 shrink-0" />
          <p>
            Seu trial termina em <strong>{days} dia(s)</strong>.{" "}
            <Link href="/configuracoes/plano" className="font-medium underline">
              Assine agora
            </Link>{" "}
            para não perder o acesso.
          </p>
        </div>
      );
    }
  }

  if (user.subscriptionStatus === SubscriptionStatus.PAST_DUE) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-800/50 dark:bg-rose-900/30 dark:text-rose-200">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <p>
          Pagamento em atraso.{" "}
          <Link href="/configuracoes/plano" className="font-medium underline">
            Regularize sua assinatura
          </Link>
          .
        </p>
      </div>
    );
  }

  return null;
}
