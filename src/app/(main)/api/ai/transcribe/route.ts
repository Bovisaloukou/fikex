import { type NextRequest } from "next/server";
import { transcribeAudio } from "@/lib/ai";

/**
 * POST /api/ai/transcribe
 * Direct transcription endpoint for testing / web use.
 *
 * Expects: FormData with an "audio" file field.
 * Returns: { text: string }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return Response.json(
        { error: 'No "audio" file provided in form data' },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Optional language hint from form data (e.g., "fon", "yo", "fr")
    const language = formData.get("language") as string | null;
    console.log(`[FiKex API] Language from FormData: "${language}", type: ${typeof language}`);

    const result = await transcribeAudio(buffer, audioFile.name || "audio.ogg", language || undefined, audioFile.type || "audio/webm");
    console.log(`[FiKex API] Engine used: ${result.engine}, text: "${result.text}"`);

    return Response.json({ text: result.text, engine: result.engine });
  } catch (error) {
    console.error("POST /api/ai/transcribe error:", error);
    return Response.json(
      { error: "Transcription failed" },
      { status: 500 }
    );
  }
}
