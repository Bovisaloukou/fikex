import { type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { transcribeAudio, parseTransaction, ocrReceipt } from "@/lib/ai";
import { getOrCreateBusiness } from "@/server/actions/businesses";
import { createTransaction, createManyTransactions } from "@/server/actions/transactions";

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Send a text message back to the user via WhatsApp Cloud API.
 */
async function sendWhatsAppMessage(to: string, text: string) {
  const url = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("WhatsApp send error:", res.status, body);
  }
}

/**
 * Download a media file from WhatsApp Cloud API by its media ID.
 * Returns the raw file Buffer.
 */
async function downloadWhatsAppMedia(mediaId: string): Promise<Buffer> {
  // Step 1: get the download URL
  const metaRes = await fetch(
    `https://graph.facebook.com/v21.0/${mediaId}`,
    {
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
    }
  );
  const meta = await metaRes.json();
  const downloadUrl = meta.url as string;

  // Step 2: download the actual file
  const fileRes = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
  });

  const arrayBuffer = await fileRes.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ---------------------------------------------------------------------------
// GET — Webhook verification
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

// ---------------------------------------------------------------------------
// POST — Incoming messages
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // ---- Webhook signature validation ----
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  const rawBody = await request.text();

  if (appSecret) {
    const signature = request.headers.get("x-hub-signature-256");
    if (!signature) {
      console.error("WhatsApp webhook: missing x-hub-signature-256 header");
      return new Response("Unauthorized", { status: 401 });
    }

    const expectedHash = createHmac("sha256", appSecret)
      .update(rawBody)
      .digest("hex");
    const expectedSignature = `sha256=${expectedHash}`;

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      console.error("WhatsApp webhook: invalid signature");
      return new Response("Unauthorized", { status: 401 });
    }
  } else {
    console.warn(
      "WHATSAPP_APP_SECRET is not set — skipping webhook signature validation. " +
        "Set it in production to secure your endpoint."
    );
  }

  try {
    const body = JSON.parse(rawBody);

    // WhatsApp sends various webhook events; we only care about messages
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      // Not a message event (e.g. status update) — acknowledge anyway
      return Response.json({ status: "ok" });
    }

    const from = message.from as string; // sender phone number
    const messageType = message.type as string;

    // Find or create the business for this phone number
    const business = await getOrCreateBusiness({ phone: from });

    if (messageType === "text") {
      await handleTextMessage(from, message.text.body, business.id);
    } else if (messageType === "audio") {
      await handleAudioMessage(from, message.audio.id, business.id);
    } else if (messageType === "image") {
      await handleImageMessage(from, message.image.id, business.id);
    } else {
      await sendWhatsAppMessage(
        from,
        "Envoyez un message texte, une note vocale, ou une photo de recu pour enregistrer une transaction."
      );
    }
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
  }

  // Always return 200 to prevent WhatsApp from retrying
  return Response.json({ status: "ok" });
}

// ---------------------------------------------------------------------------
// Message handlers
// ---------------------------------------------------------------------------

async function handleTextMessage(
  from: string,
  text: string,
  businessId: number
) {
  const parsed = await parseTransaction(text, businessId, "whatsapp");

  if (!parsed) {
    await sendWhatsAppMessage(
      from,
      "Je n'ai pas compris cette transaction. Essayez par exemple:\n" +
        '"J\'ai vendu 3 sacs de riz a 5000 chacun"\n' +
        '"Depense transport 2000 FCFA"'
    );
    return;
  }

  await createTransaction(parsed);

  const label = parsed.type === "sale" ? "Vente" : "Depense";
  await sendWhatsAppMessage(
    from,
    `${label} enregistree!\n` +
      `Montant: ${parsed.amount} FCFA\n` +
      `Description: ${parsed.description}\n` +
      `Categorie: ${parsed.category}`
  );
}

async function handleAudioMessage(
  from: string,
  mediaId: string,
  businessId: number
) {
  try {
    await sendWhatsAppMessage(from, "Transcription en cours...");

    const audioBuffer = await downloadWhatsAppMedia(mediaId);
    const { text: transcription } = await transcribeAudio(audioBuffer, "voice.ogg");

    const parsed = await parseTransaction(
      transcription,
      businessId,
      "whatsapp"
    );

    if (!parsed) {
      await sendWhatsAppMessage(
        from,
        `J'ai entendu: "${transcription}"\n\n` +
          "Mais je n'ai pas pu identifier une transaction. Reessayez."
      );
      return;
    }

    await createTransaction(parsed);

    const label = parsed.type === "sale" ? "Vente" : "Depense";
    await sendWhatsAppMessage(
      from,
      `${label} enregistree!\n` +
        `Montant: ${parsed.amount} FCFA\n` +
        `Description: ${parsed.description}\n` +
        `Categorie: ${parsed.category}\n\n` +
        `(Transcription: "${transcription}")`
    );
  } catch (error) {
    console.error("Audio processing error:", error);
    await sendWhatsAppMessage(
      from,
      "Erreur lors du traitement de la note vocale. Reessayez."
    );
  }
}

async function handleImageMessage(
  from: string,
  mediaId: string,
  businessId: number
) {
  try {
    await sendWhatsAppMessage(from, "Analyse du recu en cours...");

    const imageBuffer = await downloadWhatsAppMedia(mediaId);
    const imageBase64 = imageBuffer.toString("base64");

    const ocrTransactions = await ocrReceipt(imageBase64, businessId);

    if (ocrTransactions.length === 0) {
      await sendWhatsAppMessage(
        from,
        "Je n'ai pas pu extraire de transactions de cette image. " +
          "Assurez-vous que le recu est bien lisible."
      );
      return;
    }

    await createManyTransactions(ocrTransactions);

    const summary = ocrTransactions
      .map((t) => {
        const label = t.type === "sale" ? "Vente" : "Depense";
        return `- ${label}: ${t.amount} FCFA (${t.description})`;
      })
      .join("\n");

    await sendWhatsAppMessage(
      from,
      `${ocrTransactions.length} transaction(s) extraite(s) du recu:\n${summary}`
    );
  } catch (error) {
    console.error("Image processing error:", error);
    await sendWhatsAppMessage(
      from,
      "Erreur lors du traitement de l'image. Reessayez."
    );
  }
}
