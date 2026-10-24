"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import {
  Menu,
  X,
  Sparkles,
  BookOpen,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/for-students", label: "For Students" },
  { href: "/for-teachers", label: "For Teachers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-400/30 bg-gradient-to-r from-[#153e25] via-[#0d2618] to-[#081a10] text-white shadow-md backdrop-blur-md print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo href="/" showTagline={false} size="md" />

          <nav
            className="hidden md:flex items-center gap-1.5"
            aria-label="Main Navigation"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-150",
                    isActive
                      ? "text-brand-purple bg-white shadow-sm font-black"
                      : "text-purple-100 hover:text-white hover:bg-white/15",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20 text-xs shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
              Demo Workspace
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white font-bold border border-white/30 text-xs shadow-sm"
            >
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              className="bg-white hover:bg-purple-50 text-brand-purple font-black text-xs shadow-md border-none px-4"
            >
              Start Learning
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-brand-purple" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="px-2 text-white hover:bg-white/15"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:bg-white/15 rounded-xl focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-purple-400/40 bg-gradient-to-b from-[#0d2618] to-[#081a10] text-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-3 py-2 text-sm font-bold rounded-xl transition-colors",
                  pathname === link.href
                    ? "text-brand-purple bg-white font-black shadow-sm"
                    : "text-purple-100 hover:text-white hover:bg-white/15",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-purple-400/30 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="outline"
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold border border-white/30"
              >
                Log In
              </Button>
            </Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-white hover:bg-purple-50 text-brand-purple font-black shadow-md border-none">
                Start Learning Free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
