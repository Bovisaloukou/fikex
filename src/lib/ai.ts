import { openai } from "./openai";
import type { NewTransaction } from "@/server/db/schema";

/**
 * Transcribe audio using Meta MMS (Fon, Yoruba, African languages)
 * via HuggingFace Inference API
 */
async function transcribeWithMMS(
  audioBuffer: Buffer,
  mimeType: string = "audio/webm"
): Promise<string> {
  const endpointUrl = process.env.MMS_ENDPOINT_URL;
  if (!endpointUrl) {
    throw new Error("MMS_ENDPOINT_URL not configured");
  }

  const response = await fetch(endpointUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
      "Content-Type": mimeType,
    },
    body: new Uint8Array(audioBuffer),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[MMS] Error:", response.status, error);
    throw new Error(`MMS transcription failed: ${response.status}`);
  }

  const result = await response.json();
  // HuggingFace Inference Endpoints ASR returns { text: "..." } or [{ text: "..." }]
  if (Array.isArray(result)) {
    return result[0]?.text || "";
  }
  return result.text || "";
}

/**
 * Transcribe audio using OpenAI Whisper (French, English)
 */
async function transcribeWithWhisper(
  audioBuffer: Buffer,
  filename: string,
  language?: string
): Promise<string> {
  const file = new File([new Uint8Array(audioBuffer)], filename, { type: "audio/ogg" });

  // Prompt hint helps Whisper with context and vocabulary
  const prompts: Record<string, string> = {
    fon: "Transcription en Fon (langue du Bénin). Vocabulaire courant: xɔ (acheter), sa (vendre), akwɛ (argent), francs, FCFA, banane, riz, ciment, igname, maïs, huile, tomate, poisson, viande, tissu, savon, essence, moto, taxi.",
    yo: "Transcription en Yoruba. Vocabulaire courant: ra (acheter), ta (vendre), owo (argent), francs, FCFA, banane, riz, ciment, igname, maïs, huile, tomate, poisson, viande.",
  };

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    ...(language && prompts[language] ? { prompt: prompts[language] } : {}),
  });

  return transcription.text;
}

/**
 * Transcribe audio with automatic language routing:
 * - If language is "fon" or "yo" → Meta MMS (HuggingFace)
 * - Otherwise → OpenAI Whisper (best for French)
 *
 * @param language - Optional language hint: "fr", "fon", "yo"
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string,
  language?: string,
  mimeType?: string
): Promise<{ text: string; engine: "whisper" | "mms" }> {
  const lang = language?.toLowerCase();

  // Try Meta MMS for Fon, Yoruba — fallback to Whisper if it fails
  if (lang === "fon" || lang === "yo" || lang === "yoruba") {
    try {
      console.log(`[FiKex] Trying Meta MMS for language: ${lang}, mime: ${mimeType}`);
      const text = await transcribeWithMMS(audioBuffer, mimeType || "audio/webm");
      if (text) return { text, engine: "mms" };
    } catch (err) {
      console.warn(`[FiKex] MMS failed, falling back to Whisper:`, err);
    }
  }

  // Use Whisper for French and auto-detect (also fallback for Fon/Yoruba)
  console.log(`[FiKex] Using Whisper for language: ${lang || "auto"}`);
  const text = await transcribeWithWhisper(audioBuffer, filename, lang);
  return { text, engine: "whisper" };
}

/**
 * Parse natural language (any language) into a structured transaction
 */
export async function parseTransaction(
  text: string,
  businessId: number,
  source: "whatsapp" | "ussd" | "web" | "ocr"
): Promise<Omit<NewTransaction, "id" | "createdAt"> | null> {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Tu es un assistant comptable pour les petites entreprises au Bénin.
Analyse le texte de l'utilisateur et extrais la transaction financière.

Réponds TOUJOURS en JSON avec ce format exact :
{
  "type": "sale" ou "expense",
  "description": "description détaillée en français incluant les quantités et prix unitaires si mentionnés (ex: 'Achat de bananes pour 500 FCFA')",
  "amount": nombre entier en FCFA (pas de décimales),
  "category": une parmi ["alimentation", "transport", "marchandise", "service", "loyer", "salaire", "equipement", "communication", "autre"],
  "valid": true ou false
}

REGLES IMPORTANTES :
- Si un montant est mentionné (même sans verbe d'achat/vente explicite), c'est VALIDE. Infère le type.
- "c'est 100 francs" ou "100 francs pour banane" → valide, type "expense" par défaut.
- En cas de doute sur le type (vente ou dépense), choisis "expense" (dépense).
- Le texte peut être en Fon, Yoruba, ou Français (parfois mal transcrit par la reconnaissance vocale).
- Sois tolérant avec les fautes et les transcriptions approximatives.
- Retourne {"valid": false} UNIQUEMENT si aucun montant n'est détectable.
- Si des quantités et prix unitaires sont mentionnés, calcule le montant total.

Exemples :
- "banane 500 francs" → expense, "Achat de bananes pour 500 FCFA", 500
- "j'ai vendu du riz à 15000" → sale, "Vente de riz pour 15 000 FCFA", 15000
- "c'est 100 francs" → expense, "Dépense de 100 FCFA", 100
- "Mo sa nùkún atikún mɛta 5000 5000" → sale, "Vente de 3 sacs de ciment à 5 000 FCFA chacun", 15000`,
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return null;

  try {
    const parsed = JSON.parse(content);
    if (!parsed.valid) return null;

    return {
      businessId,
      type: parsed.type,
      description: parsed.description,
      amount: Math.round(parsed.amount),
      category: parsed.category,
      source,
      rawInput: text,
    };
  } catch {
    return null;
  }
}

/**
 * Extract transaction data from a receipt/document image using GPT-4.1-mini Vision
 */
export async function ocrReceipt(
  imageBase64: string,
  businessId: number
): Promise<Array<Omit<NewTransaction, "id" | "createdAt">>> {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Tu es un assistant comptable pour les petites entreprises au Bénin.
Analyse cette image de reçu/facture et extrais TOUTES les transactions.

Réponds en JSON :
{
  "transactions": [
    {
      "type": "sale" ou "expense",
      "description": "description courte",
      "amount": nombre entier en FCFA,
      "category": une parmi ["alimentation", "transport", "marchandise", "service", "loyer", "salaire", "equipement", "communication", "autre"]
    }
  ],
  "vendor": "nom du vendeur si visible",
  "date": "date si visible au format YYYY-MM-DD"
}`,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
          {
            type: "text",
            text: "Extrais les transactions de ce reçu/facture.",
          },
        ],
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return [];

  try {
    const parsed = JSON.parse(content);
    return (parsed.transactions || []).map(
      (t: { type: string; description: string; amount: number; category: string }) => ({
        businessId,
        type: t.type as "sale" | "expense",
        description: t.description,
        amount: Math.round(t.amount),
        category: t.category,
        source: "ocr" as const,
        rawInput: `OCR: ${parsed.vendor || "unknown"} - ${parsed.date || "unknown"}`,
      })
    );
  } catch {
    return [];
  }
}
