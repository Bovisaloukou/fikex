import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatShortAmount } from "@/lib/format";

interface TransactionItemProps {
  description: string;
  amount: number;
  type: "sale" | "expense";
  source: string;
  time: string;
}

const sourceLabels: Record<string, { label: string; className: string }> = {
  whatsapp: {
    label: "MOMO",
    className: "bg-amber-100 text-amber-700",
  },
  web: {
    label: "CASH",
    className: "bg-gray-100 text-gray-600",
  },
  ussd: {
    label: "USSD",
    className: "bg-blue-100 text-blue-700",
  },
  ocr: {
    label: "REÇU",
    className: "bg-purple-100 text-purple-700",
  },
};

export function TransactionItem({
  description,
  amount,
  type,
  source,
  time,
}: TransactionItemProps) {
  const isSale = type === "sale";
  const sourceInfo = sourceLabels[source] ?? {
    label: source.toUpperCase(),
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="flex items-center gap-3 py-3">
      {/* Icon circle */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          isSale ? "bg-green-100" : "bg-red-100"
        }`}
      >
        {isSale ? (
          <ArrowDownLeft className="h-5 w-5 text-green-600" />
        ) : (
          <ArrowUpRight className="h-5 w-5 text-red-500" />
        )}
      </div>

      {/* Description + source + time */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {description}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${sourceInfo.className}`}
          >
            {sourceInfo.label}
          </span>
          <span className="text-xs text-gray-400">{time}</span>
        </div>
      </div>

      {/* Amount */}
      <p
        className={`text-sm font-semibold whitespace-nowrap ${
          isSale ? "text-green-600" : "text-red-500"
        }`}
      >
        {isSale ? "+" : "-"}
        {formatShortAmount(amount)}
      </p>
    </div>
  );
}
