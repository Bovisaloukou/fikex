import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "destructive"
  | "momo"
  | "cash"
  | "virement"
  | "whatsapp"
  | "ussd"
  | "web"
  | "ocr";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  destructive: "bg-red-100 text-red-700",
  momo: "bg-yellow-400 text-yellow-900 font-semibold",
  cash: "bg-gray-200 text-gray-600",
  virement: "bg-blue-100 text-blue-700",
  whatsapp: "bg-green-100 text-green-700",
  ussd: "bg-blue-100 text-blue-700",
  web: "bg-purple-100 text-purple-700",
  ocr: "bg-orange-100 text-orange-700",
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
