"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface MondayOrbProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  state?: "idle" | "thinking" | "mint" | "pink" | string;
  animated?: boolean;
  showLabel?: boolean;
  className?: string;
}

/**
 * MondayOrb — The signature 3D Claymorphic circular avatar for "Monday",
 * the CampusOS AI companion. Features a unique tactile sphere design with
 * luminous coral-violet-aqua clay gradients and inner specular highlights.
 */
export function MondayOrb({
  size = "md",
  state = "idle",
  animated = true,
  showLabel = false,
  className,
}: MondayOrbProps) {
  const sizeClasses = {
    xs: "w-5 h-5",
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const eyeSizes = {
    xs: "w-0.5 h-1",
    sm: "w-1 h-1.5",
    md: "w-1 h-2",
    lg: "w-1.5 h-2.5",
    xl: "w-2 h-3.5",
  };

  const isThinking = state === "thinking";

  return (
    <div
      className={cn("inline-flex items-center gap-2 select-none", className)}
    >
      <div className="relative inline-flex items-center justify-center shrink-0">
        {/* Outer soft clay aura */}
        {animated && (
          <span
            className={cn(
              "absolute -inset-1 rounded-full opacity-60 blur-sm",
              isThinking ? "animate-spin" : "animate-pulse",
            )}
            style={{
              background:
                "conic-gradient(from 180deg at 50% 50%, #a5efae 0deg, #235d36 120deg, #7fe599 240deg, #a5efae 360deg)",
            }}
          />
        )}

        {/* Main 3D Claymorphic Sphere */}
        <div
          className={cn(
            "relative rounded-full flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105",
            sizeClasses[size],
          )}
          style={{
            background:
              state === "mint"
                ? "radial-gradient(circle at 30% 28%, #DCFFF5 0%, #B6E3D4 35%, #5FC2BA 70%, #1B2848 100%)"
                : "radial-gradient(circle at 30% 28%, #c8ffd1 0%, #79d895 28%, #235d36 68%, #215a35 100%)",
            boxShadow:
              "inset 3px 4px 7px rgba(255, 255, 255, 0.65), inset -3px -5px 8px rgba(5, 30, 16, 0.55), 0 6px 14px rgba(90, 220, 130, 0.2)",
          }}
          title="Monday AI — Your Personal Academic & Career Orb"
        >
          {/* Specular top-left clay gloss */}
          <span
            className="absolute top-[12%] left-[16%] w-[32%] h-[22%] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 80%)",
              transform: "rotate(-25deg)",
            }}
          />

          {/* Friendly minimalist orb eyes */}
          <div className="flex items-center gap-1 z-10">
            <span
              className={cn(
                "rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.9)]",
                eyeSizes[size],
              )}
            />
            <span
              className={cn(
                "rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.9)]",
                eyeSizes[size],
              )}
            />
          </div>
        </div>
      </div>

      {showLabel && (
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-extrabold tracking-tight bg-gradient-to-r from-[#a5efae] via-[#C4B5FD] to-[#7fe599] bg-clip-text text-transparent">
            Monday AI
          </span>
          <span className="text-[10px] text-slate-300 font-medium">
            Neural Study Orb
          </span>
        </div>
      )}
    </div>
  );
}
