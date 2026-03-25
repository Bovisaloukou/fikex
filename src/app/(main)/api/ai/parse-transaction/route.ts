import { type NextRequest } from "next/server";
import { parseTransaction } from "@/lib/ai";

/**
 * POST /api/ai/parse-transaction
 * Direct transaction parsing endpoint for testing / web use.
 *
 * Body: { text: string, businessId: number }
 * Returns: parsed transaction object or error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { text, businessId } = body;

    if (!text || businessId == null) {
      return Response.json(
        { error: "text and businessId are required" },
        { status: 400 }
      );
    }

    const result = await parseTransaction(text, businessId, "web");

    if (!result) {
      return Response.json(
        { error: "Could not parse a valid transaction from the provided text" },
        { status: 422 }
      );
    }

    return Response.json({ transaction: result });
  } catch (error) {
    console.error("POST /api/ai/parse-transaction error:", error);
    return Response.json(
      { error: "Transaction parsing failed" },
      { status: 500 }
    );
  }
}
