import { createHmac } from "crypto";

const COOKIE_SECRET =
  process.env.COOKIE_SECRET ?? "fikex-dev-secret-change-in-production";

export function signValue(value: string): string {
  return createHmac("sha256", COOKIE_SECRET).update(value).digest("hex");
}

export function verifySignature(
  value: string,
  signature: string
): boolean {
  const expected = signValue(value);
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}
