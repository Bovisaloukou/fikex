import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySignature } from "@/lib/cookie-signature";

/**
 * Get the current business ID from the signed auth cookie.
 * Verifies the HMAC signature before returning the ID.
 * Redirects to /login if no cookie is set or signature is invalid.
 */
export async function getBusinessId(): Promise<number> {
  const cookieStore = await cookies();
  const authValue = cookieStore.get("fikex_auth")?.value;
  if (!authValue) redirect("/login");

  const dotIndex = authValue.lastIndexOf(".");
  if (dotIndex === -1) redirect("/login");

  const idStr = authValue.substring(0, dotIndex);
  const signature = authValue.substring(dotIndex + 1);

  if (!verifySignature(idStr, signature)) redirect("/login");

  const id = parseInt(idStr, 10);
  if (isNaN(id)) redirect("/login");

  return id;
}
