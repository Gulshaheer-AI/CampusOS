import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-midnight-950 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl active:scale-[0.97]";

    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "clay-button-primary hover:brightness-110 text-white font-bold",
      secondary:
        "bg-purple-100 hover:bg-purple-200 text-slate-900 font-bold border border-purple-200 shadow-sm",
      outline:
        "border-2 border-purple-200 text-slate-900 hover:text-brand-purple bg-white hover:bg-purple-50 font-bold shadow-sm",
      ghost:
        "text-slate-800 hover:text-brand-purple hover:bg-purple-50 font-bold border border-transparent",
      danger:
        "bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md",
      cyan:
        "clay-button-mint hover:brightness-105 text-slate-950 font-bold",
      teal:
        "clay-button-aqua hover:brightness-105 text-slate-950 font-bold",
      purple:
        "clay-button-primary hover:brightness-110 text-white font-bold",
      peach:
        "bg-rose-500 hover:bg-rose-600 text-white font-bold",
      seagreen:
        "clay-button-mint hover:brightness-105 text-slate-950 font-bold",
      white:
        "bg-white hover:bg-purple-50 text-brand-purple font-black shadow-md border border-purple-100",
    };

    const sizes = {
      sm: "text-xs px-3.5 py-1.5 gap-1.5 h-8",
      md: "text-sm px-4.5 py-2 gap-2 h-10",
      lg: "text-base px-6 py-3 gap-2.5 h-12",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
