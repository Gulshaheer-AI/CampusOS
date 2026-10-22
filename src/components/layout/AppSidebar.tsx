"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { MondayOrb } from "@/components/ui/MondayOrb";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Bot,
  Code2,
  FileQuestion,
  BookOpen,
  GraduationCap,
  Map,
  Trophy,
  UserCheck,
  Briefcase,
  Settings,
  FileText,
} from "lucide-react";

interface AppSidebarProps {
  userRole?: UserRole;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  roleRequired?: UserRole[];
  group: "learn" | "grow" | "general";
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    group: "general",
  },
  // CAMPUS LEARN
  {
    href: "/tutor",
    label: "Monday AI Tutor",
    icon: Bot,
    badge: "Monday",
    group: "learn",
  },
  {
    href: "/codeplay",
    label: "CodePlay IDE",
    icon: Code2,
    group: "learn",
  },
  {
    href: "/quizzes",
    label: "QuizForge",
    icon: FileQuestion,
    group: "learn",
  },
  {
    href: "/courses",
    label: "My Courses (C4)",
    icon: BookOpen,
    group: "learn",
  },
  {
    href: "/teacher",
    label: "Teacher Studio",
    icon: GraduationCap,
    badge: "Faculty",
    roleRequired: ["teacher", "admin"],
    group: "learn",
  },
  // CAMPUS GROW & OPPORTUNITIES
  {
    href: "/roadmaps",
    label: "Skill Roadmaps",
    icon: Map,
    group: "grow",
  },
  {
    href: "/challenges",
    label: "Challenges",
    icon: Trophy,
    group: "grow",
  },
  {
    href: "/portfolio",
    label: "Portfolio",
    icon: UserCheck,
    group: "grow",
  },
  {
    href: "/opportunities",
    label: "Opportunities",
    icon: Briefcase,
    badge: "Live",
    group: "grow",
  },
  {
    href: "/cv",
    label: "CV Studio & AI Auditor",
    icon: FileText,
    badge: "12 ATS",
    group: "grow",
  },
  // SETTINGS
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    group: "general",
  },
];

export function AppSidebar({
  userRole = "student",
  isMobileOpen = false,
  onCloseMobile,
}: AppSidebarProps) {
  const pathname = usePathname();

  const filterItem = (item: NavItem) => {
    if (!item.roleRequired) return true;
    return item.roleRequired.includes(userRole);
  };

  const learnItems = NAV_ITEMS.filter((i) => i.group === "learn" && filterItem(i));
  const growItems = NAV_ITEMS.filter((i) => i.group === "grow" && filterItem(i));
  const generalItems = NAV_ITEMS.filter((i) => i.group === "general" && filterItem(i));

  const renderLink = (item: NavItem) => {
    const isActive =
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href);
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onCloseMobile}
        className={cn(
          "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm transition-all group",
          isActive
            ? "bg-white text-[#5542D0] font-black shadow-lg shadow-purple-950/25 scale-[1.02]"
            : "text-purple-100 hover:text-white hover:bg-white/15 font-semibold"
        )}
      >
        <div className="flex items-center gap-3">
          {item.href === "/tutor" ? (
            <MondayOrb size="xs" />
          ) : (
            <Icon
              className={cn(
                "w-4 h-4 transition-colors",
                isActive ? "text-[#5542D0]" : "text-purple-200 group-hover:text-white"
              )}
            />
          )}
          <span className={cn(isActive ? "text-[#5542D0] font-black" : "text-purple-100 group-hover:text-white")}>
            {item.label}
          </span>
        </div>
        {item.badge && (
          <span
            className={cn(
              "text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm",
              isActive
                ? "bg-purple-100 text-[#5542D0] border border-purple-200"
                : item.badge === "Monday"
                ? "bg-pink-400 text-white border border-pink-300/40"
                : item.badge === "Faculty"
                ? "bg-amber-400 text-slate-950 border border-amber-300"
                : "bg-emerald-400 text-slate-950 border border-emerald-300"
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#6653E6] via-[#5A45DA] to-[#4835BA] text-white border-r border-purple-400/30 w-64 select-none shadow-2xl">
      <div className="p-4 border-b border-white/15 bg-white/5">
        <Logo href="/dashboard" size="sm" showTagline={true} />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-purple-200">
            Overview
          </div>
          <div className="space-y-1">{generalItems.slice(0, 1).map(renderLink)}</div>
        </div>

        <div>
          <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-purple-200 flex items-center justify-between">
            <span>Campus Learn</span>
            <span className="bg-white/20 text-white px-1.5 py-0.5 rounded font-mono text-[9px] font-black">MONDAY AI</span>
          </div>
          <div className="space-y-1">{learnItems.map(renderLink)}</div>
        </div>

        <div>
          <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-purple-200 flex items-center justify-between">
            <span>Campus Grow</span>
            <span className="bg-emerald-400/30 text-emerald-100 border border-emerald-300/40 px-1.5 py-0.5 rounded font-mono text-[9px] font-black">CAREER</span>
          </div>
          <div className="space-y-1">{growItems.map(renderLink)}</div>
        </div>

        <div>
          <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-purple-200">
            Account
          </div>
          <div className="space-y-1">{generalItems.slice(1).map(renderLink)}</div>
        </div>
      </div>

      {/* Monday AI & Role indicator clay card */}
      <div className="p-3.5 m-3 rounded-2xl bg-[#4330B8]/90 border border-purple-300/30 space-y-2.5 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <MondayOrb size="sm" />
          <div>
            <div className="text-xs font-bold text-white">Monday AI Engine</div>
            <div className="text-[10px] text-emerald-300 font-semibold">Gemini 3.1 + RAG Active</div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs pt-2 border-t border-white/15">
          <span className="text-purple-200 font-medium">Active Role</span>
          <span
            className={cn(
              "capitalize font-bold px-2.5 py-0.5 rounded-full text-[10px]",
              userRole === "student" && "bg-emerald-400 text-slate-950 border border-emerald-300",
              userRole === "teacher" && "bg-amber-300 text-slate-950 border border-amber-200",
              userRole === "admin" && "bg-cyan-300 text-slate-950 border border-cyan-200"
            )}
          >
            {userRole}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-40 print:hidden">{sidebarContent}</aside>

      {/* Mobile backdrop & drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex print:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 flex w-full max-w-xs flex-1">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
