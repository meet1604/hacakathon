import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const COOKIE_NAME = "mt_anon_id";
const ONE_YEAR = 60 * 60 * 24 * 365;

// Server-side: read or create a persistent anon ID via cookie
export async function getOrCreateAnonId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(COOKIE_NAME)?.value;
  if (existing) return existing;

  const fresh = randomUUID();
  try {
    cookieStore.set(COOKIE_NAME, fresh, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ONE_YEAR,
    });
  } catch {
    // Server Components — cookies() is read-only, ignore
  }
  return fresh;
}

// Client-side fallback (localStorage)
const STORAGE_KEY = "mt_anon_id";

export function getOrCreateAnonIdClient(): string {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const fresh = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, fresh);
  return fresh;
}

export function markAnonCheckUsed(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("mt_anon_used", "1");
}

export function hasAnonCheckBeenUsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("mt_anon_used") === "1";
}
