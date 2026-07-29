"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { syncSessionAndNavigate } from "@/lib/auth/sync-session";

/**
 * Onboarding já concluído no banco: atualiza o JWT e vai ao dashboard.
 * O middleware não bloqueia mais por onboardingCompleted (evita loop no Edge).
 */
export function PostOnboardingRedirect() {
  const { update, status } = useSession();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    if (status === "loading") return;
    started.current = true;
    void syncSessionAndNavigate(update, "/");
  }, [update, status]);

  return (
    <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
      <p className="font-display text-lg font-semibold text-foreground">
        Configuração concluída
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Redirecionando para o dashboard…
      </p>
    </div>
  );
}
