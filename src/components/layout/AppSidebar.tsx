"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { UserProfile, UserRole } from "@/types";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Sparkles,
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
  X,
  Compass,
} from "lucide-react";

const navigation = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    group: "learn",
  },
  { href: "/courses", label: "My Courses", icon: BookOpen, group: "learn" },
  { href: "/tutor", label: "Monday AI", icon: Sparkles, group: "learn" },
  { href: "/codeplay", label: "CodePlay", icon: Code2, group: "learn" },
  { href: "/quizzes", label: "Quizzes", icon: FileQuestion, group: "learn" },
  {
    href: "/learn/explore",
    label: "Concept Explorer",
    icon: Compass,
    group: "learn",
  },
  {
    href: "/teacher",
    label: "Teacher Studio",
    icon: GraduationCap,
    group: "learn",
    faculty: true,
  },
  { href: "/roadmaps", label: "Skill Roadmaps", icon: Map, group: "grow" },
  { href: "/challenges", label: "Challenges", icon: Trophy, group: "grow" },
  { href: "/cv", label: "CV Studio", icon: FileText, group: "grow" },
  {
    href: "/opportunities",
    label: "Opportunities",
    icon: Briefcase,
    group: "grow",
  },
  { href: "/portfolio", label: "Portfolio", icon: UserCheck, group: "grow" },
];

interface Props {
  userRole?: UserRole;
  currentUser?: UserProfile;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}
export function AppSidebar({
  userRole = "student",
  currentUser,
  isMobileOpen = false,
  onCloseMobile,
}: Props) {
  const pathname = usePathname();
  const drawer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isMobileOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawer.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseMobile?.();
      if (e.key !== "Tab") return;
      const items =
        drawer.current?.querySelectorAll<HTMLElement>("a[href], button");
      if (!items?.length) return;
      const first = items[0],
        last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [isMobileOpen, onCloseMobile]);
  const content = (mobile = false) => (
    <div className="workspace-sidebar flex flex-col h-full select-none">
      <div className="h-[84px] px-7 flex items-center justify-between shrink-0">
        <Logo href="/dashboard" size="md" />
        {mobile && (
          <button
            aria-label="Close sidebar"
            onClick={onCloseMobile}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <nav
        aria-label="Workspace navigation"
        className="flex-1 overflow-y-auto px-5 pb-5"
      >
        <p className="text-[10px] uppercase tracking-[.16em] text-[#829d8c] px-2 mt-3 mb-5">
          {userRole} workspace
        </p>
        {["learn", "grow"].map((group) => (
          <div
            key={group}
            className={cn(
              "space-y-1",
              group === "grow" && "border-t border-[#1b3224] mt-6 pt-6",
            )}
          >
            {navigation
              .filter(
                (n) =>
                  n.group === group && (!n.faculty || userRole !== "student"),
              )
              .map(({ href, label, icon: Icon }) => {
                const active =
                  pathname === href ||
                  (href !== "/dashboard" && pathname.startsWith(href + "/"));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onCloseMobile}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-4 rounded-xl px-4 py-3 text-[13px] transition-colors border",
                      active
                        ? "bg-gradient-to-r from-[#10351f] to-[#205a32] border-[#356e47] text-[#f1fff4] font-semibold"
                        : "border-transparent text-[#bacbbf] hover:bg-[#10271a] hover:text-white",
                    )}
                  >
                    <Icon
                      size={19}
                      strokeWidth={1.5}
                      className={active ? "text-[#a5efae]" : "text-[#9fb7a7]"}
                    />
                    {label}
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>
      <div className="px-6 py-5 border-t border-[#1b3224] flex gap-3 items-center">
        <span className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-[#265e37] to-[#0d2718] border border-[#31583d] flex items-center justify-center text-sm text-[#d8f6df]">
          {currentUser?.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2) || "C"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate">
            {currentUser?.name || "CampusOS"}
          </p>
          <p className="text-[10px] text-[#9ab3a2] mt-1 capitalize">
            {userRole}
          </p>
        </div>
        <Link
          href="/settings"
          aria-label="Settings"
          onClick={onCloseMobile}
          className="text-[#9fb7a7] p-1 rounded hover:text-white"
        >
          <Settings size={17} />
        </Link>
      </div>
    </div>
  );
  return (
    <>
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-40 print:hidden">
        {content()}
      </aside>
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 print:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div
            ref={drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="relative h-full w-[250px]"
          >
            {content(true)}
          </div>
        </div>
      )}
    </>
  );
}
