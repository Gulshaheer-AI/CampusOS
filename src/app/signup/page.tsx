"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { setCurrentUser } from "@/lib/store";
import { UserRole, UserProfile } from "@/types";
import {
  Sparkles,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("student");
  const [degree, setDegree] = useState("");
  const [department, setDepartment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters)");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid university or personal email");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        role,
        degree:
          degree.trim() ||
          (role === "student" ? "B.S. in Computer Science" : "Ph.D."),
        department: department.trim() || "Computer Science",
        interests: ["Algorithms", "Web Development", "AI Systems"],
        themePreference: "dark",
        emailNotifications: true,
        learningPace: "regular",
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(newUser);
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-900">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-200/50 blur-[120px] pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Logo size="lg" showTagline={true} />
        <h2 className="mt-6 text-2xl sm:text-3xl font-black text-brand-purple tracking-tight">
          Create Your Free Account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-bold text-brand-purple hover:underline"
          >
            Sign in to existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white border-2 border-purple-100 py-8 px-6 sm:px-10 shadow-clay rounded-3xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="fullname"
                className="block text-xs font-bold uppercase text-slate-700 mb-1"
              >
                Full Name *
              </label>
              <input
                id="fullname"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="w-full bg-white border-2 border-purple-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner font-medium"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase text-slate-700 mb-1"
              >
                University Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.chen@university.edu"
                className="w-full bg-white border-2 border-purple-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="role-select"
                  className="block text-xs font-bold uppercase text-slate-700 mb-1"
                >
                  Primary Role
                </label>
                <select
                  id="role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-white border-2 border-purple-100 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner font-medium"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Faculty / Instructor</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="dept"
                  className="block text-xs font-bold uppercase text-slate-700 mb-1"
                >
                  Department
                </label>
                <input
                  id="dept"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Computer Science"
                  className="w-full bg-white border-2 border-purple-100 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner font-medium"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase text-slate-700 mb-1"
              >
                Create Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-white border-2 border-purple-100 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-brand-purple"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="clay-button-primary bg-[#153e25] text-white font-black w-full mt-2 py-2.5 rounded-xl shadow-md border-none"
              isLoading={isLoading}
            >
              Start Learning Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <p className="text-[11px] text-slate-600 text-center leading-normal font-medium">
            By signing up, you agree to our{" "}
            <Link
              href="/terms"
              className="text-brand-purple font-bold hover:underline"
            >
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-brand-purple font-bold hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
