import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor,
  iconBg,
}: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              iconBg
            )}
          >
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
          {change && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                changeType === "positive" && "text-emerald-400",
                changeType === "negative" && "text-red-400",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
      </div>
      {/* Subtle gradient accent at bottom */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-0.5",
          iconColor === "text-emerald-400" && "bg-gradient-to-r from-emerald-500/50 to-transparent",
          iconColor === "text-red-400" && "bg-gradient-to-r from-red-500/50 to-transparent",
          iconColor === "text-blue-400" && "bg-gradient-to-r from-blue-500/50 to-transparent",
          iconColor === "text-purple-400" && "bg-gradient-to-r from-purple-500/50 to-transparent"
        )}
      />
    </Card>
  );
}
