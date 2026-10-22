import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "violet"
    | "cyan"
    | "purple"
    | "teal"
    | "gray"
    | "white"
    | "success"
    | "warning"
    | "danger"
    | "outline"
    | "mint"
    | "pink"
    | "tag1"
    | "tag2"
    | "tag3"
    | "tag4"
    | "tag5"
    | "tag6"
    | "tag7"
    | "tag8"
    | "tag9"
    | "tag10"
    | "tag11";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-purple-50 text-slate-900 border-purple-200 font-bold",
    violet: "bg-purple-100 text-brand-purple border-purple-200 font-bold",
    purple: "bg-purple-100 text-brand-purple border-purple-200 font-bold",
    cyan: "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold",
    teal: "bg-teal-100 text-teal-900 border-teal-300 font-bold",
    mint: "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold",
    pink: "bg-rose-100 text-rose-900 border-rose-300 font-bold",
    gray: "bg-slate-100 text-slate-900 border-slate-300 font-bold",
    white: "bg-white/25 text-white border-white/40 backdrop-blur-sm font-bold",
    success: "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold",
    warning: "bg-amber-100 text-amber-950 border-amber-300 font-bold",
    danger: "bg-rose-100 text-rose-900 border-rose-300 font-bold",
    outline: "bg-white text-slate-900 border-2 border-purple-200 font-bold",
    // 11 Official Odoo Kanban Data Tag Variants
    tag1: "bg-rose-100 text-rose-900 border-rose-300 font-bold", // Dark Red
    tag2: "bg-amber-100 text-amber-950 border-amber-300 font-bold", // Orange
    tag3: "bg-amber-100 text-amber-950 border-amber-300 font-bold", // Yellow
    tag4: "bg-sky-100 text-sky-950 border-sky-300 font-bold", // Light Blue
    tag5: "bg-purple-100 text-brand-purple border-purple-300 font-bold", // Dark Purple
    tag6: "bg-rose-100 text-rose-900 border-rose-300 font-bold", // Salmon / Rose (Dark & Visible)
    tag7: "bg-blue-100 text-blue-950 border-blue-300 font-bold", // Medium Blue
    tag8: "bg-indigo-100 text-indigo-950 border-indigo-300 font-bold", // Dark Blue
    tag9: "bg-fuchsia-100 text-fuchsia-950 border-fuchsia-300 font-bold", // Fuchsia
    tag10: "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold", // Green
    tag11: "bg-purple-100 text-brand-purple border-purple-200 font-bold", // Purple
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
