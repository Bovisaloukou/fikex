"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Camera, ImageIcon, Loader2, WifiOff } from "lucide-react";
import { getClientBusinessId } from "@/lib/client-auth";
import { createLocalTransaction } from "@/lib/create-local-transaction";

type ScannerStatus = "idle" | "analyzing" | "confirm";

interface ExtractedTransaction {
  type: "sale" | "expense";
  description: string;
  amount: number;
  category: string;
  businessId: number;
  source: string;
  rawInput: string;
  selected: boolean;
}

export function ScannerInput({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [transactions, setTransactions] = useState<ExtractedTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setTransactions([]);
    setError(null);
    setSaving(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const processImage = useCallback(async (file: File) => {
    setError(null);
    setStatus("analyzing");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("businessId", String(getClientBusinessId()));

      const res = await fetch("/api/ai/ocr", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("L'analyse de l'image a echoue");

      const data = await res.json();
      const extracted: ExtractedTransaction[] = (data.transactions || []).map(
        (t: Omit<ExtractedTransaction, "selected">) => ({
          ...t,
          selected: true,
        })
      );

      if (extracted.length === 0) {
        setError("Aucune transaction trouvee dans cette image.");
        setStatus("idle");
        return;
      }

      setTransactions(extracted);
      setStatus("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setStatus("idle");
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processImage(file);
      }
      // Reset the input value so the same file can be selected again
      e.target.value = "";
    },
    [processImage]
  );

  const toggleTransaction = useCallback((index: number) => {
    setTransactions((prev) =>
      prev.map((t, i) => (i === index ? { ...t, selected: !t.selected } : t))
    );
  }, []);

  const selectedCount = transactions.filter((t) => t.selected).length;

  const handleConfirm = useCallback(async () => {
    const selected = transactions.filter((t) => t.selected);
    if (selected.length === 0) return;

    setSaving(true);
    setError(null);

    try {
      // Save each selected transaction (offline-first)
      for (const t of selected) {
        await createLocalTransaction({
          businessId: t.businessId,
          type: t.type,
          description: t.description,
          amount: t.amount,
          category: t.category,
          source: "ocr",
        });
      }

      if (navigator.onLine) router.refresh();
      handleClose();
    } catch {
      setError("Echec de l'enregistrement. Reessayez.");
      setSaving(false);
    }
  }, [transactions, router, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Bottom sheet */}
      <div className="relative w-full max-w-md mx-auto bg-white rounded-t-3xl animate-slide-up max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 sticky top-0 bg-white rounded-t-3xl z-10">
          <h2 className="text-lg font-semibold text-foreground">Scanner une facture</h2>
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
          {status === "idle" && !isOnline && (
            <div className="flex flex-col items-center gap-4 py-12">
              <WifiOff className="h-10 w-10 text-muted" />
              <p className="text-muted font-medium">Connexion requise</p>
              <p className="text-sm text-muted text-center px-4">
                Le scanner n&eacute;cessite une connexion internet.
                Utilisez la saisie manuelle hors ligne.
              </p>
            </div>
          )}

          {status === "idle" && isOnline && (
            <div className="space-y-4 py-6">
              {/* Hidden file inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Camera button */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border hover:bg-surface transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-light">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Prendre une photo</p>
                  <p className="text-sm text-muted">Utilisez la camera pour scanner</p>
                </div>
              </button>

              {/* File picker button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border hover:bg-surface transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-light">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Choisir une image</p>
                  <p className="text-sm text-muted">Selectionnez depuis la galerie</p>
                </div>
              </button>

              {/* Error */}
              {error && (
                <p className="text-sm text-danger text-center pt-2">{error}</p>
              )}
            </div>
          )}

          {status === "analyzing" && (
            <div className="flex flex-col items-center gap-4 py-16">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-sm text-muted font-medium">Analyse en cours...</p>
            </div>
          )}

          {status === "confirm" && (
            <div className="space-y-4">
              {/* Transaction list */}
              <div className="space-y-3">
                {transactions.map((t, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleTransaction(index)}
                    className={`w-full text-left p-4 rounded-2xl border transition-colors cursor-pointer ${
                      t.selected
                        ? "border-primary bg-primary-light/50"
                        : "border-border bg-surface/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              t.type === "sale"
                                ? "bg-primary-light text-primary"
                                : "bg-danger/10 text-danger"
                            }`}
                          >
                            {t.type === "sale" ? "Vente" : "Depense"}
                          </span>
                        </div>
                        <p className="text-sm text-foreground truncate">
                          {t.description}
                        </p>
                        <p className="text-lg font-bold text-foreground mt-1">
                          {t.amount.toLocaleString("fr-FR")} FCFA
                        </p>
                      </div>
                      {/* Checkbox */}
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center mt-1 ${
                          t.selected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {t.selected && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-danger text-center">{error}</p>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
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
                  disabled={saving || selectedCount === 0}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-medium transition-colors hover:bg-primary/90 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="h-5 w-5 animate-spin" />}
                  {saving
                    ? "Enregistrement..."
                    : `Enregistrer ${selectedCount} transaction${selectedCount > 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          )}
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
