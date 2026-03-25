import { type NextRequest } from "next/server";
import { getOrCreateBusiness, updateBusiness } from "@/server/actions/businesses";
import { createTransaction } from "@/server/actions/transactions";
import { getDashboardStats } from "@/server/actions/dashboard";

/**
 * Africa's Talking USSD callback handler.
 *
 * The `text` field from AT is a `*`-separated breadcrumb of all user inputs
 * in the current session. For example, choosing option 1 then typing "5000"
 * yields text = "1*5000".
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const sessionId = formData.get("sessionId") as string;
  const serviceCode = formData.get("serviceCode") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const text = (formData.get("text") as string) || "";

  // Split user inputs into menu levels
  const levels = text === "" ? [] : text.split("*");

  const business = await getOrCreateBusiness({ phone: phoneNumber });

  let response = "";

  try {
    if (levels.length === 0) {
      // Main menu
      response =
        "CON Bienvenue sur FiKex!\n" +
        "1. Enregistrer une vente\n" +
        "2. Enregistrer une depense\n" +
        "3. Voir le solde du mois\n" +
        "4. Changer la langue";
    } else if (levels[0] === "1") {
      // --- Sale flow ---
      response = handleTransactionFlow(levels, "sale", business.id);
    } else if (levels[0] === "2") {
      // --- Expense flow ---
      response = handleTransactionFlow(levels, "expense", business.id);
    } else if (levels[0] === "3") {
      // --- Balance ---
      const stats = await getDashboardStats(business.id);
      response =
        `END Ce mois: Ventes: ${stats.totalSales} FCFA | ` +
        `Depenses: ${stats.totalExpenses} FCFA | ` +
        `Solde: ${stats.netProfit} FCFA`;
    } else if (levels[0] === "4") {
      // --- Language change flow ---
      if (levels.length === 1) {
        response = "CON Choisissez votre langue:\n1. Francais\n2. Fon\n3. Yoruba";
      } else {
        const langMap: Record<string, string> = {
          "1": "fr",
          "2": "fon",
          "3": "yo",
        };
        const lang = langMap[levels[1]] || "fr";
        await updateBusiness(business.id, { language: lang });
        response = "END Langue mise a jour!";
      }
    } else {
      response = "END Option invalide. Reessayez.";
    }
  } catch (error) {
    console.error("USSD error:", error);
    response = "END Une erreur est survenue. Reessayez plus tard.";
  }

  // For transaction flows that need async (createTransaction), we handle
  // them separately since the helper above is sync for the first two levels.
  if (
    (levels[0] === "1" || levels[0] === "2") &&
    levels.length === 3
  ) {
    const type = levels[0] === "1" ? "sale" : "expense";
    const amount = parseInt(levels[1], 10);
    const description = levels[2];

    if (!isNaN(amount) && amount > 0 && description) {
      try {
        await createTransaction({
          businessId: business.id,
          type,
          description,
          amount,
          category: "autre",
          source: "ussd",
          rawInput: `USSD: ${text}`,
        });

        const label = type === "sale" ? "Vente" : "Depense";
        response = `END ${label} de ${amount} FCFA enregistree! ${description}`;
      } catch (error) {
        console.error("USSD transaction error:", error);
        response = "END Erreur lors de l'enregistrement. Reessayez.";
      }
    } else {
      response = "END Montant invalide. Reessayez.";
    }
  }

  return new Response(response, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

/**
 * Synchronous helper that returns the appropriate CON/END prompt
 * for a transaction flow (sale or expense). The actual DB write
 * happens in the caller for the final (3rd) level.
 */
function handleTransactionFlow(
  levels: string[],
  type: "sale" | "expense",
  businessId: number
): string {
  if (levels.length === 1) {
    return "CON Entrez le montant (FCFA):";
  }

  if (levels.length === 2) {
    const amount = parseInt(levels[1], 10);
    if (isNaN(amount) || amount <= 0) {
      return "END Montant invalide. Reessayez.";
    }
    return "CON Description courte:";
  }

  // levels.length === 3 is handled in the caller (needs async)
  // Return empty string as placeholder; caller will overwrite it.
  return "";
}
