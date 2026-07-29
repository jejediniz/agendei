"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

/**
 * Sessão válida no cookie, mas sem usuário/negócio correspondente no banco
 * (ex.: conta removida). Encerramos a sessão e mandamos para o login, em vez
 * de prender a pessoa no onboarding.
 */
export function InvalidSessionRedirect() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void signOut({ callbackUrl: "/login" });
  }, []);

  return (
    <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-warm">
      <p className="font-display text-lg font-semibold text-foreground">
        Sessão expirada
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Redirecionando para o login…
      </p>
    </div>
  );
}
