/**
 * Get business ID from cookie (client-side).
 * Falls back to 1 if no cookie.
 */
export function getClientBusinessId(): number {
  if (typeof document === "undefined") return 1;
  const match = document.cookie.match(/fikex_business_id=(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

/**
 * Set a cookie (client-side). Extracted to avoid React Compiler immutability errors.
 */
export function setCookie(name: string, value: string, maxAge = 60 * 60 * 24 * 365): void {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
}

export function clearCookie(name: string): void {
  setCookie(name, "", 0);
}
