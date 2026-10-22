"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserProfile } from "@/types";
import { switchRole } from "@/lib/store";
import { MondayOrb } from "@/components/ui/MondayOrb";
import {
  Menu,
  Search,
  User,
  GraduationCap,
  ShieldAlert,
  ChevronDown,
  LogOut,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  currentUser: UserProfile;
  onUserChange?: (user: UserProfile) => void;
  onOpenMobileSidebar?: () => void;
}

export function AppHeader({
  currentUser,
  onUserChange,
  onOpenMobileSidebar,
}: AppHeaderProps) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handlePersonaSelect = (key: string) => {
    const updated = switchRole(key);
    if (onUserChange) onUserChange(updated);
    setRoleMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-purple-400/30 bg-gradient-to-r from-[#6653E6] via-[#5A45DA] to-[#4835BA] text-white px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-md print:hidden no-print">
      {/* Left: Mobile hamburger & search */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-white hover:bg-white/15 rounded-xl transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-brand-purple" />
          <input
            type="text"
            placeholder="Search courses, concepts, challenges..."
            className="w-full bg-white text-slate-950 placeholder:text-slate-500 font-medium rounded-2xl pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-white/80 shadow-sm"
          />
        </div>
      </div>

      {/* Right: Monday AI Quick Pill + Persona Switcher & Profile */}
      <div className="flex items-center gap-3">
        <Link
          href="/tutor"
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-white hover:bg-purple-50 shadow-sm transition-all group"
          title="Ask Monday AI Tutor"
        >
          <MondayOrb size="xs" />
          <span className="text-xs font-black text-brand-purple">
            Monday AI
          </span>
        </Link>

        {/* Interactive Persona & Role Switcher dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setRoleMenuOpen(!roleMenuOpen);
              setUserMenuOpen(false);
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border border-white/40 bg-white hover:bg-purple-50 shadow-sm text-xs text-slate-900 font-bold transition-all"
            aria-label="Switch User Role"
          >
            <span className="text-slate-500 hidden md:inline font-medium">Active:</span>
            <span
              className={cn(
                "font-black flex items-center gap-1.5",
                currentUser.role === "student" && "text-brand-purple",
                currentUser.role === "teacher" && "text-brand-pink",
                currentUser.role === "admin" && "text-emerald-700"
              )}
            >
              {currentUser.role === "student" && <Sparkles className="w-3.5 h-3.5" />}
              {currentUser.role === "teacher" && <GraduationCap className="w-3.5 h-3.5" />}
              {currentUser.role === "admin" && <ShieldAlert className="w-3.5 h-3.5" />}
              <span>{currentUser.name.split(" ")[0]}</span>
              <span className="text-[10px] opacity-80 capitalize">({currentUser.role})</span>
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white p-3 shadow-2xl z-50 border border-purple-100 text-slate-800">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-600">
                Students (Isolated Profiles & Data)
              </div>
              <div className="space-y-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => handlePersonaSelect("ahmad")}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-2xl text-left text-xs transition-all",
                    currentUser.id === "user-student-1"
                      ? "bg-purple-50 border border-purple-300 text-brand-purple font-semibold"
                      : "text-slate-700 hover:bg-purple-50/70"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center text-brand-purple font-bold text-xs">
                      AK
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Ahmad Khan (Student 1)</div>
                      <div className="text-[11px] text-slate-500">3rd Yr CS • Algorithms & Next.js</div>
                    </div>
                  </div>
                  {currentUser.id === "user-student-1" && <Check className="w-4 h-4 text-brand-purple" />}
                </button>

                <button
                  type="button"
                  onClick={() => handlePersonaSelect("hassan")}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-2xl text-left text-xs transition-all",
                    currentUser.id === "user-student-2"
                      ? "bg-purple-50 border border-purple-300 text-brand-purple font-semibold"
                      : "text-slate-700 hover:bg-purple-50/70"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold text-xs">
                      HA
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Hassan Ali (Student 2)</div>
                      <div className="text-[11px] text-slate-500">Final Yr AI • Python, RAG & SQL</div>
                    </div>
                  </div>
                  {currentUser.id === "user-student-2" && <Check className="w-4 h-4 text-emerald-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => handlePersonaSelect("zain")}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-2xl text-left text-xs transition-all",
                    currentUser.id === "user-student-3"
                      ? "bg-purple-50 border border-purple-300 text-brand-purple font-semibold"
                      : "text-slate-700 hover:bg-purple-50/70"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-pink-100 border border-pink-300 flex items-center justify-center text-pink-700 font-bold text-xs">
                      ZT
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Zain Tariq (Student 3)</div>
                      <div className="text-[11px] text-slate-500">2nd Yr SE • UI/UX &amp; Claymorphism</div>
                    </div>
                  </div>
                  {currentUser.id === "user-student-3" && <Check className="w-4 h-4 text-pink-600" />}
                </button>
              </div>

              <div className="px-2 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-purple-600 border-t border-purple-100 mt-2">
                Faculty &amp; Administration
              </div>
              <div className="space-y-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => handlePersonaSelect("teacher")}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-2xl text-left text-xs transition-all",
                    currentUser.role === "teacher"
                      ? "bg-purple-50 border border-purple-300 text-brand-purple font-semibold"
                      : "text-slate-700 hover:bg-purple-50/70"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center text-brand-purple font-bold text-xs">
                      SV
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Teacher / Faculty</div>
                      <div className="text-[11px] text-slate-500">Prof. Sarah Vance</div>
                    </div>
                  </div>
                  {currentUser.role === "teacher" && <Check className="w-4 h-4 text-brand-purple" />}
                </button>

                <button
                  type="button"
                  onClick={() => handlePersonaSelect("admin")}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-2xl text-left text-xs transition-all",
                    currentUser.role === "admin"
                      ? "bg-purple-50 border border-purple-300 text-brand-purple font-semibold"
                      : "text-slate-700 hover:bg-purple-50/70"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-800 font-semibold text-xs">
                      JT
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Platform Admin</div>
                      <div className="text-[11px] text-slate-500">Jordan Taylor</div>
                    </div>
                  </div>
                  {currentUser.role === "admin" && <Check className="w-4 h-4 text-cyan-700" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User avatar menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setRoleMenuOpen(false);
            }}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-brand-violet/50 transition-all focus:outline-none"
            aria-label="User profile menu"
          >
            <div className="w-9 h-9 rounded-full clay-button-primary flex items-center justify-center text-white font-bold text-xs">
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-3xl bg-white p-3 shadow-2xl z-50 border-2 border-purple-200 text-slate-900">
              <div className="px-3 py-2 border-b border-purple-100">
                <div className="font-extrabold text-sm text-slate-950 truncate">{currentUser.name}</div>
                <div className="text-xs font-medium text-slate-600 truncate">{currentUser.email}</div>
                <div className="text-[11px] font-bold text-brand-purple mt-0.5 truncate">{currentUser.degree}</div>
              </div>

              <div className="py-1.5 space-y-1">
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-800 hover:text-brand-purple hover:bg-purple-50 rounded-xl transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-brand-purple" />
                  Profile & Settings
                </Link>
                <Link
                  href="/portfolio"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-800 hover:text-brand-purple hover:bg-purple-50 rounded-xl transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  My Public Portfolio
                </Link>
              </div>

              <div className="pt-1 border-t border-purple-100">
                <Link
                  href="/"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  Sign Out
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
