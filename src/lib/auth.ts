import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Get the current business ID from the cookie.
 * Redirects to /login if no cookie is set.
 */
export async function getBusinessId(): Promise<number> {
  const cookieStore = await cookies();
  const id = cookieStore.get("fikex_business_id")?.value;
  if (!id) redirect("/login");
  return parseInt(id, 10);
}
