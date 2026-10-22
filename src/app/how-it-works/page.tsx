"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, Bot, Map, Code2, FileQuestion, UserCheck, Repeat, Sparkles } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "EXPLAIN — Conceptual Clarity",
      desc: "Begin with your hardest course concepts. Select your level and explanation style in Monday AI Tutor. Request analogies, worked mathematical proofs, or step-by-step algorithms grounded in lecture materials.",
      icon: Bot,
      route: "/tutor",
      btnText: "Try Monday AI Tutor",
    },
    {
      num: "02",
      title: "ROADMAPS — Structured W3Schools Paths",
      desc: "Accelerate your mastery through verified W3Schools syllabi and interactive Try-It-Yourself labs, advancing step-by-step from fundamental syntax to production architecture.",
      icon: Map,
      route: "/roadmaps",
      btnText: "Explore Roadmaps",
    },
    {
      num: "03",
      title: "EXPERIMENT — Sandboxed Coding",
      desc: "Transition to CodePlay. Write code in an isolated browser environment with live reload, instant error console, and Monday AI Copilot suggestions to see how theoretical logic runs under boundary conditions.",
      icon: Code2,
      route: "/codeplay",
      btnText: "Launch CodePlay",
    },
    {
      num: "04",
      title: "PRACTICE — Duolingo-Calibrated Challenges",
      desc: "Apply your skills to stage-by-stage engineering ladders. Advance through concept warmups, code fill-ins, algorithmic construction, and boss edge cases.",
      icon: Repeat,
      route: "/challenges",
      btnText: "View Challenges",
    },
    {
      num: "05",
      title: "TEST — QuizForge Assessment",
      desc: "Paste your notes or take teacher-assigned quizzes. QuizForge tests active recall under realistic time limits, highlights incorrect answers, and pinpoints your exact weak topics.",
      icon: FileQuestion,
      route: "/quizzes",
      btnText: "Generate Quiz",
    },
    {
      num: "06",
      title: "IMPROVE & SHOWCASE — Career Readiness",
      desc: "Feed test diagnostics into 4-week career roadmaps. Curate your best completed projects and uploaded ZIP codebases into a public portfolio for verified recruiter showcase.",
      icon: UserCheck,
      route: "/portfolio",
      btnText: "Build Portfolio",
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
              <span>The Learning Methodology</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              How CampusOS Accelerates Mastery
            </h1>
            <p className="mt-4 text-base sm:text-lg text-purple-100 font-medium leading-relaxed">
              A continuous loop from understanding theory to validating edge cases and demonstrating verified competence.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="flex flex-col md:flex-row items-start gap-6 p-6 sm:p-8 rounded-3xl border-2 border-purple-100 bg-white shadow-clay hover:border-brand-purple transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 text-brand-purple">
                  <Icon className="w-7 h-7" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-black text-brand-purple bg-purple-100 px-2 py-0.5 rounded-full">STEP {step.num}</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">{step.title}</h2>
                  </div>
                  <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                    {step.desc}
                  </p>
                  <div className="mt-5">
                    <Link href={step.route}>
                      <Button variant="primary" size="sm" className="font-bold shadow-md rounded-xl">
                        {step.btnText}
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
