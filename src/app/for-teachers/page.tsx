"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  GraduationCap,
  FileQuestion,
  Users,
  BarChart3,
  Download,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Sparkles,
} from "lucide-react";

export default function ForTeachersPage() {
  const capabilities = [
    {
      icon: FileQuestion,
      title: "AI-Drafted Question Banks",
      desc: "Upload lecture slides or past exam guidelines. Generate draft multiple-choice and short-answer questions. Every AI question is held in draft status until you review, edit, and approve it.",
    },
    {
      icon: Users,
      title: "Classroom Code Enrollment",
      desc: "Create courses (e.g. CS101, WEB210) and generate shareable enrollment codes. Students join your roster securely without tedious manual invitation lists.",
    },
    {
      icon: BarChart3,
      title: "Misconception & Cohort Analytics",
      desc: "Identify which questions and underlying topics tripped up Ahmad, Hassan, or Zain, enabling targeted review in your very next lecture.",
    },
    {
      icon: Download,
      title: "Instant Grade Export to CSV",
      desc: "Export completed student attempts, scores, and completion timestamps in standard CSV format, ready for direct import into Canvas, Blackboard, or Excel.",
    },
    {
      icon: ShieldCheck,
      title: "Academic Integrity & Timer Controls",
      desc: "Configure strict exam countdown timers, limit attempt counts, and keep answer keys securely hidden on the server until submission is completed.",
    },
    {
      icon: BookOpen,
      title: "Integrated Syllabus Repository",
      desc: "Attach course PDFs and reference notes directly to modules. Students can query Monday AI with questions grounded specifically in your shared readings.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        {/* Main Hero Banner - Royal Purple Clay Card */}
        <div className="clay-card-purple p-8 sm:p-14 relative overflow-hidden text-white shadow-2xl rounded-3xl text-center mb-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[90px] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>For University Faculty &amp; Instructors</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Save Hours on Assessment Design While Improving Student Outcomes
            </h1>
            <p className="mt-4 text-base sm:text-lg text-purple-100 font-medium leading-relaxed">
              A purpose-built academic studio allowing professors and teaching assistants to create rich
              interactive quizzes, track cohort learning gaps, and deliver high-touch feedback.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/teacher">
                <Button size="lg" className="bg-white text-brand-purple hover:bg-purple-50 font-black shadow-xl border-none text-base px-8 h-12">
                  Open Teacher Studio
                  <ArrowRight className="w-5 h-5 ml-2 text-brand-purple" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="clay-card-purple p-7 rounded-3xl text-white shadow-xl hover:scale-[1.02] transition-all duration-300 border border-white/25 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center mb-4 shadow-sm">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight">{cap.title}</h3>
                  <p className="mt-3 text-xs sm:text-sm text-white leading-relaxed font-medium">
                    {cap.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Teacher Workflow Banner */}
        <div className="p-8 sm:p-12 rounded-3xl border-2 border-purple-100 bg-purple-50/50 shadow-clay mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-xs font-black uppercase tracking-wider text-brand-purple">
              Teacher Assessment Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              How Faculty Create and Distribute Quizzes
            </h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
              <div className="p-5 rounded-2xl bg-white border-2 border-purple-100 shadow-sm">
                <div className="text-xs font-mono font-black text-brand-purple mb-1">01. UPLOAD</div>
                <div className="text-sm font-black text-slate-900">Attach Material</div>
                <div className="text-xs text-slate-600 mt-1 font-medium">Provide lecture notes or syllabus excerpt</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border-2 border-purple-100 shadow-sm">
                <div className="text-xs font-mono font-black text-brand-purple mb-1">02. GENERATE</div>
                <div className="text-sm font-black text-slate-900">AI Drafts Bank</div>
                <div className="text-xs text-slate-600 mt-1 font-medium">Review, reword, or add manual questions</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border-2 border-purple-100 shadow-sm">
                <div className="text-xs font-mono font-black text-brand-purple mb-1">03. ASSIGN</div>
                <div className="text-sm font-black text-slate-900">Set Guardrails</div>
                <div className="text-xs text-slate-600 mt-1 font-medium">Set countdown timer, deadlines, passing %</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border-2 border-purple-100 shadow-sm">
                <div className="text-xs font-mono font-black text-brand-purple mb-1">04. ANALYZE</div>
                <div className="text-sm font-black text-slate-900">Inspect Gaps</div>
                <div className="text-xs text-slate-600 mt-1 font-medium">Export CSV grades and view weak topics</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/teacher">
            <Button size="lg" variant="primary" className="font-black px-8 shadow-xl">
              Try Teacher Studio Demo Now
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
