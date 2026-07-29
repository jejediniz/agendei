"use client";

import type { Session } from "next-auth";

type SessionUpdate = (
  data?: Record<string, unknown>,
) => Promise<Session | null | undefined>;

/**
 * Força refresh do JWT (POST /api/auth/session com trigger "update").
 * `update()` sem argumentos só faz GET e NÃO recarrega dados do banco.
 */
export async function syncSessionAndNavigate(
  update: SessionUpdate,
  href: string,
) {
  try {
    await update({ refresh: true });
  } finally {
    window.location.assign(href);
  }
}
