import { type NextRequest } from "next/server";
import { ocrReceipt } from "@/lib/ai";
import { aiRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/ai/ocr
 * Direct OCR endpoint for testing / web use.
 *
 * Expects: FormData with an "image" file field and a "businessId" string field.
 * Returns: { transactions: Array<...> }
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const { success, remaining, resetAt } = aiRateLimit.check(ip);

  if (!success) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": resetAt.toString(),
        },
      }
    );
  }

  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const businessIdStr = formData.get("businessId") as string | null;

    if (!imageFile) {
      return Response.json(
        { error: 'No "image" file provided in form data' },
        { status: 400 }
      );
    }

    if (!businessIdStr) {
      return Response.json(
        { error: "businessId is required" },
        { status: 400 }
      );
    }

    const businessId = parseInt(businessIdStr, 10);
    if (isNaN(businessId)) {
      return Response.json(
        { error: "businessId must be a number" },
        { status: 400 }
      );
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageBase64 = buffer.toString("base64");

    const transactions = await ocrReceipt(imageBase64, businessId);

    return Response.json({ transactions });
  } catch (error) {
    console.error("POST /api/ai/ocr error:", error);
    return Response.json(
      { error: "OCR processing failed" },
      { status: 500 }
    );
  }
}
