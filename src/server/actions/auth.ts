"use server";

import { cookies } from "next/headers";
import { signValue } from "@/lib/cookie-signature";

const AUTH_COOKIE = "fikex_auth";
const ID_COOKIE = "fikex_business_id";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Set the auth cookies after login/registration.
 * - fikex_auth: HttpOnly signed cookie for server-side verification
 * - fikex_business_id: readable cookie for client-side use
 */
export async function setAuthCookie(businessId: number): Promise<void> {
  const cookieStore = await cookies();
  const idStr = String(businessId);
  const signature = signValue(idStr);

  cookieStore.set(AUTH_COOKIE, `${idStr}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });

  cookieStore.set(ID_COOKIE, idStr, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/**
 * Clear both auth cookies (logout).
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  cookieStore.delete(ID_COOKIE);
}
