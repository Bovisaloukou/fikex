"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronDown, Loader2 } from "lucide-react";
import { getClientBusinessId } from "@/lib/client-auth";
import { createLocalTransaction } from "@/lib/create-local-transaction";

const CATEGORIES = [
  "Alimentation",
  "Transport",
  "Marchandise",
  "Service",
  "Loyer",
  "Salaire",
  "Equipement",
  "Communication",
  "Autre",
] as const;

// Map display names to DB values
const CATEGORY_MAP: Record<string, string> = {
  Alimentation: "alimentation",
  Transport: "transport",
  Marchandise: "marchandise",
  Service: "service",
  Loyer: "loyer",
  Salaire: "salaire",
  Equipement: "equipement",
  Communication: "communication",
  Autre: "autre",
};

export function ManualInput({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [type, setType] = useState<"sale" | "expense">("sale");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Autre");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setType("sale");
    setAmount("");
    setDescription("");
    setCategory("Autre");
    setSaving(false);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSubmit = useCallback(async () => {
    // Validation
    const parsedAmount = parseInt(amount, 10);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Veuillez saisir un montant valide.");
      return;
    }
    if (!description.trim()) {
      setError("Veuillez saisir une description.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createLocalTransaction({
        businessId: getClientBusinessId(),
        type,
        description: description.trim(),
        amount: parsedAmount,
        category: CATEGORY_MAP[category] || "autre",
        source: "web",
      });

      if (navigator.onLine) router.refresh();
      handleClose();
    } catch {
      setError("Echec de l'enregistrement. Reessayez.");
      setSaving(false);
    }
  }, [amount, description, type, category, router, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Bottom sheet */}
      <div className="relative w-full max-w-md mx-auto bg-white rounded-t-3xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-semibold text-foreground">Nouvelle transaction</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 space-y-5">
          {/* Type toggle */}
          <div className="flex bg-surface rounded-xl p-1">
            <button
              type="button"
              onClick={() => setType("sale")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                type === "sale"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Vente
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                type === "expense"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Depense
            </button>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Montant (FCFA)
            </label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-center text-3xl font-bold text-foreground py-4 px-4 bg-surface rounded-2xl border-0 outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Description input */}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Description
            </label>
            <input
              type="text"
              placeholder="Ex: Vente de riz, Achat de ciment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-3 px-4 bg-surface rounded-xl border-0 outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Category select */}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Categorie
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-3 px-4 pr-10 bg-surface rounded-xl border-0 outline-none focus:ring-2 focus:ring-primary/30 text-foreground appearance-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-danger text-center">{error}</p>
          )}

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold transition-colors hover:bg-primary/90 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="h-5 w-5 animate-spin" />}
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
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
