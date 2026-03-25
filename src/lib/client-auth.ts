/**
 * Get business ID from the readable cookie (client-side).
 * The auth verification happens server-side via the HttpOnly signed cookie.
 * This readable cookie is only used for client components that need the ID
 * (e.g. API calls, offline sync).
 * Falls back to 1 if no cookie.
 */
export function getClientBusinessId(): number {
  if (typeof document === "undefined") return 1;
  const match = document.cookie.match(/fikex_business_id=(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}
