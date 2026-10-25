"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserProfile } from "@/types";
import {
  switchRole,
  getStudents,
  getCourses,
  getChallenges,
} from "@/lib/store";
import {
  Menu,
  Search,
  User,
  GraduationCap,
  ChevronDown,
  LogOut,
  Sparkles,
  Check,
  Settings,
  ArrowRight,
  X,
} from "lucide-react";

interface Props {
  currentUser: UserProfile;
  onUserChange?: (user: UserProfile) => void;
  onOpenMobileSidebar?: () => void;
}
const destinations = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "My Courses", href: "/courses" },
  { title: "Monday AI Tutor", href: "/tutor" },
  { title: "CodePlay", href: "/codeplay" },
  { title: "Quizzes", href: "/quizzes" },
  { title: "Skill Roadmaps", href: "/roadmaps" },
  { title: "Challenges", href: "/challenges" },
  { title: "CV Studio", href: "/cv" },
  { title: "Opportunities", href: "/opportunities" },
  { title: "Portfolio", href: "/portfolio" },
  { title: "Concept Explorer", href: "/learn/explore" },
  { title: "Settings", href: "/settings" },
];
export function AppHeader({
  currentUser,
  onUserChange,
  onOpenMobileSidebar,
}: Props) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [results, setResults] = useState(destinations);
  const input = useRef<HTMLInputElement>(null);
  const header = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const currentPage =
    destinations.find((d) => d.href === pathname)?.title ||
    (pathname.startsWith("/teacher") ? "Teacher Studio" : "Workspace");
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!header.current?.contains(event.target as Node)) {
        setRoleMenuOpen(false);
        setUserMenuOpen(false);
        setSearchOpen(false);
      }
    };
    const key = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        input.current?.focus();
      }
      if (event.key === "Escape") {
        setRoleMenuOpen(false);
        setUserMenuOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", key);
    };
  }, []);
  const select = (key: string) => {
    const updated = switchRole(key);
    onUserChange?.(updated);
    setRoleMenuOpen(false);
    window.location.reload();
  };
  const search = (value: string) => {
    setQuery(value);
    setSearchOpen(true);
    const all = [
      ...destinations,
      ...getCourses().map((c) => ({
        title: `${c.code}: ${c.title}`,
        href: `/courses/${c.id}`,
      })),
      ...getChallenges().map((c) => ({
        title: c.title,
        href: `/challenges/${c.id}`,
      })),
    ];
    setResults(
      all
        .filter((item) =>
          item.title.toLowerCase().includes(value.trim().toLowerCase()),
        )
        .slice(0, 7),
    );
  };
  const menuClass =
    "absolute right-0 mt-3 w-64 rounded-xl bg-[#0d2116] p-2 shadow-2xl z-50 border border-[#31533b]";
  const menuItem =
    "flex items-center justify-between gap-2 w-full p-3 rounded-lg text-left text-xs text-[#e1efe5] hover:bg-[#1b3926]";
  return (
    <header
      ref={header}
      className="workspace-header sticky top-0 z-30 min-h-14 px-4 sm:px-5 lg:px-6 flex items-center justify-between gap-4 print:hidden no-print"
    >
      <div className="flex gap-3 items-center shrink-0">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-[#c6dfce] hover:bg-white/10"
        >
          <Menu size={20} />
        </button>
        <div className="hidden xl:flex items-center gap-3 text-[11px]">
          <span className="text-[#b6cbbc]">Workspace</span>
          <span className="text-[#5e7d68]">/</span>
          <span>{currentPage}</span>
        </div>
      </div>
      <div className="relative flex-1 max-w-xl hidden sm:block">
        <Search size={16} className="absolute left-4 top-2.5 text-[#a1b8a8]" />
        <input
          ref={input}
          aria-label="Search workspace"
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => search(query)}
          placeholder="Search courses, skills, opportunities..."
          className="w-full h-9 bg-[#0b1b12] border border-[#2a4734] rounded-lg pl-10 pr-14 text-xs text-[#e1efe5] focus:outline-none focus:border-[#77b88b]"
        />
        <kbd className="absolute right-3 top-2 text-[10px] text-[#9ab3a2] bg-[#1b3022] rounded px-1.5 py-0.5">
          Ctrl K
        </kbd>
        {searchOpen && (
          <div
            className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-[#0d2116] p-2 shadow-2xl border border-[#31533b]"
            aria-label="Search results"
          >
            <div className="flex justify-between items-center px-3 py-2 text-[10px] uppercase tracking-wider text-[#9ab3a2]">
              <span>Workspace results</span>
              <button
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
              >
                <X size={14} />
              </button>
            </div>
            {results.length ? (
              results.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  onClick={() => setSearchOpen(false)}
                  className={menuItem}
                >
                  {r.title}
                  <ArrowRight size={13} className="shrink-0" />
                </Link>
              ))
            ) : (
              <p className="text-xs text-[#a1b8a8] px-3 py-4">
                No matching courses or tools. Try another search.
              </p>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-auto">
        <Link
          href="/tutor"
          aria-label="Ask Monday AI Tutor"
          className="hidden md:flex text-[#a5efae] p-2 rounded-lg hover:bg-[#153321]"
        >
          <Sparkles size={18} strokeWidth={1.5} />
        </Link>
        <div className="relative">
          <button
            type="button"
            aria-label="Switch User Role"
            aria-expanded={roleMenuOpen}
            onClick={() => {
              setRoleMenuOpen(!roleMenuOpen);
              setUserMenuOpen(false);
              setSearchOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg border border-[#274733] px-3 py-2 text-[11px] hover:bg-[#153321]"
          >
            <GraduationCap size={15} className="text-[#a5efae]" />
            <span className="capitalize">{currentUser.role}</span>
            <ChevronDown size={12} />
          </button>
          {roleMenuOpen && (
            <div className={menuClass}>
              <p className="px-3 py-2 text-[10px] uppercase tracking-wider text-[#9ab3a2]">
                Student workspaces
              </p>
              {getStudents().map((student, i) => (
                <button
                  key={student.id}
                  onClick={() => select(student.id)}
                  className={menuItem}
                >
                  <span>Student profile {i + 1}</span>
                  {currentUser.id === student.id && (
                    <Check size={14} className="text-[#a5efae]" />
                  )}
                </button>
              ))}
              <p className="px-3 pt-4 pb-2 text-[10px] uppercase tracking-wider border-t border-[#244333] text-[#9ab3a2]">
                Faculty &amp; administration
              </p>
              {(
                [
                  { key: "teacher", label: "Teacher / Faculty" },
                  { key: "admin", label: "Platform Admin" },
                ] as const
              ).map((role) => (
                <button
                  key={role.key}
                  onClick={() => select(role.key)}
                  className={menuItem}
                >
                  <span>{role.label}</span>
                  {currentUser.role === role.key && (
                    <Check size={14} className="text-[#a5efae]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button
            aria-label="User profile menu"
            aria-expanded={userMenuOpen}
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setRoleMenuOpen(false);
              setSearchOpen(false);
            }}
            className="h-9 w-9 rounded-full bg-gradient-to-br from-[#296b3b] to-[#102e1b] border border-[#3c6b48] flex items-center justify-center text-xs font-medium text-[#e6ffeb]"
          >
            {currentUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </button>
          {userMenuOpen && (
            <div className={menuClass}>
              <div className="p-3 border-b border-[#244333]">
                <p className="text-sm font-medium truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-[#a1b8a8] truncate mt-1">
                  {currentUser.email}
                </p>
              </div>
              <Link
                href="/settings"
                onClick={() => setUserMenuOpen(false)}
                className={menuItem}
              >
                Profile &amp; Settings <Settings size={14} />
              </Link>
              <Link
                href="/portfolio"
                onClick={() => setUserMenuOpen(false)}
                className={menuItem}
              >
                My Public Portfolio <User size={14} />
              </Link>
              <Link
                href="/"
                onClick={() => setUserMenuOpen(false)}
                className={menuItem}
              >
                Sign Out <LogOut size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
