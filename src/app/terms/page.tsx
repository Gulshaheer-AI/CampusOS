"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, BookCheck, ShieldAlert, Code, UserX } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Hero Banner - Royal Purple Clay Card */}
        <div className="clay-card-purple p-8 sm:p-12 relative overflow-hidden text-white shadow-xl rounded-3xl mb-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-200 bg-white/15 px-3 py-1 rounded-full mb-3">
              Terms of Service
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Terms of Use &amp; Academic Honor Code
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-purple-100 font-medium">
              Effective as of October 2026 • Academic Year 2026-2027 Edition
            </p>
          </div>
        </div>

        {/* Legal Review Notice */}
        <div className="p-5 rounded-2xl border-2 border-amber-200 bg-amber-50 mb-8 flex items-start gap-3.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed font-medium">
            <strong className="text-amber-950 font-bold">Institutional Advisory:</strong> This terms agreement sets forth expectations regarding
            academic honesty, code sandbox safety, and platform intellectual property. Institutional license agreements
            may include customized addenda governed by your university&apos;s specific charter.
          </div>
        </div>

        <div className="space-y-8 text-sm text-slate-700 leading-relaxed font-medium bg-white border-2 border-purple-100 rounded-3xl p-6 sm:p-10 shadow-clay">
          <section className="space-y-3">
            <h2 className="text-xl font-black text-brand-purple flex items-center gap-2">
              <BookCheck className="w-5 h-5 text-brand-purple" />
              1. Educational Purpose &amp; Academic Integrity
            </h2>
            <p>
              CampusOS is built to help students comprehend complex technical topics, practice real coding,
              and prepare for future engineering careers. You agree to use the platform in full compliance with your
              university&apos;s academic honor code:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>
                <strong className="text-slate-900">No Proctored Exam Fraud:</strong> You may not use the AI Tutor, CodePlay, or QuizForge to
                cheat during closed-book, proctored university examinations.
              </li>
              <li>
                <strong className="text-slate-900">Attribution:</strong> When using CodePlay or challenge solutions as part of university coursework,
                you must disclose AI-assisted code generation if required by your instructor&apos;s syllabus.
              </li>
              <li>
                <strong className="text-slate-900">Faculty Rights:</strong> Instructors maintain the sole prerogative to establish assessment policies
                for quizzes assigned within their classroom roster.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-brand-purple flex items-center gap-2">
              <Code className="w-5 h-5 text-brand-purple" />
              2. Safe Use of the CodePlay Playground
            </h2>
            <p>
              The CodePlay environment is an educational sandbox designed for client-side web development experimentation.
              The following actions are strictly prohibited:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>Deploying cryptocurrency miners, port scanners, denial-of-service scripts, or botnet clients.</li>
              <li>Attempting to break out of sandboxed iframe boundaries or execute unauthorized cross-origin attacks against the host domain.</li>
              <li>Hosting phishing pages, credential harvesters, or deceptive login overlays.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-brand-purple flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-600" />
              3. Intellectual Property Ownership
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>
                <strong className="text-slate-900">Student Code &amp; Work:</strong> You retain full copyright and ownership of all code, projects, and
                challenge submissions you create on CampusOS.
              </li>
              <li>
                <strong className="text-slate-900">Platform Material:</strong> The CampusOS wordmark, user interface designs, interactive learning labs,
                and proprietary curricula remain the intellectual property of CampusOS.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-brand-purple flex items-center gap-2">
              <UserX className="w-5 h-5 text-rose-600" />
              4. Account Termination &amp; Abuse
            </h2>
            <p>
              We reserve the right to suspend or terminate accounts that engage in harassment, academic misconduct,
              unauthorized system probing, or intentional service disruption.
            </p>
          </section>

          <section className="space-y-3 border-t border-purple-100 pt-6">
            <h2 className="text-xl font-black text-brand-purple">5. Governing Law</h2>
            <p>
              These terms are governed by standard commercial and educational service guidelines. Questions may be
              directed through our{" "}
              <Link href="/contact" className="text-brand-purple font-bold hover:underline">
                Contact Form
              </Link>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
