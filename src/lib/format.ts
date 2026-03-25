// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * French month names (index 0 = January)
 */
export const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

/**
 * Canonical source-label mapping used across journal, transaction items, etc.
 * Each key maps to a display label and Tailwind class pair.
 */
const SOURCE_LABELS: Record<
  string,
  { label: string; className: string }
> = {
  whatsapp: { label: "MOMO", className: "bg-amber-100 text-amber-700" },
  ussd: { label: "USSD", className: "bg-blue-100 text-blue-700" },
  ocr: { label: "REÇU", className: "bg-purple-100 text-purple-700" },
  web: { label: "CASH", className: "bg-gray-100 text-gray-600" },
};

/**
 * Look up a source label/className pair, falling back to a neutral style.
 */
export function getSourceLabel(source: string): {
  label: string;
  className: string;
} {
  return (
    SOURCE_LABELS[source] ?? {
      label: source.toUpperCase(),
      className: "bg-gray-100 text-gray-500",
    }
  );
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

const decimalFmt = new Intl.NumberFormat("fr-FR", {
  style: "decimal",
  maximumFractionDigits: 0,
});

/**
 * Format amount in FCFA
 */
export function formatCFA(amount: number): string {
  return decimalFmt.format(amount) + " FCFA";
}

/**
 * Format date to French locale
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format amount with space separator and short "F" suffix (e.g., "45 000 F")
 */
export function formatShortAmount(amount: number): string {
  return decimalFmt.format(amount) + " F";
}

/**
 * Format date to relative time (e.g., "il y a 2h")
 */
export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "maintenant";
  if (diffMin < 60) return `il y a ${diffMin}min`;
  if (diffH < 24) return `il y a ${diffH}h`;
  if (diffD < 7) return `il y a ${diffD}j`;
  return formatDate(dateStr);
}
