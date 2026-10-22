"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import {
  Bot,
  Code2,
  FileQuestion,
  GraduationCap,
  Map,
  Trophy,
  UserCheck,
  Briefcase,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  Layers,
  Sparkles,
} from "lucide-react";

export default function FeaturesPage() {
  const featureList = [
    {
      category: "Campus Learn",
      title: "Contextual Monday AI Tutor",
      description:
        "Adaptive academic assistance that alters its pedagogical approach between beginner-friendly analogies, step-by-step algorithms, worked math derivations, and exam revision.",
      href: "/tutor",
      icon: Bot,
      color: "text-brand-purple",
    },
    {
      category: "Campus Learn",
      title: "C4School Skill Roadmaps",
      description:
        "Structured learning paths with authentic W3Schools curricula, interactive Try-It-Yourself code sandboxes, and milestone tracking from syntax to software engineering.",
      href: "/roadmaps",
      icon: Map,
      color: "text-brand-purple",
    },
    {
      category: "Campus Learn",
      title: "CodePlay IDE Lab",
      description:
        "An isolated frontend coding playground where students build HTML, CSS, and JS components safely with real-time preview, Monday AI copilot, and file uploads.",
      href: "/codeplay",
      icon: Code2,
      color: "text-brand-purple",
    },
    {
      category: "Campus Learn",
      title: "QuizForge Assessment Engine",
      description:
        "Transform lecture slides and course notes into timed or practice quizzes with instant grading, mistake review, and weak-topic breakdown.",
      href: "/quizzes",
      icon: FileQuestion,
      color: "text-brand-purple",
    },
    {
      category: "Faculty Tools",
      title: "Teacher Studio",
      description:
        "Empower instructors to draft AI-assisted questions from syllabus files, assign quizzes with time limits, inspect class performance, and export results to CSV.",
      href: "/teacher",
      icon: GraduationCap,
      color: "text-brand-purple",
    },
    {
      category: "Campus Grow",
      title: "Personalized Skill Roadmaps",
      description:
        "Structured 4-week tracks in Web Development, Data Analytics, UI/UX, and Marketing with weekly task checklists and practical milestones.",
      href: "/roadmaps",
      icon: Map,
      color: "text-brand-purple",
    },
    {
      category: "Campus Grow",
      title: "Practical Code Challenges",
      description:
        "Duolingo-style stage-by-stage engineering ladders covering concept warmups, fill-in-the-blank code, algorithmic construction, and boss edge cases.",
      href: "/challenges",
      icon: Trophy,
      color: "text-brand-purple",
    },
    {
      category: "Campus Grow",
      title: "Student Showcase Portfolio",
      description:
        "Curate completed challenge projects and ZIP codebases into a clean public portfolio with GitHub links, live demos, and granular visibility controls.",
      href: "/portfolio",
      icon: UserCheck,
      color: "text-brand-purple",
    },
    {
      category: "Campus Opportunities",
      title: "Opportunities & 12 Regional CVs",
      description:
        "Discover student internships, undergraduate fellowships, ICPC competitions, 12 verified regional CV templates, and Monday AI CV Auditor.",
      href: "/opportunities",
      icon: Briefcase,
      color: "text-brand-purple",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        {/* Main Hero Banner - Royal Purple Clay Card */}
        <div className="clay-card-purple p-8 sm:p-14 relative overflow-hidden text-white shadow-2xl rounded-3xl text-center mb-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[90px] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Complete Feature Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Everything You Need to Excel Academically
            </h1>
            <p className="mt-4 text-base sm:text-lg text-purple-100 font-medium leading-relaxed">
              Explore the complete suite of learning, teaching, and career readiness tools built into CampusOS.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="clay-card-purple p-7 flex flex-col justify-between rounded-3xl text-white shadow-xl hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 border border-white/25 relative overflow-hidden group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-sm">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-white/20 border border-white/30 text-white shadow-sm">
                      {f.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight">{f.title}</h3>
                  <p className="mt-3 text-white text-sm leading-relaxed font-medium">
                    {f.description}
                  </p>
                </div>
                <div className="pt-6 mt-auto">
                  <Link href={f.href}>
                    <Button
                      size="sm"
                      className="w-full justify-between font-black bg-white hover:bg-purple-50 text-brand-purple rounded-2xl shadow-lg border-none h-12 px-5 text-sm transition-all group-hover:shadow-xl"
                    >
                      <span className="text-brand-purple font-black">Launch Module</span>
                      <ArrowRight className="w-4 h-4 text-brand-purple group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
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
