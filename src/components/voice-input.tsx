"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Mic, Loader2, WifiOff } from "lucide-react";
import { getClientBusinessId } from "@/lib/client-auth";
import { createLocalTransaction } from "@/lib/create-local-transaction";
import { useNetworkStatus } from "@/lib/use-network-status";

type VoiceStatus = "idle" | "recording" | "transcribing" | "parsing" | "confirm";

interface ParsedTransaction {
  type: "sale" | "expense";
  description: string;
  amount: number;
  category: string;
  businessId: number;
  source: string;
  rawInput: string;
}

export function VoiceInput({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [language, setLanguage] = useState<string>("fr");
  const [transaction, setTransaction] = useState<ParsedTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isOnline = useNetworkStatus();
  const languageRef = useRef(language);
  useEffect(() => { languageRef.current = language; }, [language]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const reset = useCallback(() => {
    setStatus("idle");
    setTransaction(null);
    setError(null);
    setSaving(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

        // Step 1: Transcribe
        setStatus("transcribing");
        try {
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");
          formData.append("language", languageRef.current);

          const transcribeRes = await fetch("/api/ai/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!transcribeRes.ok) {
            throw new Error("La transcription a echoue");
          }

          const { text } = await transcribeRes.json();

          // Step 2: Parse transaction
          setStatus("parsing");
          const parseRes = await fetch("/api/ai/parse-transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, businessId: getClientBusinessId() }),
          });

          if (!parseRes.ok) {
            throw new Error("Impossible d'extraire une transaction du texte");
          }

          const { transaction: parsed } = await parseRes.json();
          setTransaction(parsed);
          setStatus("confirm");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Une erreur est survenue");
          setStatus("idle");
        }
      };

      mediaRecorder.start();
      setStatus("recording");
    } catch {
      setError("Impossible d'acceder au microphone. Verifiez les permissions.");
      setStatus("idle");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleMicPress = useCallback(() => {
    if (status === "idle") {
      startRecording();
    } else if (status === "recording") {
      stopRecording();
    }
  }, [status, startRecording, stopRecording]);

  const handleConfirm = useCallback(async () => {
    if (!transaction) return;
    setSaving(true);
    try {
      await createLocalTransaction({
        businessId: transaction.businessId,
        type: transaction.type,
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        source: "web",
        rawInput: transaction.rawInput,
      });

      if (navigator.onLine) router.refresh();
      handleClose();
    } catch {
      setError("Echec de l'enregistrement. Reessayez.");
      setSaving(false);
    }
  }, [transaction, router, handleClose]);

  if (!isOpen) return null;

  const statusText =
    status === "idle"
      ? "Appuyez pour parler"
      : status === "recording"
        ? "Ecoute en cours..."
        : status === "transcribing"
          ? "Transcription..."
          : status === "parsing"
            ? "Traitement..."
            : "";

  return (
    <div className="fixed inset-0 z-[60] flex items-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Bottom sheet */}
      <div className="relative w-full max-w-md mx-auto bg-white rounded-t-3xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-semibold text-foreground">Enregistrement vocal</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8">
          {!isOnline && status === "idle" ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <WifiOff className="h-10 w-10 text-muted" />
              <p className="text-muted font-medium">Connexion requise</p>
              <p className="text-sm text-muted text-center px-4">
                L&apos;enregistrement vocal n&eacute;cessite une connexion internet.
                Utilisez la saisie manuelle hors ligne.
              </p>
            </div>
          ) : status !== "confirm" ? (
            <div className="flex flex-col items-center gap-6 py-8">
              {/* Language selector */}
              {status === "idle" && (
                <div className="flex items-center gap-2">
                  {[
                    { code: "fr", label: "Français" },
                    { code: "fon", label: "Fon" },
                    { code: "yo", label: "Yoruba" },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                        language === lang.code
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Mic button */}
              <button
                type="button"
                onClick={handleMicPress}
                disabled={status === "transcribing" || status === "parsing"}
                className={`flex items-center justify-center w-24 h-24 rounded-full transition-all cursor-pointer ${
                  status === "recording"
                    ? "bg-primary animate-pulse shadow-lg shadow-primary/40"
                    : status === "transcribing" || status === "parsing"
                      ? "bg-muted-foreground/30 cursor-not-allowed"
                      : "bg-primary hover:bg-primary/90 shadow-md shadow-primary/30"
                }`}
              >
                <Mic className="h-10 w-10 text-white" />
              </button>

              {/* Status text */}
              <p className="text-sm text-muted font-medium">{statusText}</p>

              {/* Error */}
              {error && (
                <p className="text-sm text-danger text-center px-4">{error}</p>
              )}
            </div>
          ) : transaction ? (
            <div className="space-y-4">
              {/* Parsed result */}
              <div className="bg-surface rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      transaction.type === "sale"
                        ? "bg-primary-light text-primary"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    {transaction.type === "sale" ? "Vente" : "Depense"}
                  </span>
                </div>
                <p className="text-foreground font-medium">{transaction.description}</p>
                <p className="text-2xl font-bold text-foreground">
                  {transaction.amount.toLocaleString("fr-FR")} FCFA
                </p>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-danger text-center">{error}</p>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={reset}
                  className="flex-1 py-3 rounded-xl border border-border text-foreground font-medium transition-colors hover:bg-surface cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-medium transition-colors hover:bg-primary/90 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="h-5 w-5 animate-spin" />}
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Slide-up animation */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
