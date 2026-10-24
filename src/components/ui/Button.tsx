import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "cyan"
    | "teal"
    | "purple"
    | "peach"
    | "seagreen"
    | "white";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-midnight-950 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl active:scale-[0.97]";

    const sizes = {
      sm: "text-xs px-3.5 py-1.5 gap-1.5 h-8",
      md: "text-sm px-4 py-2 gap-2 h-10",
      lg: "text-base px-6 py-3 gap-2.5 h-12",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn("ui-button", baseStyles, sizes[size], className)}
        data-tone={
          ["primary", "purple", "cyan", "teal", "seagreen", "white"].includes(
            variant,
          )
            ? "primary"
            : variant === "peach"
              ? "danger"
              : variant
        }
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
