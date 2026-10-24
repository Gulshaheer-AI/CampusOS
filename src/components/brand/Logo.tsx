import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
  showTagline?: boolean;
}

export function Logo({
  className,
  size = "md",
  href = "/",
  showTagline = false,
}: LogoProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  const content = (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 group select-none",
        className,
      )}
    >
      {/* Original geometric icon: intersecting nested learning nodes */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg bg-transparent p-0.5 transition-transform duration-200 group-hover:scale-105",
          iconSizes[size],
        )}
      >
        <div className="w-full h-full bg-transparent rounded-[7px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle inner grid lines */}
          <div className="absolute inset-0 bg-transparent" />
          {/* Geometric node glyph */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4/5 h-4/5 text-[#a5efae] transform -rotate-12 group-hover:rotate-0 transition-transform duration-300"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col">
        <span
          className={cn(
            "font-bold tracking-tight text-white flex items-center leading-none",
            textSizes[size],
          )}
        >
          Campus<span className="text-brand-cyan">OS</span>
        </span>
        {showTagline && (
          <span className="text-[10px] font-bold tracking-wider text-purple-200 uppercase mt-0.5">
            Classroom to Career
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-mint"
      >
        {content}
      </Link>
    );
  }

  return content;
}
