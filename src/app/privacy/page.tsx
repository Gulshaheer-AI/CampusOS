"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { Shield, AlertTriangle, Lock, Eye, FileText, Trash2 } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Hero Banner - Royal Purple Clay Card */}
        <div className="clay-card-purple p-8 sm:p-12 relative overflow-hidden text-white shadow-xl rounded-3xl mb-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-200 bg-white/15 px-3 py-1 rounded-full mb-3">
              Legal &amp; Compliance
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-purple-100 font-medium">
              Last updated: October 2026 • Academic Year 2026-2027 Edition
            </p>
          </div>
        </div>

        {/* Legal Review Notice */}
        <div className="p-5 rounded-2xl border-2 border-amber-200 bg-amber-50 mb-8 flex items-start gap-3.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed font-medium">
            <strong className="text-amber-950 font-bold">Notice to Institutions and Administrators:</strong> This is a production draft privacy
            disclosure designed for the CampusOS learning architecture. Specific institutional deployments
            must undergo local legal review to ensure full compliance with regional regulations (such as FERPA in the
            United States, GDPR in the European Union, and relevant state or provincial student data privacy laws).
          </div>
        </div>

        <div className="space-y-8 text-sm text-slate-700 leading-relaxed font-medium bg-white border-2 border-purple-100 rounded-3xl p-6 sm:p-10 shadow-clay">
          <section className="space-y-3">
            <h2 className="text-xl font-black text-brand-purple flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-purple" />
              1. Our Foundational Privacy Commitments
            </h2>
            <p>
              CampusOS exists to empower student learning. We operate under four unwavering principles regarding student information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>We <strong>never sell</strong> student or faculty personal data to data brokers or third parties.</li>
              <li>We <strong>never display</strong> targeted advertisements on the platform.</li>
              <li>Student practice attempts, private study notes, and AI tutor conversations are <strong>confidential</strong> to the student unless explicitly submitted for course grading.</li>
              <li>Public portfolios display only what the student explicitly chooses to make public.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-brand-purple flex items-center gap-2">
              <Eye className="w-5 h-5 text-brand-purple" />
              2. Information We Collect
            </h2>
            <p>We collect only the minimum information necessary to provide active learning tools:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li><strong className="text-slate-900">Account Credentials:</strong> Name, university email address, institution affiliation, and degree/academic major.</li>
              <li><strong className="text-slate-900">Learning Activity:</strong> Quiz attempts, completed code challenges, roadmap milestones, and self-reported interests.</li>
              <li><strong className="text-slate-900">User Submissions:</strong> Source code written in CodePlay, challenge solutions, and uploaded study notes for quiz generation.</li>
              <li><strong className="text-slate-900">Technical Logs:</strong> IP address, browser user-agent, and anonymized performance telemetry to prevent abuse and ensure platform security.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-brand-purple flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              3. AI Processing &amp; Third-Party LLM Providers
            </h2>
            <p>
              When you interact with the AI Tutor or generate a quiz in QuizForge:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>Your prompts and uploaded excerpts are transmitted to upstream inference providers solely for generating immediate educational responses.</li>
              <li>Under our zero-data-retention agreements, customer prompts are <strong className="text-slate-900">not used to train or fine-tune public foundational models</strong>.</li>
              <li>Uploaded syllabus PDFs and slides are parsed in-memory or in isolated temporary storage and are never indexed into public search engines.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-brand-purple flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              4. Data Retention, Portability &amp; Account Deletion
            </h2>
            <p>
              Students and teachers retain full control of their data. In your account settings, you may:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>Export your complete portfolio and quiz completion history in JSON or PDF format.</li>
              <li>Clear your AI tutoring conversation history at any time with immediate effect.</li>
              <li>Request permanent account deletion. Upon confirmation, all associated private notes, attempts, and authentication records are permanently erased within 30 days.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-purple-100 pt-6">
            <h2 className="text-xl font-black text-brand-purple">5. Contact Our Privacy Officer</h2>
            <p>
              If you have questions about our student data practices or institutional compliance agreements, please reach out via our{" "}
              <Link href="/contact" className="text-brand-purple font-bold hover:underline">
                Contact Page
              </Link>{" "}
              or email <code className="text-brand-purple bg-purple-100 px-2 py-0.5 rounded font-mono font-bold">privacy@campusos.edu</code>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
