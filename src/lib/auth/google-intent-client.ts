"use client";

import {
  GOOGLE_AUTH_INTENT_COOKIE,
  type GoogleAuthIntent,
} from "@/lib/auth/google-intent";

export function setGoogleAuthIntentCookie(intent: GoogleAuthIntent) {
  document.cookie = `${GOOGLE_AUTH_INTENT_COOKIE}=${intent}; path=/; max-age=600; samesite=lax`;
}
