"use client";

import type { Session } from "next-auth";

export async function syncSessionAndNavigate(
  update: () => Promise<Session | null | undefined>,
  href: string,
) {
  try {
    await update();
  } finally {
    window.location.assign(href);
  }
}
