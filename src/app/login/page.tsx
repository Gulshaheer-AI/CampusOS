"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { switchRole, setCurrentUser } from "@/lib/store";
import { DEMO_USERS } from "@/lib/demo-data";
import { UserRole } from "@/types";
import {
  Sparkles,
  GraduationCap,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = (role: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      switchRole(role);
      router.push("/dashboard");
    }, 400);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid university or personal email address");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // In demo mode without external auth provider configured, create session
      const baseUser = DEMO_USERS[selectedRole];
      const customUser = {
        ...baseUser,
        email: email.trim(),
      };
      setCurrentUser(customUser);
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-900">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-200/50 blur-[120px] pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Logo size="lg" showTagline={true} />
        <h2 className="mt-6 text-2xl sm:text-3xl font-black text-brand-purple tracking-tight">
          Sign In to Your Workspace
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium">
          Or{" "}
          <Link href="/signup" className="font-bold text-brand-purple hover:underline">
            create a new student or faculty account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white border-2 border-purple-100 py-8 px-6 sm:px-10 shadow-clay rounded-3xl space-y-6">
          {/* Quick Demo Selector */}
          <div className="p-4 rounded-2xl border-2 border-purple-100 bg-purple-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-purple flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
                Instant Demo Access
              </span>
              <Badge variant="purple" className="text-[10px]">1-Click Login</Badge>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Select any role to test full platform capabilities immediately:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs py-1.5 font-bold border-purple-200 text-slate-800 hover:bg-purple-100"
                onClick={() => handleDemoLogin("student")}
              >
                Student
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs py-1.5 font-bold text-brand-purple border-purple-300 hover:bg-purple-100"
                onClick={() => handleDemoLogin("teacher")}
              >
                Teacher
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs py-1.5 font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
                onClick={() => handleDemoLogin("admin")}
              >
                Admin
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-500 font-bold">
                Or Sign In with Credentials
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase text-slate-700 mb-1">
                University Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full bg-white border-2 border-purple-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner font-medium"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-purple-100 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-brand-purple"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="role-select" className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Account Role
              </label>
              <select
                id="role-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full bg-white border-2 border-purple-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner font-medium"
              >
                <option value="student">Student Account</option>
                <option value="teacher">Instructor / Faculty Account</option>
                <option value="admin">Platform Administrator</option>
              </select>
            </div>

            <Button
              type="submit"
              className="clay-button-primary bg-[#6653E6] text-white font-black w-full py-2.5 rounded-xl shadow-md border-none"
              isLoading={isLoading}
            >
              Sign In to CampusOS
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
