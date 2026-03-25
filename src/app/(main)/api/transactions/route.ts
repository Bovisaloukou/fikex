import { type NextRequest } from "next/server";
import {
  getTransactions,
  getRecentTransactions,
  createTransaction,
  deleteTransaction,
} from "@/server/actions/transactions";

/**
 * GET /api/transactions?businessId=1&limit=20
 * List transactions for a business.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const businessId = searchParams.get("businessId");
  const limit = searchParams.get("limit");

  if (!businessId) {
    return Response.json(
      { error: "businessId is required" },
      { status: 400 }
    );
  }

  const id = parseInt(businessId, 10);
  if (isNaN(id)) {
    return Response.json(
      { error: "businessId must be a number" },
      { status: 400 }
    );
  }

  try {
    const data = limit
      ? await getRecentTransactions(id, parseInt(limit, 10))
      : await getTransactions(id);

    return Response.json({ transactions: data });
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return Response.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transactions
 * Create a transaction manually from the web interface.
 *
 * Body: { businessId, type, description, amount, category? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { businessId, type, description, amount, category } = body;

    if (!businessId || !type || !description || amount == null) {
      return Response.json(
        { error: "businessId, type, description, and amount are required" },
        { status: 400 }
      );
    }

    if (type !== "sale" && type !== "expense") {
      return Response.json(
        { error: 'type must be "sale" or "expense"' },
        { status: 400 }
      );
    }

    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return Response.json(
        { error: "amount must be a positive integer" },
        { status: 400 }
      );
    }

    const result = await createTransaction({
      businessId: parseInt(businessId, 10),
      type,
      description,
      amount: parsedAmount,
      category: category || "autre",
      source: "web",
      rawInput: `Web: ${description}`,
    });

    return Response.json({ transaction: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return Response.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/transactions?id=1
 * Delete a transaction by ID.
 */
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }

  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return Response.json(
      { error: "id must be a number" },
      { status: 400 }
    );
  }

  try {
    const result = await deleteTransaction(parsedId);

    if (result.length === 0) {
      return Response.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return Response.json({ deleted: result[0] });
  } catch (error) {
    console.error("DELETE /api/transactions error:", error);
    return Response.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
