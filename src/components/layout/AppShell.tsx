"use client";

import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/store";
import { UserProfile, UserRole } from "@/types";
import { canAccessTeacherStudio } from "@/lib/permissions";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AppShellProps {
  children: React.ReactNode;
  requiredRole?: UserRole[];
}

export function AppShell({ children, requiredRole }: AppShellProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getCurrentUser());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const handleUserChange = (updated: UserProfile) => {
    setCurrentUser(updated);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-purple border-t-transparent animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Loading workspace...</span>
        </div>
      </div>
    );
  }

  // Role Guard Check
  const isUnauthorized =
    requiredRole && !requiredRole.includes(currentUser.role);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <AppSidebar
        userRole={currentUser.role}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="lg:pl-64 print:pl-0 print:m-0 flex flex-col flex-1">
        <AppHeader
          currentUser={currentUser}
          onUserChange={handleUserChange}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main
          key={currentUser.id}
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none"
        >
          {isUnauthorized ? (
            <div className="clay-card p-8 text-center max-w-lg mx-auto my-12 border-2 border-rose-300 bg-white">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 border border-rose-300 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-950">Access Restricted</h3>
              <p className="text-sm text-slate-700 font-medium mt-2">
                This area requires <strong>{requiredRole.join(" or ")}</strong> privileges.
                You are currently logged in as <strong className="text-brand-purple font-bold">{currentUser.role}</strong> ({currentUser.name}).
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                >
                  Return to Dashboard
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    handleUserChange(getCurrentUser());
                  }}
                >
                  Switch Role in Header
                </Button>
              </div>
            </div>
          ) : (
            children
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
