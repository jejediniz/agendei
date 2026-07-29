import { cookies } from "next/headers";
import {
  GOOGLE_AUTH_INTENT_COOKIE,
  type GoogleAuthIntent,
} from "@/lib/auth/google-intent";

export async function readGoogleAuthIntent(): Promise<GoogleAuthIntent> {
  const cookieStore = await cookies();
  const value = cookieStore.get(GOOGLE_AUTH_INTENT_COOKIE)?.value;
  return value === "customer" ? "customer" : "business";
}

export async function clearGoogleAuthIntent() {
  const cookieStore = await cookies();
  cookieStore.delete(GOOGLE_AUTH_INTENT_COOKIE);
}
