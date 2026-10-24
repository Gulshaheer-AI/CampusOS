"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserProfile } from "@/types";
import { switchRole, getStudents } from "@/lib/store";
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
    // Route pages hold persona-specific state outside AppShell; reload it with the new identity.
    window.location.reload();
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
              <p className="px-2 py-1 text-xs font-bold text-slate-700">Student workspaces</p>
              {getStudents().map((student, index) => <button key={student.id} type="button" onClick={() => handlePersonaSelect(student.id)} className="w-full flex items-center justify-between p-3 rounded-xl text-left text-sm text-slate-900 hover:bg-purple-50">
                <span>Student profile {index + 1}</span>
                {currentUser.id === student.id && <Check className="w-4 h-4 text-purple-800" />}
              </button>)}
              <p className="px-2 pt-3 pb-1 text-xs font-bold text-slate-700 border-t border-purple-100">Faculty &amp; administration</p>
              {([{key: "teacher", label: "Teacher / Faculty"}, {key: "admin", label: "Platform Admin"}] as const).map(role => <button key={role.key} type="button" onClick={() => handlePersonaSelect(role.key)} className="w-full flex items-center justify-between p-3 rounded-xl text-left text-sm text-slate-900 hover:bg-purple-50">
                <span>{role.label}</span>
                {currentUser.role === role.key && <Check className="w-4 h-4 text-purple-800" />}
              </button>)}
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
