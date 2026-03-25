/**
 * Get business ID from cookie (client-side).
 * Falls back to 1 if no cookie.
 */
export function getClientBusinessId(): number {
  if (typeof document === "undefined") return 1;
  const match = document.cookie.match(/fikex_business_id=(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}
