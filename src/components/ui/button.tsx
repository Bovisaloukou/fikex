import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "default" | "destructive" | "outline" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: "bg-[#2D5A27] text-white hover:bg-[#234A1F] shadow-sm",
  outline: "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50",
  destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
  link: "text-[#2D5A27] underline",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "px-6 py-3",
  sm: "px-4 py-2 text-sm",
  lg: "px-8 py-4 text-lg",
  icon: "p-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5A27] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
