import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatShortAmount, getSourceLabel } from "@/lib/format";

interface TransactionItemProps {
  description: string;
  amount: number;
  type: "sale" | "expense";
  source: string;
  time: string;
}

export function TransactionItem({
  description,
  amount,
  type,
  source,
  time,
}: TransactionItemProps) {
  const isSale = type === "sale";
  const sourceInfo = getSourceLabel(source);

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
