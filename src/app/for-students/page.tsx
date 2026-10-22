"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Sparkles,
  Bot,
  Compass,
  Code2,
  FileQuestion,
  Map,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Briefcase,
} from "lucide-react";

export default function ForStudentsPage() {
  const studentJourney = [
    {
      time: "8:00 PM — Study Block",
      title: "Unblocked on Complex Theory",
      desc: "Stuck on why an algorithm needs O(log N) rather than O(N)? Paste your course notes into Monday AI Tutor and request a worked visual step-through.",
    },
    {
      time: "9:00 PM — Active Coding",
      title: "Experimenting in CodePlay",
      desc: "Implement the algorithm in CodePlay without setting up a local development environment. Inspect runtime outputs and fix boundary bugs.",
    },
    {
      time: "9:45 PM — Exam Validation",
      title: "Targeted Self-Testing",
      desc: "Generate a 5-question mock quiz on the exact lecture topic. Identify weak topics before they show up on your midterm exam.",
    },
    {
      time: "Weekend — Career Progress",
      title: "Building Portfolio Proof",
      desc: "Complete a challenge from your Web Development Roadmap. Add it to your public CampusOS portfolio with live demos, ZIP files, and repository links.",
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
              <span>For University Students</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              From Confusing Lectures to Career-Ready Confidence
            </h1>
            <p className="mt-4 text-base sm:text-lg text-purple-100 font-medium leading-relaxed">
              Everything you need to master your university coursework, build real projects, and land top opportunities.
            </p>
            <div className="mt-8">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-brand-purple hover:bg-purple-50 font-black shadow-xl border-none text-base px-8 h-12">
                  Launch Student Workspace
                  <ArrowRight className="w-5 h-5 ml-2 text-brand-purple" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="clay-card-purple p-7 rounded-3xl text-white shadow-xl hover:scale-[1.02] transition-all duration-300 border border-white/25 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center mb-4 shadow-sm">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Never Get Stuck in Solitude</h3>
              <p className="mt-3 text-sm text-white leading-relaxed font-medium">
                When office hours are days away, Monday AI Tutor is available instantly to clarify lecture slides,
                suggest analogies, and walk through homework derivations.
              </p>
            </div>
          </div>

          <div className="clay-card-purple p-7 rounded-3xl text-white shadow-xl hover:scale-[1.02] transition-all duration-300 border border-white/25 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center mb-4 shadow-sm">
                <FileQuestion className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Prepare Before Exams</h3>
              <p className="mt-3 text-sm text-white leading-relaxed font-medium">
                Generate customized practice quizzes from uploaded PDF syllabi and class notes. Get immediate
                feedback on mistakes and an analysis of your weak topics.
              </p>
            </div>
          </div>

          <div className="clay-card-purple p-7 rounded-3xl text-white shadow-xl hover:scale-[1.02] transition-all duration-300 border border-white/25 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center mb-4 shadow-sm">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">A Verified Project Portfolio</h3>
              <p className="mt-3 text-sm text-white leading-relaxed font-medium">
                Show hiring managers working code rather than just a list of course codes on your resume.
                Curate a shareable profile highlighting your best solutions and codebase ZIPs.
              </p>
            </div>
          </div>
        </div>

        {/* Sample Student Journey */}
        <div className="bg-purple-50/50 border-2 border-purple-100 rounded-3xl p-8 sm:p-12 mb-16 shadow-clay">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-purple">A Day in the Life on CampusOS</h2>
            <p className="mt-2 text-sm text-slate-600 font-medium">
              See how students like Ahmad, Hassan, and Zain use CampusOS to study, build, and level up.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studentJourney.map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl border-2 border-purple-100 bg-white shadow-sm">
                <div className="flex items-center gap-2 text-xs font-mono font-black text-brand-purple mb-2">
                  <Clock className="w-4 h-4 text-brand-purple" />
                  <span>{item.time}</span>
                </div>
                <h3 className="text-base font-black text-slate-900">{item.title}</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/dashboard">
            <Button size="lg" variant="primary" className="font-black px-8 shadow-xl">
              Start Your Free Student Session
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
